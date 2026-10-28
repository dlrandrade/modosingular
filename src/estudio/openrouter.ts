/* ---------------------------------------------------------------
   OpenRouter: o provedor prioritário do estúdio.

   A cadeia (ordem de tentativa) sai, nesta ordem de precedência:
   1. da escolha feita em /estudio/admin (config/modelos.json no armazém);
   2. da variável ESTUDIO_MODELOS na Vercel, por exemplo
      ESTUDIO_MODELOS="openrouter:qwen/qwen3.8-27b:free,anthropic:claude-opus-5-5";
   3. do padrão: o modelo recomendado (pago), os gratuitos e o Claude.
   Um modelo que falha (sem crédito, fora do ar, limite, 404, JSON
   quebrado) passa a vez ao próximo.

   Limites do plano gratuito (por conta): 20 pedidos por minuto e 50 por
   dia; depois de US$ 10 em créditos comprados uma vez, 1.000 por dia.
--------------------------------------------------------------- */
import { CONFIG_PADRAO, MODELOS_GRATUITOS, type ConfigModelos } from "./modelos";

export { MODELOS_GRATUITOS };

export type Elo = { provedor: "openrouter" | "anthropic"; modelo: string };
export type Uso = { entrada: number; saida: number; custo?: number };

const temOpenRouter = () => !!process.env.OPENROUTER_API_KEY;
const temAnthropic = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

export function cadeia(conf?: ConfigModelos | null): Elo[] {
  const env = process.env.ESTUDIO_MODELOS?.trim();
  let elos: Elo[];
  if (!conf && env) {
    elos = env.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
      const [p, ...resto] = s.split(":");
      return p === "anthropic" ? { provedor: "anthropic", modelo: resto.join(":") } : { provedor: "openrouter", modelo: p === "openrouter" ? resto.join(":") : s };
    });
  } else {
    const c = conf || CONFIG_PADRAO;
    elos = [
      ...(c.principal ? [{ provedor: "openrouter" as const, modelo: c.principal }] : []),
      ...(c.gratuitosDeReserva || !c.principal ? MODELOS_GRATUITOS.map((m) => ({ provedor: "openrouter" as const, modelo: m })) : []),
      ...(c.claudeDeReserva ? [{ provedor: "anthropic" as const, modelo: "claude-opus-5-5" }] : []),
    ];
  }
  const vistos = new Set<string>();
  return elos.filter((e) => {
    const k = `${e.provedor}:${e.modelo}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return e.provedor === "openrouter" ? temOpenRouter() : temAnthropic();
  });
}

export class FalhaDoModelo extends Error {
  constructor(msg: string, readonly status?: number) { super(msg); this.name = "FalhaDoModelo"; }
}

export type MensagemTexto = { role: "system" | "user" | "assistant"; content: string };

const BASE = () => process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

/** Chama um modelo do OpenRouter em streaming e devolve o texto final (sem o raciocínio) e o uso. */
export async function chamarOpenRouter(modelo: string, messages: MensagemTexto[], aoProgredir: (n: number) => void, limiteMs: number): Promise<{ texto: string; uso?: Uso }> {
  let r: Response;
  try {
    r = await fetch(`${BASE()}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(limiteMs),
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.ESTUDIO_URL || "https://modosingular.vercel.app/estudio",
        "X-Title": "Estudio Singular",
      },
      body: JSON.stringify({ model: modelo, messages, stream: true, max_tokens: 16000, temperature: 0.6, usage: { include: true } }),
    });
  } catch (e) {
    throw new FalhaDoModelo((e as Error).name === "TimeoutError" ? "demorou demais" : "sem conexão");
  }
  if (!r.ok || !r.body) {
    const corpo = await r.text().catch(() => "");
    const msg = (() => { try { return JSON.parse(corpo).error?.message as string; } catch { return corpo.slice(0, 160); } })();
    throw new FalhaDoModelo(r.status === 402 ? "sem créditos no OpenRouter" : `HTTP ${r.status}${msg ? `: ${msg}` : ""}`, r.status);
  }
  const leitor = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "", texto = "", ultimo = 0, fim = "";
  let uso: Uso | undefined;
  try {
    for (;;) {
      const { value, done } = await leitor.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const linha = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!linha.startsWith("data:")) continue; // ": OPENROUTER PROCESSING" e outros comentários
        const dado = linha.slice(5).trim();
        if (dado === "[DONE]") continue;
        let j: {
          error?: { message?: string };
          choices?: { delta?: { content?: string }; finish_reason?: string }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number };
        };
        try { j = JSON.parse(dado); } catch { continue; }
        if (j.error) throw new FalhaDoModelo(j.error.message || "erro no meio da resposta");
        const c = j.choices?.[0];
        if (c?.delta?.content) {
          texto += c.delta.content;
          if (texto.length - ultimo > 120) { ultimo = texto.length; aoProgredir(texto.length); }
        }
        if (c?.finish_reason) fim = c.finish_reason;
        if (j.usage) uso = { entrada: j.usage.prompt_tokens || 0, saida: j.usage.completion_tokens || 0, custo: j.usage.cost };
      }
    }
  } catch (e) {
    if (e instanceof FalhaDoModelo) throw e;
    throw new FalhaDoModelo((e as Error).name === "TimeoutError" ? "demorou demais" : "a conexão caiu");
  }
  if (fim === "length") throw new FalhaDoModelo("a resposta passou do limite de tamanho");
  if (!texto.trim()) throw new FalhaDoModelo("resposta vazia");
  return { texto, uso };
}

export type ModeloVivo = { id: string; nome: string; entrada: number; saida: number; contexto: number };

/** Catálogo vivo do OpenRouter (público, sem chave), para o admin conferir IDs e preços. */
export async function catalogoVivo(): Promise<ModeloVivo[]> {
  const r = await fetch(`${BASE()}/models`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`OpenRouter respondeu ${r.status}`);
  const j = (await r.json()) as { data: { id: string; name: string; context_length: number; pricing: { prompt: string; completion: string } }[] };
  return j.data.map((m) => ({
    id: m.id, nome: m.name, contexto: m.context_length,
    entrada: Number(m.pricing?.prompt || 0) * 1e6, saida: Number(m.pricing?.completion || 0) * 1e6,
  }));
}

/** Saldo da conta no OpenRouter (US$), quando a chave permite ler. */
export async function saldoOpenRouter(): Promise<{ total: number; usado: number } | null> {
  if (!temOpenRouter()) return null;
  try {
    const r = await fetch(`${BASE()}/credits`, { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: { total_credits?: number; total_usage?: number } };
    return { total: j.data?.total_credits || 0, usado: j.data?.total_usage || 0 };
  } catch {
    return null;
  }
}
