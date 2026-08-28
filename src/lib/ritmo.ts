/* ---------------------------------------------------------------
   REGRA DE RITMO — Modo Singular

   Sugestão: 1 capítulo por dia (30 dias).
   Adiantamento: permitido, mas limitado à proporção que faz a
   jornada terminar em, no mínimo, 7 dias.

     teto(dia) = ceil(dia * 30 / 7)

     D1 → 5   D2 → 9   D3 → 13  D4 → 18
     D5 → 22  D6 → 26  D7 → 30

   O usuário "segue de onde parou": o teto é absoluto por dia, então
   o que ele não consumiu ontem continua disponível hoje.
---------------------------------------------------------------- */

export const TOTAL_CAPITULOS = 30;
export const DIAS_MINIMOS = 7;
export const CAPITULOS_GRATIS = 3;

/** Dia da jornada (1-indexado) no fuso do usuário. */
export function diaDaJornada(
  inicio: Date | string,
  timezone = "America/Sao_Paulo",
  agora: Date = new Date(),
): number {
  const a = diaCivil(new Date(inicio), timezone);
  const b = diaCivil(agora, timezone);
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

/** Meia-noite civil da data, no fuso indicado, como Date em UTC. */
function diaCivil(d: Date, timezone: string): Date {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [{ value: y }, , { value: m }, , { value: dd }] = f.formatToParts(d) as any;
  return new Date(`${y}-${m}-${dd}T00:00:00Z`);
}

/** Teto de capítulos liberados no dia N. */
export function tetoDoDia(dia: number): number {
  if (dia < 1) return 1;
  return Math.min(TOTAL_CAPITULOS, Math.ceil((dia * TOTAL_CAPITULOS) / DIAS_MINIMOS));
}

/** Quantos capítulos ainda posso adiantar hoje, dado quantos já concluí. */
export function saldoDeAdiantamento(dia: number, concluidos: number): number {
  return Math.max(0, tetoDoDia(dia) - concluidos);
}

/** O capítulo "de hoje" segundo a sugestão diária: o primeiro não concluído. */
export function capituloSugerido(concluidos: number): number {
  return Math.min(TOTAL_CAPITULOS, concluidos + 1);
}

export type MotivoBloqueio = "ritmo" | "sequencia" | "assinatura" | null;

export interface EstadoCapitulo {
  n: number;
  liberado: boolean;
  concluido: boolean;
  motivo: MotivoBloqueio;
}

export interface EntradaGating {
  dia: number;
  concluidos: number[];         // números dos capítulos concluídos
  assinaturaAtiva: boolean;
}

/**
 * Decide o estado de cada um dos 30 capítulos.
 *
 * Regras, em ordem:
 *  1. Sequência — só abre o próximo depois de concluir o anterior.
 *  2. Assinatura — a partir do capítulo 4 exige assinatura ativa.
 *  3. Ritmo — não passa do teto proporcional do dia.
 */
export function calcularGating({ dia, concluidos, assinaturaAtiva }: EntradaGating): EstadoCapitulo[] {
  const feitos = new Set(concluidos);
  const totalFeitos = feitos.size;
  const teto = tetoDoDia(dia);

  // Primeiro capítulo em aberto na sequência.
  let proximo = 1;
  while (proximo <= TOTAL_CAPITULOS && feitos.has(proximo)) proximo++;

  return Array.from({ length: TOTAL_CAPITULOS }, (_, i) => {
    const n = i + 1;
    const concluido = feitos.has(n);
    if (concluido) return { n, liberado: true, concluido, motivo: null };

    if (n > proximo) return { n, liberado: false, concluido, motivo: "sequencia" as const };
    if (n > CAPITULOS_GRATIS && !assinaturaAtiva)
      return { n, liberado: false, concluido, motivo: "assinatura" as const };
    if (totalFeitos >= teto) return { n, liberado: false, concluido, motivo: "ritmo" as const };

    return { n, liberado: true, concluido, motivo: null };
  });
}

/** Texto humano para o motivo do bloqueio. */
export function textoBloqueio(motivo: MotivoBloqueio, dia: number): string {
  switch (motivo) {
    case "ritmo":
      return `Você já usou todo o adiantamento de hoje (${tetoDoDia(dia)} capítulos). ` +
             `A jornada foi desenhada para não terminar em menos de 7 dias — ` +
             `presença se constrói com repetição, não com maratona. Volte amanhã.`;
    case "sequencia":
      return "Conclua o capítulo anterior para abrir este.";
    case "assinatura":
      return "Os três primeiros capítulos são livres. A partir daqui, é preciso assinar.";
    default:
      return "";
  }
}

/** Data prevista de conclusão mantendo 1 capítulo/dia. */
export function previsaoConclusao(inicio: Date | string, concluidos: number): Date {
  const restantes = TOTAL_CAPITULOS - concluidos;
  const d = new Date();
  d.setDate(d.getDate() + restantes);
  return d;
}
