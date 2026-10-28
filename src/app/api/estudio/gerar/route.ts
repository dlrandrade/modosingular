import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { armazemDisponivel, ler, salvarKit } from "@/estudio/armazem";
import { avisar, inscricaoValida } from "@/estudio/aviso";
import { gerarKit } from "@/estudio/gerar";
import { dentro, lerConfig, NAO_AUTORIZADO } from "@/estudio/sessao";
import { caminhoPush, gravador, type Tarefa } from "@/estudio/tarefas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/* ---------------------------------------------------------------
   POST /api/estudio/gerar — começa a geração e transmite o andamento
   (SSE). A geração roda solta da conexão: se a tela dormir ou a
   pessoa trocar de app, ela continua no servidor até o fim (after),
   o andamento fica em tarefas/<id>.json, o kit em kits/, e chega a
   notificação, se o aparelho tiver pedido.
--------------------------------------------------------------- */

function mensagemDeErro(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "A chave da API do Claude foi recusada. Confira ANTHROPIC_API_KEY na Vercel.";
  if (e instanceof Anthropic.RateLimitError) return "Muitos pedidos seguidos. Espere um minuto e tente de novo.";
  if (e instanceof Anthropic.APIError) return `A API do Claude respondeu com erro ${e.status}. Tente de novo em instantes.`;
  if (e instanceof SyntaxError) return "O texto voltou fora do formato. Tente de novo.";
  return e instanceof Error ? e.message : "Algo deu errado.";
}

export async function POST(req: Request) {
  if (!(await dentro())) return NAO_AUTORIZADO();
  if (!process.env.OPENROUTER_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json({ erro: "Falta configurar OPENROUTER_API_KEY na Vercel (ou ANTHROPIC_API_KEY) para gerar dias novos." }, { status: 503 });
  }
  const corpo = (await req.json().catch(() => ({}))) as { pedido?: string; feitos?: number[]; push?: unknown };
  const pedido = String(corpo.pedido || "").slice(0, 600);
  const feitos = Array.isArray(corpo.feitos) ? corpo.feitos.filter((n) => Number.isInteger(n)).slice(0, 200) : [];

  const servidor = armazemDisponivel();
  const t: Tarefa = {
    id: randomUUID(), estado: "rodando", pedido, fase: "", caracteres: 0, criado: Date.now(), atualizado: Date.now(),
    push: inscricaoValida(corpo.push) ? corpo.push : undefined,
  };
  const gravar = gravador(t, servidor);
  if (servidor) await gravar(true);
  const conf = servidor ? await lerConfig() : null;

  // quem está ouvindo agora (a tela); some quando a conexão cai, e a geração segue
  let ouvinte: ((evento: string, dados: unknown) => void) | null = null;
  const emitir = (evento: string, dados: unknown) => { try { ouvinte?.(evento, dados); } catch { ouvinte = null; } };
  let terminar: () => void = () => {};
  const terminou = new Promise<void>((ok) => { terminar = ok; });

  // a inscrição pode ter chegado depois do início (o sino da tela de espera grava em tarefas/<id>-push.json)
  const inscricao = async () => t.push ?? (servidor ? await ler(caminhoPush(t.id)).catch(() => null) : null);

  const trabalho = (async () => {
    try {
      const r = await gerarKit(pedido, feitos, {
        fase: (txt) => { t.fase = txt; emitir("fase", { texto: txt }); void gravar(true); },
        progresso: (n) => { t.caracteres = n; emitir("progresso", { caracteres: n }); void gravar(); },
      }, conf);
      t.dia = r.kit.dia; t.modelo = r.kit.modelo; t.uso = r.kit.uso;
      if (servidor) await salvarKit(r.kit, r.verificacao, "gerado").catch(() => {});
      t.estado = "pronto";
      emitir("kit", r);
      await gravar(true);
      await avisar(await inscricao(), `Dia ${String(r.kit.dia).padStart(2, "0")} pronto`, String(r.kit.tema || "O carrossel, o roteiro e a legenda estão no estúdio."), `/estudio?tarefa=${t.id}`);
    } catch (e) {
      t.estado = "erro"; t.erro = mensagemDeErro(e);
      emitir("erro", { mensagem: t.erro });
      await gravar(true);
      await avisar(await inscricao(), "O estúdio não conseguiu terminar", t.erro, `/estudio?tarefa=${t.id}`);
    } finally {
      terminar();
    }
  })();
  after(trabalho);

  const enc = new TextEncoder();
  let pulso: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    start(ctrl) {
      ouvinte = (evento, dados) => ctrl.enqueue(enc.encode(`event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`));
      emitir("tarefa", { id: t.id, servidor });
      pulso = setInterval(() => { try { ctrl.enqueue(enc.encode(": pulso\n\n")); } catch { clearInterval(pulso); } }, 8000);
      terminou.then(() => { clearInterval(pulso); ouvinte = null; try { ctrl.close(); } catch { /* já fechada */ } });
    },
    cancel() {
      clearInterval(pulso);
      ouvinte = null; // a tela saiu; a geração continua
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" },
  });
}
