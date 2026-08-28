import type { Capitulo } from "./types";
import { FASE1 } from "./capitulos/fase1";
import { FASE2 } from "./capitulos/fase2";
import { FASE3 } from "./capitulos/fase3";
import { FASE4 } from "./capitulos/fase4";
import { FASE5 } from "./capitulos/fase5";

export * from "./types";

export const CAPITULOS: Capitulo[] = [...FASE1, ...FASE2, ...FASE3, ...FASE4, ...FASE5]
  .sort((a, b) => a.n - b.n);

export function getCapitulo(n: number): Capitulo | undefined {
  return CAPITULOS.find((c) => c.n === n);
}

export const TOTAL = CAPITULOS.length;
