import Anthropic from "@anthropic-ai/sdk";
import { cookies } from "next/headers";
import { COOKIE, cookieValido } from "@/estudio/auth";
import { gerarKit } from "@/estudio/gerar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function mensagemDeErro(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "A chave da API do Claude foi recusada. Confira ANTHROPIC_API_KEY na Vercel.";
  if (e instanceof Anthropic.RateLimitError) return "Muitos pedidos seguidos. Espere um minuto e tente de novo.";
  if (e instanceof Anthropic.APIError) return `A API do Claude respondeu com erro ${e.status}. Tente de novo em instantes.`;
  if (e instanceof SyntaxError) return "O texto voltou fora do formato. Tente de novo.";
  return e instanceof Error ? e.message : "Algo deu errado.";
}

export async function POST(req: Request) {
  if (!cookieValido((await cookies()).get(COOKIE)?.value)) {
    return Response.json({ erro: "Entre com a senha." }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json({ erro: "Falta configurar ANTHROPIC_API_KEY na Vercel para gerar dias novos." }, { status: 503 });
  }
  const corpo = (await req.json().catch(() => ({}))) as { pedido?: string; feitos?: number[] };
  const pedido = String(corpo.pedido || "").slice(0, 600);
  const feitos = Array.isArray(corpo.feitos) ? corpo.feitos.filter((n) => Number.isInteger(n)).slice(0, 200) : [];

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const enviar = (evento: string, dados: unknown) =>
        ctrl.enqueue(enc.encode(`event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`));
      const pulso = setInterval(() => ctrl.enqueue(enc.encode(": pulso\n\n")), 8000);
      try {
        const r = await gerarKit(pedido, feitos, {
          fase: (t) => enviar("fase", { texto: t }),
          progresso: (n) => enviar("progresso", { caracteres: n }),
        });
        enviar("kit", r);
      } catch (e) {
        enviar("erro", { mensagem: mensagemDeErro(e) });
      } finally {
        clearInterval(pulso);
        ctrl.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" },
  });
}
