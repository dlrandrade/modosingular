import Anthropic from "@anthropic-ai/sdk";
import fontes from "./dados/fontes.json";
import publico from "./dados/publico.json";
import { verificar, type Resultado } from "./lint";
import type { ConfigModelos } from "./modelos";
import { cadeia, chamarOpenRouter, type Elo, type MensagemTexto, type Uso } from "./openrouter";
import { FIGURAS_PRONTAS, FORMAS_EXEMPLO, type Dados } from "./slides";

/* ---------------------------------------------------------------
   Geração do kit do dia (roteiro + carrossel + legenda) pela API do
   Claude, a partir de uma figura do livro e do PLAYBOOK.

   - O prompt de sistema (playbook, formato, exemplo, regras) é
     estável e vai com cache: só o capítulo e o pedido mudam.
   - O slide da figura principal volta com "figura": "LIVRO" e o
     servidor injeta os dados exatos do bloco ```figura do livro.
   - O verificador roda no resultado; se reprovar, o mesmo modelo recebe
     a lista de erros uma vez e devolve o kit corrigido.
   - Provedores em cadeia (src/estudio/openrouter.ts): primeiro os
     modelos gratuitos do OpenRouter, depois o Claude, se houver chave.
     Um modelo que falha (fora do ar, limite, 404, JSON quebrado) passa
     a vez ao próximo.
--------------------------------------------------------------- */


type Pauta = { dia: number; cap: number; fig: number; tipo: string; titulo: string; template: boolean; capTitulo: string };

const PAUTAS = publico.pautas as Pauta[];
const KITS = publico.kits as Record<string, Dados>;
const F = fontes as unknown as {
  playbook: string; manual: string; antivicios: string[]; cadencia: Record<string, number[]>;
  capitulos: Record<string, { titulo: string; subtitulo: string; texto: string }>;
  figuras: Record<string, Dados>; exemploKit: Dados;
};

function semAcento(t: string): string {
  return t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function nivelCta(dia: number): string {
  const d = ((dia - 1) % 7) + 1;
  for (const k of ["pratica", "conversa", "convite"]) if ((F.cadencia?.[k] || []).includes(d)) return k;
  return "pratica";
}

/** Escolhe a pauta a partir do pedido livre: número do dia, "próximo"/vazio, ou um tema. */
export function escolherPauta(pedido: string, feitos: number[]): { pauta: Pauta; tema: string } {
  const p = (pedido || "").trim();
  const prontas = PAUTAS.filter((x) => x.template);
  const num = p.match(/(?:^|\bdia\s*)(\d{1,2})\b/i) || p.match(/^\s*(\d{1,2})\s*$/);
  if (num) {
    const achada = PAUTAS.find((x) => x.dia === Number(num[1]));
    if (achada) return { pauta: achada, tema: "" };
  }
  const proxima = prontas.find((x) => !KITS[String(x.dia)] && !feitos.includes(x.dia)) || prontas[0];
  const limpo = semAcento(p).replace(/\b(hoje|proximo|post|do dia|dia|o|a|de|do|da|sobre|um|uma|quero|me|de)\b/g, " ").trim();
  if (!limpo) return { pauta: proxima, tema: "" };
  const termos = limpo.split(/\W+/).filter((t) => t.length > 3);
  let melhor = proxima, nota = 0;
  for (const x of prontas) {
    const fig = JSON.stringify(F.figuras[String(x.dia)] || {});
    const alvo = semAcento(`${x.titulo} ${x.capTitulo} ${fig}`);
    const n = termos.reduce((a, t) => a + (alvo.includes(t) ? 1 : 0), 0);
    if (n > nota) { nota = n; melhor = x; }
  }
  return { pauta: melhor, tema: p };
}

const FORMATO = `
FORMATO DO KIT (um objeto JSON; todas as chaves abaixo são obrigatórias)
{
  "ficha": { "ideia": "", "conceito": "", "cena": "", "detalhe": "", "figura": "", "virada": "", "aplicacao": "", "exercicio": "" },
  "tema": "a ideia do dia, numa frase",
  "objetivo": "ensinar | autoridade | engajar | convidar",
  "duracao": 45 ou 60,
  "cta_nivel": "pratica | conversa | convite",
  "roteiro": { "hook": "", "lead": "", "body1": "", "loop1": "", "body2": "", "loop2": "", "body3": "", "cta": "" },
  "carrossel": [ ...8 a 10 slides... ],
  "legenda": "texto da legenda, com parágrafos separados por linha em branco"
}

TIPOS DE SLIDE (o campo "tipo" decide o resto)
- capa:    { "tipo": "capa", "titulo": "...", "sub": "..." }
- texto:   { "tipo": "texto", "rotulo"?: "...", "fala": "...", "apoio"?: "...", "tag"?: "...", "medio"?: true, "grande"?: true, "fundo"?: "areia | escuro" }
- qualquer slide aceita "fundo": "claro | areia | branco | ouro-claro | ouro | escuro" (MANUAL, seção 3: só quando fugir do padrão do tipo)
- lista:   { "tipo": "lista", "rotulo": "...", "fala": "...", "itens": [ { "rotulo": "...", "texto": "..." } ] }   (no máximo 3 itens)
- figura:  { "tipo": "figura", "rotulo"?: "...", "titulo": "...", "figura": "LIVRO" | {dados}, "legenda"?: "...", "foco"?: true }
    "foco": true = a figura sozinha no slide, sem título nem legenda; só quando ela sufoca (MANUAL, 3.2), e então o título vai num slide "texto" logo antes
- exemplo: { "tipo": "exemplo", "forma": "${FORMAS_EXEMPLO.join(" | ")}", "titulo": "...", "quem": "...", ...campos da forma..., "nota": "..." }
    post:          "perfil": "Profissão de quem posta", "texto": "dois ou três parágrafos curtos, em primeira pessoa de quem posta"
    antes_depois:  "comum": "...", "singular": "...", "porque": "..."
    rascunho:      "texto": "linhas de caderno, uma por linha"
    conversa:      "pergunta": "o que o cliente pergunta", "resposta": "o que o profissional responde"
- cta:     { "tipo": "cta", "titulo": "...", "apoio": "...", "acao": "a única ação, curta" }

Ordem padrão (9 slides): capa, cena, virada, figura ("figura": "LIVRO"), leitura da figura (lista), a ideia do dia (texto, fundo escuro, grande), exemplo (como ficaria), faça agora (figura com "tipo": "passos"), cta. Com slide de foco, 10.

FIGURAS PRÓPRIAS (além da do livro), com estes dados:
- passos/fluxo: { "tipo": "passos", "nos": [ { "rotulo": "...", "nota": "..." } ] }
- camadas:      { "tipo": "camadas", "camadas": [ { "rotulo", "nota" } ], "divisao"?: n, "grupos"?: ["...", "..."] }
- barras:       { "tipo": "barras", "series": [ { "rotulo", "valor", "nota" } ], "unidade"?: "..." }   (valores só ilustrativos, com "ilustrativo": true)
- escada:       { "tipo": "escada", "degraus": [ { "rotulo", "nota" } ] }
- funil:        { "tipo": "funil", "etapas": [ { "rotulo", "nota" } ] }
Tipos com desenho: ${FIGURAS_PRONTAS.join(", ")}.

MARCAÇÃO nos textos dos slides: *itálico* e **negrito**. Use o itálico para a palavra que carrega a ideia, com parcimônia. Nada de outras marcações.
`;

function sistema(): string {
  const exemplo = JSON.stringify({ ...F.exemploKit, dia: undefined, fonte: undefined }, null, 1);
  return [
    "Você escreve o conteúdo diário do Estúdio Singular, de Daniel Luzz (@DanielLuzz), a partir do livro Modo Singular.",
    "Cada dia é um conhecimento do livro, ancorado numa figura dele, entregue em três peças: roteiro de Reels para teleprompter, carrossel e legenda.",
    "O PLAYBOOK diz o que o sistema é; o MANUAL diz como cada campo é feito. Siga os dois à risca. Onde o manual dá molde, use um dos moldes; onde dá limite, respeite o limite; onde dá a fonte no capítulo, tire dali.",
    "Trabalhe na ordem do manual: primeiro a ficha (8 decisões, cada uma da sua fonte), depois o roteiro, o carrossel e a legenda, todos derivados da ficha.",
    `<playbook>\n${F.playbook}\n</playbook>`,
    `<manual>\n${F.manual}\n</manual>`,
    `<formato>\n${FORMATO}\n</formato>`,
    "Exemplo de kit aprovado (Dia 1). Use-o como referência de tom, densidade e acabamento, nunca de conteúdo:",
    `<exemplo>\n${exemplo}\n</exemplo>`,
    `<expressoes_proibidas>\n${F.antivicios.join("\n")}\n</expressoes_proibidas>`,
    [
      "Regras finais:",
      "- Português do Brasil. Sem exclamação. Sem a fórmula 'não é X, é Y' nem variações.",
      "- Hook com no máximo 14 palavras; hook + lead com no máximo 34 (a introdução termina por volta dos 10 s).",
      "- Tamanho do roteiro: 45 s = 118 a 142 palavras; 60 s = 158 a 192 palavras, somando as oito etapas.",
      "- Só use o que está no capítulo. Personagens do livro são compostos: diga isso ao público em palavras comuns (tag do slide da cena e legenda): \"Cena ilustrativa. [Quem] é uma personagem criada a partir de casos reais.\"",
      "- TOPO DE FUNIL (MANUAL, 0.1): quem vê nunca ouviu falar do livro, do método nem de você. Comece pela situação que a pessoa vive, com as palavras dela. Mostre o conceito em palavras comuns antes de dar o nome, e nunca no gancho.",
      "- Palavras de dentro não vão para o público: peça, caderno de campo, matéria-prima, oficina, pauta, tese, personagem composta, capítulo N, o método. O livro (Modo Singular) só aparece no CTA de convite e uma vez, na última linha da legenda, explicado numa frase.",
      "- O elemento primordial de cada slide tem ar em volta (MANUAL, 3.2). Figura com 5 elementos ou mais vai sem legenda. Slide de foco só se a figura ainda sufocar; nunca por padrão.",
      "- O slide de exemplo mostra a aplicação numa profissão diferente da cena, de um jeito que faça quem lê pensar: entendi como fazer no meu.",
      "- Legenda de 600 a 1.400 caracteres.",
      "- Responda só com o objeto JSON, dentro de um bloco ```json, e nada mais.",
    ].join("\n"),
  ].join("\n\n");
}

const SISTEMA = sistema();

function mensagemUsuario(pauta: Pauta, tema: string): string {
  const cap = F.capitulos[String(pauta.cap)];
  const fig = F.figuras[String(pauta.dia)];
  const anterior = KITS[String(pauta.dia - 1)];
  const formaAnterior = anterior?.carrossel?.find((s: Dados) => s.tipo === "exemplo")?.forma;
  const nivel = nivelCta(pauta.dia);
  const explica: Record<string, string> = {
    pratica: "prática: a única ação é fazer o exercício, no papel, hoje",
    conversa: "conversa: a única ação é responder nos comentários com uma palavra ou uma frase curta",
    convite: `convite: a única ação é conhecer o Modo Singular (${publico.marca.oferta?.acao_metodo || "link na bio"})`,
  };
  return [
    `Pauta: dia ${pauta.dia} · capítulo ${pauta.cap} ("${cap.titulo}") · figura "${pauta.titulo}" (${pauta.tipo}).`,
    `Dados da figura do livro (no slide da figura principal escreva "figura": "LIVRO"; o servidor injeta estes dados):\n${JSON.stringify(fig)}`,
    `Duração do Reels: ${publico.marca.duracao || 45} s, a menos que o conteúdo peça 60.`,
    `Degrau do CTA deste dia: ${explica[nivel]}. Use "cta_nivel": "${nivel}".`,
    formaAnterior ? `Forma do exemplo no dia anterior: ${formaAnterior}. Use outra.` : "",
    tema ? `Pedido do Daniel para hoje: "${tema.slice(0, 500)}". Atenda dentro desta pauta.` : "",
    `<capitulo numero="${pauta.cap}" titulo="${cap.titulo}">\n${cap.texto}\n</capitulo>`,
  ].filter(Boolean).join("\n\n");
}

function extrairJSON(texto: string): Dados {
  texto = texto.replace(/<think>[\s\S]*?<\/think>/g, "");
  const cerca = texto.match(/```json\s*([\s\S]*?)```/);
  const bruto = cerca ? cerca[1] : texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1);
  return JSON.parse(bruto);
}

function completar(k: Dados, pauta: Pauta, elo: Elo): Dados {
  const fig = F.figuras[String(pauta.dia)];
  for (const s of k.carrossel || []) {
    if (s.tipo === "figura" && (s.figura === "LIVRO" || s.figura == null)) s.figura = fig;
  }
  return { ...k, dia: pauta.dia, fonte: { cap: pauta.cap, figura: `${pauta.titulo} (${pauta.tipo})` }, gerado_em: new Date().toISOString(), modelo: `${elo.provedor}:${elo.modelo}` };
}

export type Eventos = {
  fase: (t: string) => void;
  progresso: (caracteres: number) => void;
};

async function chamar(client: Anthropic, modelo: string, messages: Anthropic.Beta.Messages.BetaMessageParam[], effort: "medium" | "high", ev: Eventos) {
  const stream = client.beta.messages.stream({
    model: modelo,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort },
    system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
    messages,
  });
  let n = 0, ultimo = 0;
  for await (const e of stream) {
    if (e.type === "content_block_delta" && e.delta.type === "text_delta") {
      n += e.delta.text.length;
      if (n - ultimo > 120) { ultimo = n; ev.progresso(n); }
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") throw new Error("O modelo recusou este pedido. Tente outra pauta ou reformule o pedido.");
  if (final.stop_reason === "max_tokens") throw new Error("A resposta passou do limite de tamanho. Tente de novo.");
  const texto = final.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return { final, texto };
}

type Resposta = { texto: string; final?: Anthropic.Beta.Messages.BetaMessage; uso?: Uso };

const ORCAMENTO_MS = 270_000; // a função da Vercel vai até 300 s

async function pedir(elo: Elo, usuario: string, anterior: Resposta | null, correcao: string | null, limiteMs: number, ev: Eventos): Promise<Resposta> {
  if (elo.provedor === "openrouter") {
    const msgs: MensagemTexto[] = [{ role: "system", content: SISTEMA }, { role: "user", content: usuario }];
    if (anterior && correcao) msgs.push({ role: "assistant", content: anterior.texto }, { role: "user", content: correcao });
    return chamarOpenRouter(elo.modelo, msgs, ev.progresso, limiteMs);
  }
  const client = new Anthropic({ timeout: limiteMs, maxRetries: 0 });
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [{ role: "user", content: usuario }];
  if (anterior?.final && correcao) {
    messages.push({ role: "assistant", content: anterior.final.content as Anthropic.Beta.Messages.BetaContentBlockParam[] }, { role: "user", content: correcao });
  }
  const r = await chamar(client, elo.modelo, messages, anterior ? "medium" : "high", ev);
  return { ...r, uso: { entrada: r.final.usage.input_tokens + (r.final.usage.cache_read_input_tokens || 0) + (r.final.usage.cache_creation_input_tokens || 0), saida: r.final.usage.output_tokens } };
}

function somar(a: Uso | undefined, b: Uso | undefined): Uso | undefined {
  if (!a) return b;
  if (!b) return a;
  return { entrada: a.entrada + b.entrada, saida: a.saida + b.saida, custo: a.custo != null || b.custo != null ? (a.custo || 0) + (b.custo || 0) : undefined };
}

const nomeCurto = (elo: Elo) => elo.modelo.replace(/:free$/, "").split("/").pop() || elo.modelo;

export async function gerarKit(pedido: string, feitos: number[], ev: Eventos, conf?: ConfigModelos | null): Promise<{ kit: Dados; verificacao: Resultado }> {
  const elos = cadeia(conf);
  if (!elos.length) throw new Error("Falta configurar OPENROUTER_API_KEY (ou ANTHROPIC_API_KEY) na Vercel para gerar dias novos.");
  const { pauta, tema } = escolherPauta(pedido, feitos);
  const rotulo = `Dia ${String(pauta.dia).padStart(2, "0")} · capítulo ${pauta.cap} · ${pauta.titulo}`;
  const usuario = mensagemUsuario(pauta, tema);
  const inicio = Date.now();
  const falhas: string[] = [];

  for (const elo of elos) {
    const resta = ORCAMENTO_MS - (Date.now() - inicio);
    if (resta < 35_000) break;
    ev.fase(`${rotulo} · ${nomeCurto(elo)}`);
    let r1: Resposta, kit: Dados;
    try {
      r1 = await pedir(elo, usuario, null, null, Math.min(resta, 170_000), ev);
      kit = completar(extrairJSON(r1.texto), pauta, elo);
    } catch (e) {
      falhas.push(`${nomeCurto(elo)}: ${(e as Error).message}`);
      ev.fase(`${nomeCurto(elo)} não respondeu; tentando o próximo`);
      continue;
    }
    let uso = r1.uso;
    let v = verificar(kit, F.antivicios);
    const sobra = ORCAMENTO_MS - (Date.now() - inicio);
    if (v.erros.length && sobra > 45_000) {
      ev.fase(`${rotulo} · revisando a voz`);
      try {
        const correcao = `O verificador reprovou o kit por estes motivos:\n- ${v.erros.join("\n- ")}\n\nDevolva o kit inteiro corrigido, no mesmo formato, mudando só o necessário.`;
        const r2 = await pedir(elo, usuario, r1, correcao, Math.min(sobra - 10_000, 150_000), ev);
        uso = somar(uso, r2.uso);
        const kit2 = completar(extrairJSON(r2.texto), pauta, elo);
        const v2 = verificar(kit2, F.antivicios);
        if (v2.erros.length <= v.erros.length) { kit = kit2; v = v2; }
      } catch {
        /* a correção falhou: fica a primeira versão, com os erros apontados na tela */
      }
    }
    return { kit: { ...kit, uso, falhas: falhas.length ? falhas : undefined }, verificacao: v };
  }
  throw new Error(`Nenhum modelo conseguiu escrever agora. ${falhas.slice(-3).join(" · ") || "Sem tempo para tentar outro."}`);
}
