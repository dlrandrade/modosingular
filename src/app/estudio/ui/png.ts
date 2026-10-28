import { toPng } from "html-to-image";
import { A, L, RA, RL, reelsHTML, slideHTML, type Contexto, type Dados } from "@/estudio/slides";

const FONTES = [
  ["EB Garamond", "normal", "400 800", "eb-garamond-latin-wght-normal.woff2"],
  ["EB Garamond", "italic", "400 800", "eb-garamond-latin-wght-italic.woff2"],
  ["Inter Tight", "normal", "100 900", "inter-tight-latin-wght-normal.woff2"],
  ["Inter Tight", "italic", "100 900", "inter-tight-latin-wght-italic.woff2"],
];
let fontesEmbutidas: Promise<string> | null = null;

/** As fontes do slide, já como data URL: o PNG não depende de nenhuma folha de estilo da página. */
function fontesCSS(base: string): Promise<string> {
  fontesEmbutidas ??= Promise.all(FONTES.map(async ([familia, estilo, peso, arq]) => {
    const blob = await (await fetch(`${base}/${arq}`)).blob();
    const url = await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(blob); });
    return `@font-face{font-family:"${familia}";font-style:${estilo};font-weight:${peso};src:url(${url}) format("woff2")}`;
  })).then((r) => r.join("\n"));
  return fontesEmbutidas;
}

/** Desenha o slide em tamanho real fora da tela e baixa como PNG (1080 × 1350). */
export async function baixarSlide(s: Dados, i: number, total: number, ctx: Contexto, nome: string) {
  const caixa = document.createElement("div");
  caixa.style.cssText = `position:fixed;left:-30000px;top:0;width:${L}px;height:${A}px;pointer-events:none`;
  caixa.innerHTML = slideHTML(s, i, total, ctx);
  (document.querySelector(".est") || document.body).appendChild(caixa);
  try {
    await document.fonts.ready;
    const fontEmbedCSS = await fontesCSS(ctx.fontBase || "/estudio/fontes");
    const url = await toPng(caixa.firstElementChild as HTMLElement, { width: L, height: A, pixelRatio: 1, fontEmbedCSS });
    baixar(url, nome);
  } finally {
    caixa.remove();
  }
}

/** A figura para o Reels: 1080 × 1920, fundo transparente, a figura num cartão no alto (para ficar acima da cabeça no modo selfie). */
export async function baixarReels(s: Dados, ctx: Contexto, tom: "claro" | "escuro", nome: string) {
  const caixa = document.createElement("div");
  caixa.style.cssText = `position:fixed;left:-30000px;top:0;width:${RL}px;height:${RA}px;pointer-events:none`;
  caixa.innerHTML = reelsHTML(s, ctx, tom);
  (document.querySelector(".est") || document.body).appendChild(caixa);
  try {
    await document.fonts.ready;
    const fontEmbedCSS = await fontesCSS(ctx.fontBase || "/estudio/fontes");
    const url = await toPng(caixa.firstElementChild as HTMLElement, { width: RL, height: RA, pixelRatio: 1, fontEmbedCSS });
    baixar(url, nome);
  } finally {
    caixa.remove();
  }
}

export function baixar(url: string, nome: string) {
  const a = document.createElement("a");
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
}

export function baixarTexto(conteudo: string, nome: string, tipo = "application/json") {
  const url = URL.createObjectURL(new Blob([conteudo], { type: `${tipo};charset=utf-8` }));
  baixar(url, nome);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
