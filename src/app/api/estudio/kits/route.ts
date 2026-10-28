import { armazemDisponivel, lerIndice, lerKit, salvarKit } from "@/estudio/armazem";
import { dentro, NAO_AUTORIZADO } from "@/estudio/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — o índice dos kits guardados no servidor; GET ?dia=N — o kit do dia. */
export async function GET(req: Request) {
  if (!(await dentro())) return NAO_AUTORIZADO();
  if (!armazemDisponivel()) return Response.json({ servidor: false, indice: {} });
  const dia = Number(new URL(req.url).searchParams.get("dia"));
  if (dia) {
    const k = await lerKit(dia).catch(() => null);
    return k ? Response.json(k, { headers: { "Cache-Control": "no-store" } }) : Response.json({ erro: "sem kit" }, { status: 404 });
  }
  const indice = await lerIndice().catch(() => ({}));
  return Response.json({ servidor: true, indice }, { headers: { "Cache-Control": "no-store" } });
}

/** PUT {kit} — salva o kit editado no carrossel (a versão anterior vai para o histórico). */
export async function PUT(req: Request) {
  if (!(await dentro())) return NAO_AUTORIZADO();
  if (!armazemDisponivel()) return Response.json({ ok: false, erro: "sem armazém no servidor" }, { status: 503 });
  const { kit } = (await req.json().catch(() => ({}))) as { kit?: Record<string, unknown> };
  if (!kit || !Array.isArray(kit.carrossel) || !Number.isInteger(kit.dia)) return Response.json({ ok: false, erro: "kit inválido" }, { status: 400 });
  if (JSON.stringify(kit).length > 400_000) return Response.json({ ok: false, erro: "kit grande demais" }, { status: 413 });
  const salvo = await salvarKit(kit, null, "editado");
  return Response.json({ ok: true, salvo: salvo.salvo });
}
