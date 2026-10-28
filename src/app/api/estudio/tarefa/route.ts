import { armazemDisponivel, lerKit, salvar } from "@/estudio/armazem";
import { inscricaoValida } from "@/estudio/aviso";
import { dentro, NAO_AUTORIZADO } from "@/estudio/sessao";
import { caminhoPush, idValido, lerTarefa } from "@/estudio/tarefas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?id= — o andamento de uma geração; quando pronta, já com o kit. */
export async function GET(req: Request) {
  if (!(await dentro())) return NAO_AUTORIZADO();
  const id = new URL(req.url).searchParams.get("id");
  if (!idValido(id) || !armazemDisponivel()) return Response.json({ erro: "tarefa desconhecida" }, { status: 404 });
  const t = await lerTarefa(id).catch(() => null);
  if (!t) return Response.json({ erro: "tarefa desconhecida" }, { status: 404 });
  // uma tarefa parada há mais de 6 minutos não vai mais terminar (a função vai até 5)
  if (t.estado === "rodando" && Date.now() - t.atualizado > 6 * 60_000) {
    t.estado = "erro"; t.erro = "A geração foi interrompida no servidor. Tente de novo.";
  }
  const { push: _push, ...publica } = t;
  void _push;
  const salvo = t.estado === "pronto" && t.dia ? await lerKit(t.dia).catch(() => null) : null;
  return Response.json({ tarefa: publica, kit: salvo?.kit ?? null, verificacao: salvo?.verificacao ?? null }, { headers: { "Cache-Control": "no-store" } });
}

/** POST {id, push} — o sino da tela de espera: avise este aparelho quando terminar. */
export async function POST(req: Request) {
  if (!(await dentro())) return NAO_AUTORIZADO();
  const { id, push } = (await req.json().catch(() => ({}))) as { id?: string; push?: unknown };
  if (!idValido(id) || !inscricaoValida(push) || !armazemDisponivel()) return Response.json({ ok: false }, { status: 400 });
  const t = await lerTarefa(id).catch(() => null);
  if (!t) return Response.json({ ok: false }, { status: 404 });
  await salvar(caminhoPush(id), push); // arquivo à parte: o andamento da geração não o sobrescreve
  return Response.json({ ok: true, estado: t.estado });
}
