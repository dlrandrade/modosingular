import webpush, { type PushSubscription } from "web-push";
import { armazemDisponivel, ler, salvar } from "./armazem";

/* ---------------------------------------------------------------
   Notificação "o estúdio terminou" (Web Push).

   As chaves VAPID nascem aqui, no primeiro uso, e ficam guardadas no
   armazém (config/vapid.json); ESTUDIO_VAPID_PUBLICA e
   ESTUDIO_VAPID_PRIVADA, se existirem na Vercel, têm prioridade.
   Cada geração leva junto a inscrição do aparelho que pediu, então
   não há lista de inscritos para manter.

   No iPhone, a notificação só chega com o estúdio instalado na tela
   de início (Compartilhar → Adicionar à Tela de Início).
--------------------------------------------------------------- */

type Chaves = { publica: string; privada: string };
let chaves: Promise<Chaves | null> | null = null;

export function chavesVapid(): Promise<Chaves | null> {
  chaves ??= (async () => {
    const pub = process.env.ESTUDIO_VAPID_PUBLICA?.trim(), priv = process.env.ESTUDIO_VAPID_PRIVADA?.trim();
    if (pub && priv) return { publica: pub, privada: priv };
    if (!armazemDisponivel()) return null;
    const guardadas = await ler<Chaves>("config/vapid.json");
    if (guardadas?.publica && guardadas.privada) return guardadas;
    const novas = webpush.generateVAPIDKeys();
    const c = { publica: novas.publicKey, privada: novas.privateKey };
    await salvar("config/vapid.json", c);
    return c;
  })().catch(() => { chaves = null; return null; });
  return chaves;
}

export function inscricaoValida(x: unknown): x is PushSubscription {
  const s = x as PushSubscription;
  return !!s && typeof s.endpoint === "string" && /^https:\/\//.test(s.endpoint) && typeof s.keys?.p256dh === "string" && typeof s.keys?.auth === "string";
}

/** Envia a notificação; falha em silêncio (o resultado já está salvo e aparece ao voltar). */
export async function avisar(inscricao: unknown, titulo: string, corpo: string, url: string): Promise<void> {
  if (!inscricaoValida(inscricao)) return;
  const c = await chavesVapid();
  if (!c) return;
  try {
    await webpush.sendNotification(inscricao, JSON.stringify({ titulo, corpo, url }), {
      vapidDetails: { subject: "https://modosingular.vercel.app/estudio", publicKey: c.publica, privateKey: c.privada },
      TTL: 60 * 60 * 6, urgency: "high",
    });
  } catch {
    /* inscrição vencida ou recusada: nada a fazer */
  }
}
