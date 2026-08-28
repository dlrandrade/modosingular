/* ---------------------------------------------------------------
   MODO SINGULAR — modelo de conteúdo
   Cada capítulo é dado tipado. O renderer transforma em UI rica.
---------------------------------------------------------------- */

export type Fase = 1 | 2 | 3 | 4 | 5;

/* ----------------------------- BLOCOS ----------------------------- */

export type Block =
  | { t: "p"; text: string }
  | { t: "lead"; text: string }
  | { t: "h"; text: string }
  | { t: "quote"; text: string; fonte?: string }
  | { t: "callout"; kind: CalloutKind; titulo: string; texto: string }
  | { t: "list"; ordered?: boolean; items: string[] }
  | { t: "checklist"; titulo?: string; items: string[] }
  | { t: "steps"; items: { titulo: string; texto: string }[] }
  | { t: "def"; termo: string; texto: string }
  | { t: "table"; caption?: string; head: string[]; rows: string[][] }
  | { t: "compare"; esquerda: Lado; direita: Lado }
  | { t: "stats"; items: { valor: string; rotulo: string; nota?: string }[] }
  | { t: "diagram"; diagram: Diagram }
  | { t: "chart"; chart: Chart }
  | { t: "example"; titulo: string; ruim: string; bom: string; porque: string };

export type CalloutKind = "tese" | "insight" | "alerta" | "pratica" | "citacao";

export type Lado = { titulo: string; tom: "neg" | "pos"; items: string[] };

/* --------------------------- DIAGRAMAS ---------------------------- */

export type Diagram =
  | { kind: "gap"; titulo: string; a: BarItem; b: BarItem; legenda?: string }
  | { kind: "funil"; titulo: string; etapas: { rotulo: string; nota?: string }[] }
  | { kind: "quadrante"; titulo: string; eixoX: [string, string]; eixoY: [string, string];
      pontos: { x: number; y: number; rotulo: string; destaque?: boolean }[] }
  | { kind: "fluxo"; titulo: string; nos: { rotulo: string; nota?: string }[]; ciclico?: boolean }
  | { kind: "camadas"; titulo: string; camadas: { rotulo: string; nota?: string }[] }
  | { kind: "espectro"; titulo: string; esquerda: string; direita: string;
      marcas: { pos: number; rotulo: string }[] }
  | { kind: "balanca"; titulo: string; esquerda: { rotulo: string; peso: number };
      direita: { rotulo: string; peso: number } }
  | { kind: "matriz"; titulo: string; colunas: string[]; linhas: { rotulo: string; celulas: (0|1|2)[] }[] }
  | { kind: "orbita"; titulo: string; centro: string; satelites: string[] };

export type BarItem = { rotulo: string; valor: number; nota?: string };

/* ---------------------------- GRÁFICOS ---------------------------- */

export type Chart =
  | { kind: "barras"; titulo: string; unidade?: string; series: BarItem[] }
  | { kind: "linha"; titulo: string; unidade?: string; labels: string[];
      series: { nome: string; pontos: number[]; destaque?: boolean }[] }
  | { kind: "area-acumulada"; titulo: string; labels: string[]; pontos: number[]; nota?: string }
  | { kind: "radar"; titulo: string; eixos: string[]; series: { nome: string; valores: number[] }[] };

/* ------------------------- QUIZ / TESTE --------------------------- */

export interface QuizQuestion {
  id: string;
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

/** Teste = auto-diagnóstico sem resposta "certa"; devolve leitura interpretativa. */
export interface Teste {
  titulo: string;
  instrucao: string;
  escala: string[];              // rótulos de 1..N
  itens: { id: string; texto: string; invertido?: boolean }[];
  faixas: { min: number; max: number; titulo: string; leitura: string }[];
}

/* ---------------- PONTUAÇÃO DE APLICAÇÃO -------------------------- */

export interface CriterioAplicacao {
  id: string;
  rotulo: string;
  ajuda: string;
  peso: number;                  // relativo
}

/* ------------------------- TAREFA DO DIA -------------------------- */

export interface Tarefa {
  titulo: string;
  objetivo: string;
  tempoMin: number;
  entrega: string;               // o que precisa existir ao final
  formatoSugerido: string[];     // reels | carrossel | texto | story | e-mail
  campos: { id: string; rotulo: string; placeholder: string; linhas?: number }[];
  criteriosDeQualidade: string[];
}

/* --------------------- DIRETRIZES DE PRODUÇÃO --------------------- */

export interface Diretrizes {
  titulo: string;
  regras: { regra: string; porque: string }[];
  facaAssim: string[];
  eviteAssim: string[];
  gabarito?: { rotulo: string; texto: string }[];  // estrutura/esqueleto pronto
}

/* --------------------------- CAPÍTULO ----------------------------- */

export interface Capitulo {
  n: number;                     // 1..30
  fase: Fase;
  tema: string;
  subtitulo: string;
  frase: string;                 // a frase do dia
  conceito: { termo: string; definicao: string; porqueImporta: string };
  ilustracao: Ilustracao;
  conteudo: Block[];
  insights: string[];
  criterios: CriterioAplicacao[];
  quiz: QuizQuestion[];
  teste?: Teste;
  tarefa: Tarefa;
  diretrizes: Diretrizes;
  leituraMin: number;
}

/** Ilustração conceitual em SVG, gerada por composição de primitivas. */
export interface Ilustracao {
  motivo:
    | "espelho" | "ponte" | "iceberg" | "megafone" | "raizes" | "chave"
    | "lente" | "prisma" | "semente" | "engrenagem" | "mapa" | "farol"
    | "colheita" | "impressao-digital" | "territorio";
  legenda: string;
}

export interface Fasedef {
  n: Fase;
  nome: string;
  promessa: string;
  capitulos: [number, number];
}

export const FASES: Fasedef[] = [
  { n: 1, nome: "O Diagnóstico",   promessa: "Entender por que sua presença digital não representa a autoridade que você já tem.", capitulos: [1, 6] },
  { n: 2, nome: "A Descoberta",    promessa: "Encontrar a sua linguagem criativa — o modo em que você é mais potente.",           capitulos: [7, 12] },
  { n: 3, nome: "A Tradução",      promessa: "Converter experiência vivida em conteúdo publicável, sem virar personagem.",        capitulos: [13, 18] },
  { n: 4, nome: "O Sistema",       promessa: "Incorporar a criação à rotina para que ela pare de depender de inspiração.",        capitulos: [19, 24] },
  { n: 5, nome: "O Território",    promessa: "Transformar presença em ativo de prospecção e ocupar o espaço que é seu.",          capitulos: [25, 30] },
];
