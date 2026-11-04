import Anthropic from "@anthropic-ai/sdk";
import { chamarOpenRouter, type Elo, type Uso } from "./openrouter";
import type { Dados } from "./slides";

/* ---------------------------------------------------------------
   O teste do leitor frio (MANUAL, seção 0.2).

   Depois de escrever, o mesmo modelo lê a abertura no papel de quem
   chega frio: uma profissional que nunca viu o perfil nem o livro. Ele
   lê as telas na ordem (gancho do Reels, capa, slides 2 e 3) e, para
   cada uma, diz o que entendeu com as próprias palavras, o que ficou
   solto e dá três notas: compreensão, relevância e curiosidade.
   Se alguma tela reprova, a correção do redator já leva essas notas.
   As regras moram no MANUAL; aqui só o teste, que vale para qualquer
   modelo escolhido no admin.
--------------------------------------------------------------- */

export type Tela = { tela: string; entendi: string; soltas: string[]; compreensao: number; relevancia: number; curiosidade: number };
export type Leitura = { telas: Tela[]; pior?: string; sugestao?: string; aprovado: boolean; reprovadas: string[] };

const SISTEMA = `Você é um leitor frio: uma profissional liberal (dentista, psicóloga, advogada, nutricionista, arquiteta…) rolando o Instagram no fim do dia. Você nunca ouviu falar de Daniel Luzz, do livro Modo Singular nem de nenhum termo dele.

Você vai ver as telas de abertura de um conteúdo, NA ORDEM. Para cada tela, você só sabe o que leu até ela. Para cada uma, responda com honestidade, como quem decide se continua ou rola para o próximo post:
- "entendi": o que você entendeu, numa frase sua. Se não entendeu, comece com "não entendi" e diga o que faltou.
- "soltas": palavras ou referências que você não sabe a que se referem (um número, um nome, uma fala, um pronome, um termo, "a lista", "o teste"…). Lista vazia se nada ficou solto.
- "compreensao" (0 a 10): entendi do que se trata só com o que li até aqui.
- "relevancia" (0 a 10): reconheço o meu mundo (minha profissão, meus clientes, meu perfil, meus posts).
- "curiosidade" (0 a 10): quero ver a próxima tela. 9 ou 10 só quando a tela contraria algo em que eu acredito ou mostra um custo que eu não via.

Seja exigente. Um enigma sem chão (número, fala ou nome que você não sabe de onde vem) é compreensão baixa, nunca curiosidade alta. Frase bonita que não diz nada sobre a sua vida é relevância baixa.

Responda só com o JSON, sem comentário:
{"telas":[{"tela":"gancho","entendi":"","soltas":[],"compreensao":0,"relevancia":0,"curiosidade":0}],"pior":"qual tela foi a pior e por quê","sugestao":"como reescrever a pior, em uma frase"}`;

const limpo = (t: unknown) => String(t ?? "").replace(/\*+/g, "").trim();

/** As telas da abertura, como o leitor as vê. */
export function telasDaAbertura(k: Dados): { tela: string; texto: string }[] {
  const r = k.roteiro || {};
  const sl: Dados[] = k.carrossel || [];
  const tx = (s?: Dados) => s ? [s.rotulo, s.titulo, s.sub, s.fala, s.apoio].map(limpo).filter(Boolean).join(" / ") : "";
  return [
    { tela: "gancho", texto: `(o que se ouve nos 3 primeiros segundos do vídeo) ${limpo(r.hook)}` },
    { tela: "introducao", texto: `(o vídeo continua, até os 10 segundos) ${limpo(r.lead)}` },
    { tela: "capa", texto: tx(sl[0]) },
    { tela: "slide 2", texto: tx(sl[1]) },
    { tela: "slide 3", texto: tx(sl[2]) },
  ].filter((t) => t.texto.replace(/\(.*?\)/, "").trim());
}

/** A régua: tudo compreensível; gancho e capa também relevantes e com coceira. */
export function avaliar(telas: Tela[]): { aprovado: boolean; reprovadas: string[] } {
  const reprovadas: string[] = [];
  for (const t of telas) {
    const abre = t.tela === "gancho" || t.tela === "capa";
    const ok = t.compreensao >= 8 && (!abre || (t.relevancia >= 8 && t.curiosidade >= 8)) && (abre || t.curiosidade >= 7) && !(t.soltas || []).length;
    if (!ok) reprovadas.push(t.tela);
  }
  return { aprovado: reprovadas.length === 0, reprovadas };
}

function extrair(texto: string): { telas: Tela[]; pior?: string; sugestao?: string } {
  texto = texto.replace(/<think>[\s\S]*?<\/think>/g, "");
  const cerca = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  const bruto = cerca ? cerca[1] : texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1);
  const j = JSON.parse(bruto) as { telas?: Tela[]; pior?: string; sugestao?: string };
  const n = (x: unknown) => Math.max(0, Math.min(10, Number(x) || 0));
  const telas = (j.telas || []).map((t) => ({
    tela: String(t.tela || ""), entendi: String(t.entendi || ""), soltas: Array.isArray(t.soltas) ? t.soltas.map(String).filter(Boolean) : [],
    compreensao: n(t.compreensao), relevancia: n(t.relevancia), curiosidade: n(t.curiosidade),
  }));
  if (!telas.length) throw new Error("o leitor frio não devolveu as telas");
  return { telas, pior: j.pior, sugestao: j.sugestao };
}

/** Faz o teste com o mesmo modelo que escreveu. Devolve null se não houver tempo ou o modelo falhar (o kit segue sem a nota). */
export async function lerFrio(elo: Elo, k: Dados, limiteMs: number): Promise<{ leitura: Leitura; uso?: Uso } | null> {
  const telas = telasDaAbertura(k);
  const usuario = telas.map((t, i) => `TELA ${i + 1} · ${t.tela}\n${t.texto}`).join("\n\n");
  try {
    let texto = "", uso: Uso | undefined;
    if (elo.provedor === "openrouter") {
      const r = await chamarOpenRouter(elo.modelo, [{ role: "system", content: SISTEMA }, { role: "user", content: usuario }], () => {}, limiteMs);
      texto = r.texto; uso = r.uso;
    } else {
      const client = new Anthropic({ timeout: limiteMs, maxRetries: 0 });
      const m = await client.messages.create({ model: elo.modelo, max_tokens: 3000, system: SISTEMA, messages: [{ role: "user", content: usuario }] });
      texto = m.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      uso = { entrada: m.usage.input_tokens, saida: m.usage.output_tokens };
    }
    const j = extrair(texto);
    return { leitura: { ...j, ...avaliar(j.telas) }, uso };
  } catch {
    return null;
  }
}

/** O pedido de correção ao redator, com o que o leitor frio entendeu e onde travou. */
export function pedidoDeCorrecao(l: Leitura): string {
  const linhas = l.telas.filter((t) => l.reprovadas.includes(t.tela)).map((t) =>
    `- ${t.tela}: compreensão ${t.compreensao}, relevância ${t.relevancia}, curiosidade ${t.curiosidade}. O leitor entendeu: "${t.entendi}".${t.soltas.length ? ` Ficou solto: ${t.soltas.join(", ")}.` : ""}`);
  return [
    "O teste do leitor frio (MANUAL, seção 0.2) reprovou a abertura. Quem chega frio leu assim:",
    ...linhas,
    l.sugestao ? `Sugestão do leitor: ${l.sugestao}` : "",
    "Reescreva o gancho, a introdução, a capa e os slides 2 e 3 pela seção 0.2: a ideia antes da cena, no mundo de quem lê, com um molde K1 a K5 na capa; a cena entendida sozinha, em no máximo duas frases; nenhum número, nome, fala ou pronome solto. Mantenha o resto do kit.",
  ].filter(Boolean).join("\n");
}
