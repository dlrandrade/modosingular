/* ---------------------------------------------------------------
   Catálogo de modelos do estúdio (usado pelo servidor e pelo admin).

   Pesquisa de outubro de 2026 (preços de lista do OpenRouter, por
   milhão de tokens; o admin confere o preço vivo na API do OpenRouter):
   um kit pede ~19 mil tokens de entrada e ~8 mil de saída, e às vezes
   uma segunda volta de correção.
--------------------------------------------------------------- */

export type Opcao = {
  id: string;            // ID no OpenRouter
  nome: string;
  porque: string;
  entrada: number;       // US$ por milhão de tokens (referência; o admin mostra o preço vivo)
  saida: number;
  recomendado?: boolean;
};

export const CATALOGO: Opcao[] = [
  {
    id: "anthropic/claude-haiku-5.5", nome: "Claude Haiku 5.5", recomendado: true,
    porque: "O melhor custo-benefício: segue um manual longo à risca, escreve português natural e devolve o JSON certo. Menos de um centavo de dólar por dia.",
    entrada: 0.1, saida: 0.5,
  },
  {
    id: "deepseek/deepseek-v4-pro", nome: "DeepSeek V4 Pro",
    porque: "Barato e forte em raciocínio; a escrita em português é boa, um pouco menos fluida que a do Claude.",
    entrada: 0.44, saida: 0.87,
  },
  {
    id: "z-ai/glm-5.3", nome: "GLM 5.3",
    porque: "A melhor escrita criativa entre os modelos abertos (6º no EQ-Bench de escrita criativa). Custa algumas vezes mais.",
    entrada: 1.4, saida: 4.4,
  },
  {
    id: "anthropic/claude-sonnet-5.5", nome: "Claude Sonnet 5.5",
    porque: "Para quando quiser o máximo de acabamento. Cerca de 15 centavos de dólar por dia.",
    entrada: 2, saida: 10,
  },
];

/** Os gratuitos do OpenRouter, em ordem de tentativa (mudam com frequência: um ID fora do catálogo responde 404 e a cadeia segue). */
export const MODELOS_GRATUITOS = [
  "thinkingmachines/inkling:free",            // 975B (41B ativos), 1M de contexto: o maior do plano gratuito
  "nvidia/nemotron-3-ultra-550b-a55b:free",   // 550B (55B ativos), 1M de contexto
  "qwen/qwen3.8-27b:free",                    // 262K de contexto, forte em texto multilíngue
  "google/gemma-4-31b-it:free",               // 262K de contexto, bom em português
  "nvidia/nemotron-3-super-120b-a12b:free",   // reserva
  "openrouter/free",                          // roteador: escolhe um gratuito disponível na hora
];

/** O que o admin guarda. "principal" vazio = começar pelos gratuitos. */
export type ConfigModelos = { principal: string; gratuitosDeReserva: boolean; claudeDeReserva: boolean; atualizado?: string };

export const CONFIG_PADRAO: ConfigModelos = { principal: "anthropic/claude-haiku-5.5", gratuitosDeReserva: true, claudeDeReserva: true };

/** Custo estimado de um kit em US$ (uma volta, sem correção). */
export function custoKit(entrada: number, saida: number): number {
  return (19_000 * entrada + 8_000 * saida) / 1e6;
}

export function formatarUS(v: number): string {
  if (v === 0) return "grátis";
  if (v < 0.01) return `US$ ${v.toFixed(4).replace(".", ",")}`;
  return `US$ ${v.toFixed(2).replace(".", ",")}`;
}
