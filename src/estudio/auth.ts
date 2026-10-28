import { createHash, timingSafeEqual } from "node:crypto";

/* ---------------------------------------------------------------
   Acesso ao /estudio: uma senha só, guardada como cookie httpOnly.
   A senha vem de ESTUDIO_SENHA (Vercel → Settings → Environment
   Variables). Sem ela, vale a senha padrão combinada com o dono.
   O cookie guarda um hash, nunca a senha; trocar a senha derruba
   todas as sessões abertas.
--------------------------------------------------------------- */

export const COOKIE = "estudio";
export const VALIDADE_S = 60 * 60 * 24 * 30;

function senha(): string {
  return process.env.ESTUDIO_SENHA?.trim() || "190221";
}

function hash(t: string): Buffer {
  return createHash("sha256").update(`estudio-singular:${t}`).digest();
}

export function token(): string {
  return hash(senha()).toString("hex");
}

export function senhaConfere(tentativa: string): boolean {
  return timingSafeEqual(hash(tentativa.trim()), hash(senha()));
}

export function cookieValido(valor: string | undefined): boolean {
  if (!valor) return false;
  const a = Buffer.from(valor);
  const b = Buffer.from(token());
  return a.length === b.length && timingSafeEqual(a, b);
}
