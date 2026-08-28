"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Toda ação de gestão passa por aqui: sem admin, nada acontece. */
async function exigirAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") throw new Error("Sem permissão");
  return { user };
}

/* ------------------------------------------------- capítulos / vídeo */
export async function salvarCapitulo(
  chapter: number,
  dados: { video_url?: string; video_provider?: string; nota_admin?: string; publicado?: boolean },
) {
  const { user } = await exigirAdmin();
  const admin = createAdminClient();

  const url = dados.video_url?.trim() ?? "";
  if (url && !/^https:\/\//i.test(url)) {
    return { ok: false as const, erro: "A URL do vídeo precisa começar com https://" };
  }

  const { error } = await admin.from("chapter_settings").upsert({
    chapter,
    video_url: url || null,
    video_provider: dados.video_provider || detectarProvider(url),
    nota_admin: dados.nota_admin?.trim() || null,
    publicado: dados.publicado ?? true,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "chapter" });

  if (error) return { ok: false as const, erro: error.message };

  revalidatePath("/admin/capitulos");
  revalidatePath(`/dia/${chapter}`);
  return { ok: true as const };
}

function detectarProvider(url: string): string | null {
  if (!url) return null;
  if (/youtu\.?be/.test(url)) return "youtube";
  if (/vimeo/.test(url)) return "vimeo";
  if (/pandavideo|player-vz/.test(url)) return "panda";
  if (/\.(mp4|webm|mov)$/i.test(url)) return "mp4";
  return null;
}

/* ------------------------------------------------------- assinantes */
export async function reenviarSenha(email: string) {
  await exigirAdmin();
  const admin = createAdminClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?tipo=recovery`,
  });
  if (error) return { ok: false as const, erro: error.message };
  return { ok: true as const, mensagem: `Link de redefinição enviado para ${email}.` };
}

export async function reenviarConfirmacao(email: string) {
  await exigirAdmin();
  const admin = createAdminClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { error } = await admin.auth.resend({
    type: "signup", email, options: { emailRedirectTo: `${site}/auth/callback` },
  });
  if (error) return { ok: false as const, erro: error.message };
  return { ok: true as const, mensagem: `Confirmação reenviada para ${email}.` };
}

/** Concede ou revoga acesso manualmente — cortesia, suporte, reembolso. */
export async function definirAcesso(userId: string, email: string, ativo: boolean) {
  await exigirAdmin();
  const admin = createAdminClient();

  const existente = await admin.from("subscriptions").select("id").eq("user_id", userId).maybeSingle();
  const registro = {
    user_id: userId,
    email,
    status: ativo ? ("active" as const) : ("canceled" as const),
    current_period_end: ativo
      ? new Date(Date.now() + 365 * 86_400_000).toISOString()
      : new Date().toISOString(),
    canceled_at: ativo ? null : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = existente.data?.id
    ? await admin.from("subscriptions").update(registro).eq("id", existente.data.id)
    : await admin.from("subscriptions").insert(registro);

  if (error) return { ok: false as const, erro: error.message };
  revalidatePath("/admin/assinantes");
  return { ok: true as const, mensagem: ativo ? "Acesso liberado." : "Acesso revogado." };
}

export async function definirPapel(userId: string, admin_: boolean) {
  await exigirAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles")
    .update({ role: admin_ ? "admin" : "user" }).eq("id", userId);
  if (error) return { ok: false as const, erro: error.message };
  revalidatePath("/admin/assinantes");
  return { ok: true as const, mensagem: admin_ ? "Agora é administrador." : "Voltou a ser usuário." };
}

/** Reinicia a jornada — o relógio dos 30 dias volta ao Dia 1. */
export async function reiniciarJornada(userId: string) {
  await exigirAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("journeys")
    .update({ started_at: new Date().toISOString(), streak_atual: 0 })
    .eq("user_id", userId);
  if (error) return { ok: false as const, erro: error.message };
  revalidatePath("/admin/assinantes");
  return { ok: true as const, mensagem: "Jornada reiniciada no Dia 1." };
}

/* ---------------------------------------------------- configurações */
export async function salvarConfig(key: string, value: Record<string, unknown>) {
  await exigirAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { ok: false as const, erro: error.message };
  revalidatePath("/admin/config");
  revalidatePath("/assinatura");
  return { ok: true as const };
}
