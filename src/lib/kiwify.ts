import crypto from "node:crypto";

/* ---------------------------------------------------------------------
   Integração Kiwify — assinatura Modo Singular (R$ 19,90/mês)

   Webhook: a Kiwify assina o corpo cru com HMAC-SHA1 usando o token do
   webhook, e envia a assinatura na query string (?signature=...).
   O token sai no painel da Kiwify ao criar o webhook.

   API pública: OAuth client_credentials + header x-kiwify-account-id.
--------------------------------------------------------------------- */

export const PRECO_CENTS = 1990;

/** Compara em tempo constante — evita vazar informação por timing. */
export function assinaturaValida(corpoCru: string, assinatura: string | null): boolean {
  const token = process.env.KIWIFY_WEBHOOK_TOKEN;
  if (!token || !assinatura) return false;

  const esperada = crypto.createHmac("sha1", token).update(corpoCru).digest("hex");
  const a = Buffer.from(esperada, "utf8");
  const b = Buffer.from(assinatura.trim().toLowerCase(), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* --------------------------- mapa de status ------------------------ */

export type StatusInterno =
  | "none" | "trialing" | "active" | "past_due" | "canceled" | "refunded" | "expired";

/**
 * Traduz o estado da Kiwify para o nosso enum.
 * A Kiwify varia a nomenclatura entre `order_status`, `subscription.status`
 * e `webhook_event_type`; cobrimos as três formas.
 */
export function traduzirStatus(payload: KiwifyPayload): StatusInterno {
  const evento = String(payload.webhook_event_type ?? "").toLowerCase();
  const pedido = String(payload.order_status ?? "").toLowerCase();
  const assin = String(payload.Subscription?.status ?? payload.subscription?.status ?? "").toLowerCase();

  if (evento.includes("refund") || pedido === "refunded") return "refunded";
  if (evento.includes("chargeback")) return "refunded";
  if (assin === "canceled" || evento.includes("canceled") || evento.includes("subscription_canceled"))
    return "canceled";
  if (assin === "waiting_payment" || pedido === "waiting_payment" || evento.includes("late"))
    return "past_due";
  if (assin === "active" || pedido === "paid" || evento.includes("approved") || evento.includes("renewed"))
    return "active";
  if (assin === "trialing" || evento.includes("trial")) return "trialing";
  if (assin === "expired") return "expired";
  return "none";
}

export interface KiwifyPayload {
  order_id?: string;
  order_status?: string;
  webhook_event_type?: string;
  Customer?: { email?: string; full_name?: string; CPF?: string; id?: string };
  customer?: { email?: string; full_name?: string; id?: string };
  Subscription?: { id?: string; status?: string; next_payment?: string; charges?: unknown };
  subscription?: { id?: string; status?: string; next_payment?: string };
  Product?: { product_id?: string; product_name?: string };
  [k: string]: unknown;
}

export function extrairEmail(p: KiwifyPayload): string | null {
  const e = p.Customer?.email ?? p.customer?.email;
  return e ? String(e).trim().toLowerCase() : null;
}

export function extrairFimPeriodo(p: KiwifyPayload): string | null {
  const d = p.Subscription?.next_payment ?? p.subscription?.next_payment;
  if (!d) return null;
  const parsed = new Date(String(d));
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/* ----------------------------- API pública ------------------------- */

let cache: { token: string; expira: number } | null = null;

export async function tokenKiwify(): Promise<string | null> {
  const id = process.env.KIWIFY_CLIENT_ID;
  const secret = process.env.KIWIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (cache && cache.expira > Date.now() + 30_000) return cache.token;

  const r = await fetch("https://public-api.kiwify.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: id, client_secret: secret }),
    cache: "no-store",
  });
  if (!r.ok) return null;

  const j = (await r.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) return null;
  cache = { token: j.access_token, expira: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return cache.token;
}

/** Consulta uma assinatura na API da Kiwify (usado pelo admin para reconciliar). */
export async function buscarAssinatura(subscriptionId: string) {
  const token = await tokenKiwify();
  const accountId = process.env.KIWIFY_ACCOUNT_ID;
  if (!token || !accountId) return null;

  const r = await fetch(`https://public-api.kiwify.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}`, "x-kiwify-account-id": accountId },
    cache: "no-store",
  });
  return r.ok ? r.json() : null;
}
