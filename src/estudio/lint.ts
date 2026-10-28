/* ---------------------------------------------------------------
   Verificador do kit do dia — versão TypeScript das mesmas regras
   de estudio/estudio.py (lint). Se mudar uma, mude a outra.
--------------------------------------------------------------- */
import { FIGURAS_PRONTAS, FORMAS_EXEMPLO, FUNDOS, type Dados } from "./slides";

export const ETAPAS: [string, string][] = [
  ["hook", "Gancho"],
  ["lead", "Introdução"],
  ["body1", "Desenvolvimento 1"],
  ["loop1", "Gancho de curiosidade 1"],
  ["body2", "Desenvolvimento 2"],
  ["loop2", "Gancho de curiosidade 2"],
  ["body3", "Desenvolvimento 3"],
  ["cta", "CTA"],
];

const FAIXAS: Record<number, [number, number]> = { 30: [80, 100], 45: [118, 142], 60: [158, 192] };
export const PALAVRAS_POR_SEG = 3.0;
const ORCAMENTO: Record<string, Record<number, [number, number]>> = {
  hook: { 45: [9, 12], 60: [10, 14] }, lead: { 45: [14, 20], 60: [16, 22] }, body1: { 45: [22, 28], 60: [26, 34] },
  loop1: { 45: [8, 12], 60: [8, 14] }, body2: { 45: [18, 24], 60: [20, 28] }, loop2: { 45: [6, 10], 60: [6, 12] },
  body3: { 45: [26, 34], 60: [36, 48] }, cta: { 45: [18, 24], 60: [30, 40] },
}; // MANUAL, seção 2.1
export const CAMPOS_FICHA = ["ideia", "conceito", "cena", "detalhe", "figura", "virada", "aplicacao", "exercicio"];
const LIMITE_HOOK = 14;
const LIMITE_INTRO = 34;

const LE = "\\p{L}";
const NAO_E_E = new RegExp(
  `(?<!${LE})não é(?!${LE})[^.?!\\n]{1,90}?[,;:—–-]\\s*(?:é|e sim|mas)(?!${LE})|(?<!${LE})não (?:é|são|foi) [^.?!\\n]{1,80}[.!]\\s+(?:É|São|Foi)(?!${LE})`,
  "iu",
);
const EXTRAS = [
  "voc[eê] sabia", "vou te contar", "segredo", "olá", "bom dia", "oi,? pessoal", "fala,? (?:galera|pessoal)",
  "garant(?:o|ido|e|ia)", "resultado garantido", "cliente meu", "paciente meu", "minha cliente", "minha paciente", "como eu sempre digo",
].map((p) => new RegExp(`(?<!${LE})${p}(?!${LE})`, "iu"))
  .concat([new RegExp(`(?:^|[.!?]\\s+)gente(?!${LE})`, "iu"), new RegExp(`(?<!${LE})salve[,!]`, "iu")]);
const ACOES: Record<string, RegExp> = {
  salve: /(?<!\p{L})salv(?:e|ar)(?!\p{L})/iu,
  compartilhe: /(?<!\p{L})compartilh(?:e|ar)(?!\p{L})/iu,
  comente: /(?<!\p{L})coment(?:e|ar)(?!\p{L})/iu,
  siga: /(?<!\p{L})sig(?:a|ar)(?!\p{L})/iu,
  link: /(?<!\p{L})link(?!\p{L})/iu,
  escreva: /(?<!\p{L})escreva(?!\p{L})/iu,
};

export function palavras(t?: string): number {
  return (String(t || "").match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
}

function textos(k: Dados): [string, string][] {
  const out: [string, string][] = [];
  const r = k.roteiro || {};
  for (const [e] of ETAPAS) out.push([`roteiro.${e}`, r[e] || ""]);
  (k.carrossel || []).forEach((s: Dados, i: number) => {
    for (const c of ["titulo", "sub", "fala", "apoio", "tag", "acao", "quem", "texto", "comum", "singular", "porque", "pergunta", "resposta", "nota"]) {
      if (s[c]) out.push([`slide${i + 1}.${c}`, String(s[c])]);
    }
    for (const x of s.itens || []) out.push([`slide${i + 1}.item`, `${x.rotulo} ${x.texto}`]);
    const fg = typeof s.figura === "object" ? s.figura : {};
    for (const c of ["camadas", "nos", "passos", "etapas", "degraus", "series"]) {
      for (const x of fg[c] || []) out.push([`slide${i + 1}.fig`, `${x.rotulo} ${x.nota || ""}`]);
    }
  });
  out.push(["legenda", k.legenda || ""]);
  return out;
}

export type Resultado = { erros: string[]; avisos: string[]; palavras: number; segundos: number };

export function verificar(k: Dados, antivicios: string[]): Resultado {
  const erros: string[] = [];
  const avisos: string[] = [];
  const r = k.roteiro || {};
  const dur = Number(k.duracao) || 45;
  for (const [e] of ETAPAS) if (!String(r[e] || "").trim()) erros.push(`roteiro: etapa '${e}' vazia`);
  const total = ETAPAS.reduce((n, [e]) => n + palavras(r[e]), 0);
  const [lo, hi] = FAIXAS[dur] || [100, 150];
  if (total < lo || total > hi) erros.push(`roteiro tem ${total} palavras (~${Math.round(total / PALAVRAS_POR_SEG)} s); para ${dur} s o alvo é ${lo}–${hi}`);
  if (palavras(r.hook) > LIMITE_HOOK) erros.push(`hook com ${palavras(r.hook)} palavras (máx. ${LIMITE_HOOK})`);
  const intro = palavras(r.hook) + palavras(r.lead);
  if (intro > LIMITE_INTRO) erros.push(`hook + lead com ${intro} palavras (máx. ${LIMITE_INTRO}): a introdução termina por volta dos 10 s`);
  for (const [e, f] of Object.entries(ORCAMENTO)) {
    const [a, b] = f[dur] || f[60];
    const n = palavras(r[e]);
    if (n && (n < a || n > b)) avisos.push(`${e} com ${n} palavras; o manual pede ${a}–${b} para ${dur} s`);
  }
  for (const e of ["loop1", "loop2"]) if (palavras(r[e]) > 30) avisos.push(`${e} longo: a lacuna deve ser uma frase`);
  if (palavras(r.cta) > 50) avisos.push("cta longo (> 50 palavras)");
  const pedidos = Object.entries(ACOES).filter(([, rx]) => rx.test(r.cta || "")).map(([n]) => n);
  if (pedidos.length > 1) avisos.push(`cta pede mais de uma ação (${pedidos.join(", ")})`);

  const av = antivicios.map((p) => { try { return new RegExp(p, "iu"); } catch { return null; } }).filter(Boolean) as RegExp[];
  for (const [onde, t] of textos(k)) {
    for (const rx of [...av, ...EXTRAS]) {
      const m = rx.exec(t);
      if (m) erros.push(`${onde}: expressão vetada '${m[0].trim()}'`);
    }
    if (NAO_E_E.test(t)) erros.push(`${onde}: fórmula 'não é X, é Y'`);
    if (/\{[^}]*\}/.test(t)) erros.push(`${onde}: marcador não preenchido`);
  }

  const sl: Dados[] = k.carrossel || [];
  if (sl.length < 6 || sl.length > 10) erros.push(`carrossel com ${sl.length} slides (6 a 10)`);
  if (sl.length && sl[0].tipo !== "capa") erros.push("o primeiro slide deve ser 'capa'");
  if (sl.length && sl[sl.length - 1].tipo !== "cta") erros.push("o último slide deve ser 'cta'");
  if (!sl.some((s) => s.tipo === "figura")) erros.push("o carrossel precisa de um slide 'figura'");
  const exs = sl.filter((s) => s.tipo === "exemplo");
  if (!exs.length) erros.push("o carrossel precisa de um slide 'exemplo' (como ficaria, na prática)");
  for (const s of exs) if (!FORMAS_EXEMPLO.includes(s.forma)) erros.push(`exemplo com forma '${s.forma}'`);
  for (const s of sl) {
    if (s.fundo && !FUNDOS.includes(s.fundo)) erros.push(`fundo '${s.fundo}' não existe (${FUNDOS.join(", ")})`);
    if (s.tipo === "figura" && typeof s.figura === "object" && !FIGURAS_PRONTAS.includes(s.figura?.tipo)) {
      erros.push(`figura do tipo '${s.figura?.tipo}' não tem desenho`);
    }
    const n = ["titulo", "sub", "fala", "apoio", "tag"].reduce((a, c) => a + palavras(s[c]), 0) +
      (s.itens || []).reduce((a: number, x: Dados) => a + palavras(`${x.rotulo} ${x.texto}`), 0);
    if (n > 55) avisos.push(`slide com ${n} palavras: um slide, uma ideia`);
  }
  for (const campo of CAMPOS_FICHA) if (!String(k.ficha?.[campo] || "").trim()) erros.push(`ficha: campo '${campo}' vazio`);
  const lg = String(k.legenda || "");
  if (lg.length < 350 || lg.length > 2200) erros.push(`legenda com ${lg.length} caracteres (350 a 2200)`);
  if ((lg.match(/#[\p{L}\p{N}_]+/gu) || []).length > 5) erros.push("legenda com mais de 5 hashtags");
  return { erros, avisos, palavras: total, segundos: Math.round(total / PALAVRAS_POR_SEG) };
}
