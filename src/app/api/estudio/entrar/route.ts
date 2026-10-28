import { NextResponse } from "next/server";
import { COOKIE, VALIDADE_S, senhaConfere, token } from "@/estudio/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { senha } = (await req.json().catch(() => ({}))) as { senha?: string };
  if (!senha || !senhaConfere(String(senha))) {
    await new Promise((r) => setTimeout(r, 600)); // freia tentativas em sequência
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: VALIDADE_S });
  return res;
}
