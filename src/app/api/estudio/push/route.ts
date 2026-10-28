import { chavesVapid } from "@/estudio/aviso";
import { dentro, NAO_AUTORIZADO } from "@/estudio/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A chave pública das notificações (a privada nunca sai do servidor). */
export async function GET() {
  if (!(await dentro())) return NAO_AUTORIZADO();
  const c = await chavesVapid();
  return c ? Response.json({ chave: c.publica }) : Response.json({ erro: "notificações indisponíveis" }, { status: 503 });
}
