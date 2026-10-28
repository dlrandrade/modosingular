/* O que o estúdio pede ao aparelho: o service worker próprio (instalar como
   app, abrir sem rede), a inscrição para notificações e o selo no ícone. */

let registro: Promise<ServiceWorkerRegistration | null> | null = null;

/** Registra /estudio-sw.js com escopo /estudio (mais específico que o do PWA, então é ele que cuida destas páginas). */
export function registrarSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return Promise.resolve(null);
  registro ??= navigator.serviceWorker.register("/estudio-sw.js", { scope: "/estudio" }).catch(() => null);
  return registro;
}

async function ativo(reg: ServiceWorkerRegistration): Promise<void> {
  if (reg.active) return;
  const sw = reg.installing || reg.waiting;
  if (!sw) return;
  await new Promise<void>((ok) => {
    const ver = () => { if (sw.state === "activated") { sw.removeEventListener("statechange", ver); ok(); } };
    sw.addEventListener("statechange", ver);
    setTimeout(ok, 8000);
  });
}

function chaveBytes(b64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const AVISAR = "estudio-avisar";

export function podeAvisar(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "PushManager" in window && "serviceWorker" in navigator;
}

export function querAvisos(): boolean {
  try { return podeAvisar() && Notification.permission === "granted" && localStorage.getItem(AVISAR) === "1"; } catch { return false; }
}

/** Pede permissão (se preciso) e devolve a inscrição deste aparelho. pedir=false: só se já houver permissão. */
export async function inscricao(pedir: boolean): Promise<PushSubscriptionJSON | null> {
  if (!podeAvisar()) return null;
  if (Notification.permission !== "granted") {
    if (!pedir) return null;
    if ((await Notification.requestPermission()) !== "granted") return null;
  }
  const reg = await registrarSW();
  if (!reg) return null;
  await ativo(reg);
  const r = await fetch("/api/estudio/push", { cache: "no-store" });
  if (!r.ok) return null;
  const { chave } = (await r.json()) as { chave: string };
  const opcoes = { userVisibleOnly: true, applicationServerKey: chaveBytes(chave) };
  let sub = await reg.pushManager.getSubscription();
  try {
    sub ??= await reg.pushManager.subscribe(opcoes);
  } catch {
    // inscrição antiga com outra chave: troca
    await sub?.unsubscribe().catch(() => {});
    sub = await reg.pushManager.subscribe(opcoes).catch(() => null);
  }
  if (sub) try { localStorage.setItem(AVISAR, "1"); } catch { /* sem armazenamento local */ }
  return sub ? sub.toJSON() : null;
}

/** O selo no ícone do app instalado (onde houver suporte). */
export function selo(n: number) {
  const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (n > 0) nav.setAppBadge?.(n).catch(() => {});
  else nav.clearAppBadge?.().catch(() => {});
}
