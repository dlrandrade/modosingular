import { toBlob } from "html-to-image";
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

// O Safari (iPhone, iPad, Mac) às vezes desenha a primeira imagem sem as fontes: lá, desenha-se duas vezes.
const SAFARI = typeof navigator !== "undefined" && /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

/** Desenha um HTML em tamanho real, fora da tela, e devolve o PNG. Fundo transparente onde o HTML não pinta. */
async function desenhar(html: string, largura: number, altura: number, ctx: Contexto): Promise<Blob> {
  const caixa = document.createElement("div");
  caixa.style.cssText = `position:fixed;left:-30000px;top:0;width:${largura}px;height:${altura}px;pointer-events:none;contain:strict`;
  caixa.innerHTML = html;
  document.body.appendChild(caixa); // fora do .est, que rola: nada mexe na tela enquanto desenha
  try {
    await document.fonts.ready;
    const fontEmbedCSS = await fontesCSS(ctx.fontBase || "/estudio/fontes");
    const alvo = caixa.firstElementChild as HTMLElement;
    const opcoes = { width: largura, height: altura, pixelRatio: 1, fontEmbedCSS, cacheBust: false };
    if (SAFARI) await toBlob(alvo, opcoes).catch(() => null);
    const b = await toBlob(alvo, opcoes);
    if (!b) throw new Error("não consegui desenhar a imagem");
    return b;
  } finally {
    caixa.remove();
  }
}

const dois = (n: number) => String(n).padStart(2, "0");
const arquivo = (b: Blob, nome: string) => new File([b], nome, { type: "image/png" });

/** O slide (1080 × 1350) como arquivo PNG. */
export async function slideArquivo(s: Dados, i: number, total: number, ctx: Contexto, nome: string): Promise<File> {
  return arquivo(await desenhar(slideHTML(s, i, total, ctx), L, A, ctx), nome);
}

/** A figura para o Reels: 1080 × 1920, fundo transparente, a figura num cartão no alto (para ficar acima da cabeça no modo selfie). */
export async function reelsArquivo(s: Dados, ctx: Contexto, tom: "claro" | "escuro", nome: string): Promise<File> {
  return arquivo(await desenhar(reelsHTML(s, ctx, tom), RL, RA, ctx), nome);
}

/** O carrossel inteiro como arquivos, prontos para a folha de compartilhar do celular. */
export async function arquivosDoCarrossel(slides: Dados[], ctx: Contexto, nome: string, aoAvancar?: (n: number) => void): Promise<File[]> {
  const out: File[] = [];
  for (let i = 0; i < slides.length; i++) {
    out.push(await slideArquivo(slides[i], i + 1, slides.length, ctx, `${nome}-slide-${dois(i + 1)}.png`));
    aoAvancar?.(i + 1);
  }
  return out;
}

/** O navegador sabe mandar imagens para outros apps (Fotos, Instagram)? No celular, é assim que se salva. */
export function compartilhaArquivos(): boolean {
  try {
    const f = new File([new Blob(["x"], { type: "image/png" })], "x.png", { type: "image/png" });
    return typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [f] });
  } catch {
    return false;
  }
}

/** Celular ou tablet (toque), onde baixar por link não funciona bem (no iPhone, não funciona no app instalado). */
export function aparelhoDeToque(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/** Baixa arquivos pelo navegador (computador). URL de blob, que vale para arquivos grandes. */
export async function baixarArquivos(arquivos: File[]) {
  for (const f of arquivos) {
    const url = URL.createObjectURL(f);
    baixar(url, f.name);
    setTimeout(() => URL.revokeObjectURL(url), 20_000);
    if (arquivos.length > 1) await new Promise((r) => setTimeout(r, 400));
  }
}

export function baixar(url: string, nome: string) {
  const a = document.createElement("a");
  a.href = url; a.download = nome; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
}

export function baixarTexto(conteudo: string, nome: string, tipo = "application/json") {
  const url = URL.createObjectURL(new Blob([conteudo], { type: `${tipo};charset=utf-8` }));
  baixar(url, nome);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
