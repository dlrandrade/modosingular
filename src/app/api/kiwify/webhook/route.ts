import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  assinaturaValida, traduzirStatus, extrairEmail, extrairFimPeriodo,
  PRECO_CENTS, type KiwifyPayload,
} from "@/lib/kiwify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // O corpo CRU é obrigatório: o HMAC é calculado sobre ele, não sobre o JSON reserializado.
  const cru = await req.text();
  const assinatura = req.nextUrl.searchParams.get("signature");
  const ok = assinaturaValida(cru, assinatura);

  let payload: KiwifyPayload;
  try {
    payload = JSON.parse(cru) as KiwifyPayload;
  } catch {
    return NextResponse.json({ erro: "json_invalido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const email = extrairEmail(payload);
  const subId = payload.Subscription?.id ?? payload.subscription?.id ?? null;

  // Registra sempre — inclusive o que falhou a assinatura, para auditoria.
  const { data: evento } = await supabase.from("kiwify_events").insert({
    event_type: payload.webhook_event_type ?? payload.order_status ?? null,
    order_id: payload.order_id ?? null,
    subscription_id: subId,
    email,
    signature_ok: ok,
    payload,
  }).select("id").single();

  if (!ok) {
    return NextResponse.json({ erro: "assinatura_invalida" }, { status: 401 });
  }
  if (!email) {
    await marcarErro(supabase, evento?.id, "sem_email");
    return NextResponse.json({ erro: "sem_email" }, { status: 400 });
  }

  const status = traduzirStatus(payload);
  const fimPeriodo = extrairFimPeriodo(payload);

  // Liga ao usuário se ele já tiver conta; senão, o trigger claim_subscription_by_email
  // faz a ligação assim que ele se cadastrar com o mesmo e-mail.
  const { data: perfil } = await supabase
    .from("profiles").select("id").ilike("email", email).maybeSingle();

  const registro = {
    email,
    user_id: perfil?.id ?? null,
    status,
    price_cents: PRECO_CENTS,
    kiwify_order_id: payload.order_id ?? null,
    kiwify_subscription_id: subId,
    kiwify_customer_id: payload.Customer?.id ?? payload.customer?.id ?? null,
    current_period_end: fimPeriodo,
    canceled_at: status === "canceled" ? new Date().toISOString() : null,
    started_at: status === "active" ? new Date().toISOString() : null,
    raw: payload as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };

  // Upsert por user_id quando existe; por e-mail quando a compra veio antes do cadastro.
  const existente = perfil?.id
    ? await supabase.from("subscriptions").select("id").eq("user_id", perfil.id).maybeSingle()
    : await supabase.from("subscriptions").select("id").ilike("email", email).maybeSingle();

  const { error } = existente.data?.id
    ? await supabase.from("subscriptions").update(registro).eq("id", existente.data.id)
    : await supabase.from("subscriptions").insert(registro);

  if (error) {
    await marcarErro(supabase, evento?.id, error.message);
    return NextResponse.json({ erro: "falha_ao_gravar" }, { status: 500 });
  }

  if (evento?.id) {
    await supabase.from("kiwify_events")
      .update({ processed_at: new Date().toISOString() }).eq("id", evento.id);
  }

  return NextResponse.json({ ok: true, status });
}

async function marcarErro(
  supabase: ReturnType<typeof createAdminClient>,
  id: string | undefined,
  erro: string,
) {
  if (!id) return;
  await supabase.from("kiwify_events")
    .update({ error: erro, processed_at: new Date().toISOString() }).eq("id", id);
}

/** Health-check para conferir a URL configurada no painel da Kiwify. */
export async function GET() {
  return NextResponse.json({
    servico: "webhook kiwify · modo singular",
    configurado: Boolean(process.env.KIWIFY_WEBHOOK_TOKEN),
  });
}
