/* ---------------------------------------------------------------
   OpenRouter: o provedor prioritário do estúdio, com modelos gratuitos.

   A cadeia padrão (ordem de tentativa) vem de MODELOS_GRATUITOS e pode
   ser trocada sem mexer no código pela variável ESTUDIO_MODELOS na
   Vercel, por exemplo:
     ESTUDIO_MODELOS="openrouter:qwen/qwen3.8-27b:free,openrouter:openrouter/free,anthropic:claude-opus-5-5"

   Os modelos gratuitos do OpenRouter mudam com frequência: um ID que
   saiu do catálogo responde 404 e a cadeia segue para o próximo.
   Limites do plano gratuito (por conta): 20 pedidos por minuto e 50 por
   dia; depois de US$ 10 em créditos comprados uma vez, 1.000 por dia.
--------------------------------------------------------------- */

export type Elo = { provedor: "openrouter" | "anthropic"; modelo: string };

/** Escolhidos por: janela de contexto ≥ 256 mil tokens (o pedido tem até ~19 mil de entrada e 5 a 8 mil de saída),
 *  porte (modelos grandes seguem melhor um manual longo) e bom desempenho multilíngue. Catálogo de outubro de 2026. */
export const MODELOS_GRATUITOS = [
  "thinkingmachines/inkling:free",            // 975B (41B ativos), 1M de contexto: o maior do plano gratuito
  "nvidia/nemotron-3-ultra-550b-a55b:free",   // 550B (55B ativos), 1M de contexto
  "qwen/qwen3.8-27b:free",                    // 262K de contexto, forte em texto multilíngue
  "google/gemma-4-31b-it:free",               // 262K de contexto, bom em português
  "nvidia/nemotron-3-super-120b-a12b:free",   // reserva
  "openrouter/free",                          // roteador: escolhe um gratuito disponível na hora
];

export function cadeia(): Elo[] {
  const conf = process.env.ESTUDIO_MODELOS?.trim();
  const elos: Elo[] = conf
    ? conf.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
        const [p, ...resto] = s.split(":");
        return p === "anthropic" ? { provedor: "anthropic", modelo: resto.join(":") } : { provedor: "openrouter", modelo: p === "openrouter" ? resto.join(":") : s };
      })
    : [
        ...MODELOS_GRATUITOS.map((m) => ({ provedor: "openrouter" as const, modelo: m })),
        { provedor: "anthropic" as const, modelo: "claude-opus-5-5" },
      ];
  return elos.filter((e) => (e.provedor === "openrouter" ? !!process.env.OPENROUTER_API_KEY : !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)));
}

export class FalhaDoModelo extends Error {
  constructor(msg: string, readonly status?: number) { super(msg); this.name = "FalhaDoModelo"; }
}

export type MensagemTexto = { role: "system" | "user" | "assistant"; content: string };

/** Chama um modelo do OpenRouter em streaming e devolve o texto final (sem o raciocínio). */
export async function chamarOpenRouter(modelo: string, messages: MensagemTexto[], aoProgredir: (n: number) => void, limiteMs: number): Promise<string> {
  let r: Response;
  try {
    r = await fetch(`${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(limiteMs),
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.ESTUDIO_URL || "https://modosingular.vercel.app/estudio",
        "X-Title": "Estudio Singular",
      },
      body: JSON.stringify({ model: modelo, messages, stream: true, max_tokens: 16000, temperature: 0.6 }),
    });
  } catch (e) {
    throw new FalhaDoModelo((e as Error).name === "TimeoutError" ? "demorou demais" : "sem conexão");
  }
  if (!r.ok || !r.body) {
    const corpo = await r.text().catch(() => "");
    const msg = (() => { try { return JSON.parse(corpo).error?.message as string; } catch { return corpo.slice(0, 160); } })();
    throw new FalhaDoModelo(`HTTP ${r.status}${msg ? `: ${msg}` : ""}`, r.status);
  }
  const leitor = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "", texto = "", ultimo = 0, fim = "";
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
        let j: { error?: { message?: string }; choices?: { delta?: { content?: string }; finish_reason?: string }[] };
        try { j = JSON.parse(dado); } catch { continue; }
        if (j.error) throw new FalhaDoModelo(j.error.message || "erro no meio da resposta");
        const c = j.choices?.[0];
        if (c?.delta?.content) {
          texto += c.delta.content;
          if (texto.length - ultimo > 120) { ultimo = texto.length; aoProgredir(texto.length); }
        }
        if (c?.finish_reason) fim = c.finish_reason;
      }
    }
  } catch (e) {
    if (e instanceof FalhaDoModelo) throw e;
    throw new FalhaDoModelo((e as Error).name === "TimeoutError" ? "demorou demais" : "a conexão caiu");
  }
  if (fim === "length") throw new FalhaDoModelo("a resposta passou do limite de tamanho");
  if (!texto.trim()) throw new FalhaDoModelo("resposta vazia");
  return texto;
}
