/* ---------------------------------------------------------------
   Estúdio Singular — renderizador de slides (1080 × 1350).

   Uma fonte só para os dois usos:
   - a plataforma /estudio (o navegador desenha os slides ao vivo);
   - o gerador de PNG do repositório (estudio/carrossel.py chama
     `node src/estudio/cli-slides.ts`, que usa este mesmo arquivo).
   Por isso este módulo não importa nada e só usa sintaxe que o Node
   executa direto (tipos são apagados; nada de enum).

   Linguagem visual: casamento de fontes. Títulos na grotesca Inter
   Tight (da família da Inter do PWA), apertada e forte; o itálico
   dentro deles e todo o texto de apoio na EB Garamond. Cores do
   Modo Singular (papel, tinta, ouro). Muito espaço. Só o cerne.

   Marcação inline nos textos dos kits:
     *assim*   → itálico
     **assim** → negrito
--------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dados = Record<string, any>;

export type Contexto = {
  handle?: string;
  rotuloDia?: string;
  assinatura?: string;
  fontBase?: string; // pasta onde estão os .woff2 (URL ou file://)
};

export const L = 1080;
export const A = 1350;

export const FIGURAS_PRONTAS = [
  "camadas", "fluxo", "passos", "barras", "balanca", "escada", "funil", "gap", "quadrante", "espectro",
];
export const FORMAS_EXEMPLO = ["post", "antes_depois", "rascunho", "conversa"];

export function esc(t: unknown): string {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function md(t: unknown): string {
  return esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/([\p{L}]+(?:-[\p{L}]+)+)/gu, '<span class="nq">$1</span>'); // palavra com hífen não quebra
}

export function marca(tam = 44, cor = "currentColor"): string {
  const arcos = [11, 8, 5]
    .map((r, i) => `<path d="M${16 - r} 16 a${r} ${(r * 1.2).toFixed(1)} 0 0 1 ${r * 2} 0" fill="none" stroke="${cor}" stroke-width="1.3" opacity="${(1 - i * 0.22).toFixed(2)}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${tam}" height="${tam}"><circle cx="16" cy="16" r="14.5" fill="none" stroke="${cor}" stroke-width=".8" opacity=".45"/>${arcos}<circle cx="16" cy="16" r="1.6" fill="${cor}"/></svg>`;
}

export function css(fontBase = "/estudio/fontes"): string {
  return `
@font-face { font-family: "EB Garamond"; src: url(${fontBase}/eb-garamond-latin-wght-normal.woff2) format("woff2"); font-weight: 400 800; font-style: normal; }
@font-face { font-family: "EB Garamond"; src: url(${fontBase}/eb-garamond-latin-wght-italic.woff2) format("woff2"); font-weight: 400 800; font-style: italic; }
@font-face { font-family: "Inter Tight"; src: url(${fontBase}/inter-tight-latin-wght-normal.woff2) format("woff2"); font-weight: 100 900; font-style: normal; }
@font-face { font-family: "Inter Tight"; src: url(${fontBase}/inter-tight-latin-wght-italic.woff2) format("woff2"); font-weight: 100 900; font-style: italic; }
.sl { --papel:#faf9f6; --tinta:#16181d; --t2:#4e5460; --t3:#878e9c; --fio:#e0dcd2; --acento:#9a7328; --acento-bg:#f0e6cf; --cartao:#ffffff;
  --serif: "EB Garamond", Garamond, serif; --sans: "Inter Tight", "Inter", "Helvetica Neue", Arial, sans-serif;
  position: relative; width: 1080px; height: 1350px; overflow: hidden; box-sizing: border-box;
  padding: 112px 112px 150px; display: flex; flex-direction: column;
  background: var(--papel); color: var(--tinta); font-family: var(--serif); font-weight: 400;
  font-feature-settings: "kern", "liga"; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }
.sl * { box-sizing: border-box; margin: 0; padding: 0; }
.sl.escuro { --papel:#0b0c0f; --tinta:#eceef3; --t2:#a8afbd; --t3:#6b7383; --fio:#262b36; --acento:#d8b26a; --acento-bg:#3a3222; --cartao:#15181f; }
.sl h1, .sl h2 { font-weight: 400; }
.sl .nq { white-space: nowrap; }
.sl em { font-style: italic; }
.sl strong { font-weight: 600; }

/* o casamento: títulos na grotesca, o itálico dentro deles na Garamond */
.sl .ds { font-family: var(--sans); font-weight: 650; letter-spacing: -.035em; font-feature-settings: "kern", "ss01"; }
.sl .ds em { font-family: var(--serif); font-style: italic; font-weight: 400; letter-spacing: -.012em; font-size: 1.07em; line-height: 0; }
.sl .ds strong { font-weight: 800; }

.sl .rot { font-family: var(--serif); font-style: italic; font-size: 30px; line-height: 1.1; color: var(--t3); }
.sl .rot.ac { color: var(--acento); }
.sl .rodape { position: absolute; left: 112px; right: 112px; bottom: 64px; display: flex; justify-content: space-between; align-items: baseline; color: var(--t3); }
.sl .rodape .m { font-family: var(--serif); font-style: italic; font-size: 26px; }
.sl .rodape .c { font-family: var(--sans); font-size: 19px; font-weight: 500; letter-spacing: .08em; }
.sl .centro { flex: 1; display: flex; flex-direction: column; justify-content: center; }

/* capa */
.sl.capa .topo { display: flex; justify-content: space-between; align-items: center; color: var(--t3); }
.sl.capa h1 { font-size: 140px; line-height: .94; }
.sl.capa .sub { font-size: 44px; line-height: 1.26; font-style: italic; color: var(--t2); margin-top: 52px; max-width: 780px; }
.sl.capa .desliza { display: flex; align-items: center; gap: 22px; margin-top: 84px; font-family: var(--sans); font-size: 19px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: var(--t3); }
.sl.capa .desliza::after { content: ""; width: 160px; border-top: 1.5px solid var(--t3); }

/* texto */
.sl .fala { font-size: 86px; line-height: .98; }
.sl .fala.m { font-size: 68px; line-height: 1.02; }
.sl .fala.g { font-size: 112px; line-height: .94; }
.sl .apoio { font-size: 42px; line-height: 1.34; color: var(--t2); margin-top: 52px; max-width: 820px; }
.sl .tag { font-size: 28px; line-height: 1.35; font-style: italic; color: var(--t3); margin-top: 44px; }
.sl .rot + .fala { margin-top: 36px; }

/* lista */
.sl .itens { margin-top: 56px; }
.sl .item { display: grid; grid-template-columns: 240px 1fr; gap: 30px; border-top: 1.5px solid var(--fio); padding: 30px 0 32px; }
.sl .item .k { font-family: var(--sans); font-weight: 650; letter-spacing: -.02em; font-size: 38px; line-height: 1.05; color: var(--acento); }
.sl .item .v { font-size: 34px; line-height: 1.34; color: var(--t2); }

/* figura */
.sl .ftit { font-size: 70px; line-height: 1.0; margin: 26px 0 0; }
.sl .fig { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 0 10px; }
.sl .leg { font-size: 30px; line-height: 1.38; font-style: italic; color: var(--t2); max-width: 820px; }
.sl .selo { font-family: var(--sans); font-size: 17px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: var(--t3); margin-top: 16px; }
.sl .r { font-family: var(--sans); font-weight: 600; letter-spacing: -.02em; }

.sl .grp { font-family: var(--sans); font-size: 17px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--t3); margin: 30px 0 4px; display: flex; gap: 18px; align-items: center; }
.sl .grp::after { content: ""; flex: 1; border-top: 1.5px dashed var(--fio); }
.sl .grp:first-child { margin-top: 0; }
.sl .cam { display: grid; grid-template-columns: 290px 1fr; gap: 28px; align-items: baseline; padding: 21px 0; border-bottom: 1.5px solid var(--fio); }
.sl .cam .r { font-size: 38px; line-height: 1.04; }
.sl .cam .n { font-size: 29px; line-height: 1.3; color: var(--t2); }
.sl .cam.dest { border-bottom: 3px solid var(--acento); }
.sl .cam.dest .r { color: var(--acento); }
.sl .cam.dest .n { color: var(--tinta); }

.sl .no { display: grid; grid-template-columns: 90px 1fr; gap: 16px; padding: 26px 0; border-bottom: 1.5px solid var(--fio); }
.sl .no:first-child { border-top: 1.5px solid var(--fio); }
.sl .no .c { font-size: 66px; line-height: .86; font-style: italic; color: var(--t3); }
.sl .no.dest .c { color: var(--acento); }
.sl .no .t { font-family: var(--sans); font-weight: 600; letter-spacing: -.02em; font-size: 36px; line-height: 1.12; }
.sl .no .d { font-size: 29px; line-height: 1.32; color: var(--t2); margin-top: 8px; }

.sl .bar { padding: 22px 0; }
.sl .bar .r { font-size: 36px; line-height: 1.1; }
.sl .bar .tri { height: 12px; margin: 18px 0 12px; border-bottom: 1.5px solid var(--fio); position: relative; }
.sl .bar .pr { position: absolute; left: 0; bottom: -1.5px; height: 12px; background: var(--t3); }
.sl .bar.dest .pr { background: var(--acento); }
.sl .bar.dest .r { color: var(--acento); }
.sl .bar .n { font-size: 29px; line-height: 1.32; color: var(--t2); font-style: italic; }
.sl .un { font-family: var(--sans); font-size: 17px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: var(--t3); margin-top: 22px; }

.sl .bal { display: flex; gap: 72px; align-items: flex-end; height: 560px; }
.sl .bal .bc { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
.sl .bal .bb { border: 1.5px solid var(--t3); width: 100%; }
.sl .bal .bb.dest { background: var(--acento); border-color: var(--acento); }
.sl .bal .br { font-family: var(--sans); font-weight: 600; letter-spacing: -.02em; font-size: 34px; line-height: 1.15; margin-top: 26px; min-height: 84px; }
.sl .bal .br.dest { color: var(--acento); }

.sl .deg { display: flex; align-items: baseline; gap: 24px; padding: 18px 0; border-bottom: 1.5px solid var(--fio); }
.sl .deg .num { font-size: 54px; line-height: .9; font-style: italic; color: var(--t3); width: 52px; flex: none; }
.sl .deg .r { font-size: 36px; line-height: 1.1; }
.sl .deg .n { font-size: 28px; line-height: 1.3; color: var(--t2); margin-top: 6px; }
.sl .deg.dest { border-bottom: 3px solid var(--acento); }
.sl .deg.dest .num, .sl .deg.dest .r { color: var(--acento); }

.sl .fun { margin: 0 auto; text-align: center; padding: 16px 0 14px; border-bottom: 1.5px solid var(--fio); }
.sl .fun .r { font-size: 34px; line-height: 1.1; }
.sl .fun .n { font-size: 27px; line-height: 1.3; color: var(--t2); font-style: italic; margin-top: 4px; }
.sl .fun.dest { border-bottom: 3px solid var(--acento); }
.sl .fun.dest .r { color: var(--acento); }

.sl .gapl .r { font-size: 38px; line-height: 1.1; }
.sl .gapl .tri { height: 14px; margin: 18px 0 12px; border-bottom: 1.5px solid var(--fio); position: relative; }
.sl .gapl .pr { position: absolute; left: 0; bottom: -1.5px; height: 14px; background: var(--acento); }
.sl .gapl.b .pr { background: var(--t3); }
.sl .gapl .n { font-size: 29px; line-height: 1.32; color: var(--t2); font-style: italic; }
.sl .dist { position: relative; height: 120px; margin: 22px 0 30px; }
.sl .dist .lin { position: absolute; top: 30px; border-top: 1.5px solid var(--acento); }
.sl .dist .lin::before, .sl .dist .lin::after { content: ""; position: absolute; top: -14px; height: 28px; border-left: 1.5px solid var(--acento); }
.sl .dist .lin::before { left: 0; } .sl .dist .lin::after { right: 0; }
.sl .dist .tx { position: absolute; top: 56px; transform: translateX(-50%); font-size: 38px; font-style: italic; color: var(--acento); white-space: nowrap; }

.sl .qd { position: relative; width: 856px; height: 560px; border-left: 1.5px solid var(--tinta); border-bottom: 1.5px solid var(--tinta); }
.sl .qd .meio-x { position: absolute; left: 50%; top: 0; bottom: 0; border-left: 1.5px dashed var(--fio); }
.sl .qd .meio-y { position: absolute; top: 50%; left: 0; right: 0; border-top: 1.5px dashed var(--fio); }
.sl .qd .p { position: absolute; width: 16px; height: 16px; border-radius: 50%; background: var(--t3); transform: translate(-50%, 50%); }
.sl .qd .p.dest { background: var(--acento); width: 26px; height: 26px; }
.sl .qd .pl { position: absolute; font-family: var(--sans); font-weight: 500; letter-spacing: -.01em; font-size: 26px; line-height: 1; white-space: nowrap; transform: translateY(50%); color: var(--t2); }
.sl .qd .pl.dest { color: var(--acento); font-family: var(--serif); font-style: italic; font-size: 40px; letter-spacing: 0; }
.sl .qx { display: flex; justify-content: space-between; width: 856px; margin-top: 18px; font-family: var(--sans); font-size: 16px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--t3); }

.sl .esp { position: relative; height: 230px; margin: 10px 8px 0; }
.sl .esp .lin { position: absolute; left: 0; right: 0; top: 112px; border-top: 1.5px solid var(--tinta); }
.sl .esp .m { position: absolute; top: 100px; height: 24px; border-left: 1.5px solid var(--tinta); }
.sl .esp .m.dest { border-left: 3px solid var(--acento); top: 92px; height: 40px; }
.sl .esp .ml { position: absolute; transform: translateX(-50%); text-align: center; font-family: var(--sans); font-weight: 500; font-size: 27px; line-height: 1.1; white-space: nowrap; }
.sl .esp .ml.up { bottom: 146px; } .sl .esp .ml.dn { top: 146px; }
.sl .esp .ml.dest { color: var(--acento); font-weight: 650; }
.sl .esp .ml small { display: block; font-size: 15px; letter-spacing: .14em; margin-bottom: 6px; }
.sl .espe { display: flex; justify-content: space-between; gap: 40px; margin: 22px 8px 0; font-size: 30px; line-height: 1.3; font-style: italic; color: var(--t2); }

/* exemplo: a aplicação na prática */
.sl .ex-quem { font-size: 34px; line-height: 1.25; font-style: italic; color: var(--t2); margin-top: 16px; }
.sl .post { margin-top: 46px; background: var(--cartao); border: 1.5px solid var(--fio); padding: 40px 46px 46px; }
.sl .post .cab { display: flex; align-items: center; gap: 18px; margin-bottom: 30px; }
.sl .post .av { width: 58px; height: 58px; border-radius: 50%; background: var(--acento-bg); display: flex; align-items: center; justify-content: center; font-size: 28px; font-style: italic; color: var(--acento); }
.sl .post .nome { font-family: var(--sans); font-weight: 600; font-size: 23px; letter-spacing: -.01em; line-height: 1.2; }
.sl .post .nome small { display: block; font-family: var(--serif); font-weight: 400; font-style: italic; font-size: 21px; letter-spacing: 0; color: var(--t3); margin-top: 2px; }
.sl .post .corpo { font-size: 38px; line-height: 1.34; }
.sl .post .corpo p + p { margin-top: 22px; }
.sl .ad { margin-top: 44px; }
.sl .ad .bl { padding: 28px 0 32px; border-top: 1.5px solid var(--fio); }
.sl .ad .bl .rot { margin-bottom: 14px; }
.sl .ad .bl.comum .tx { font-size: 38px; line-height: 1.3; color: var(--t3); }
.sl .ad .bl.sing { border-top: 3px solid var(--acento); }
.sl .ad .bl.sing .tx { font-family: var(--sans); font-weight: 600; letter-spacing: -.025em; font-size: 42px; line-height: 1.16; }
.sl .ad .bl.sing .tx em { font-family: var(--serif); font-weight: 400; letter-spacing: 0; font-size: 1.07em; }
.sl .ad .pq { font-size: 29px; line-height: 1.36; font-style: italic; color: var(--t2); margin-top: 14px; }
.sl .rasc { margin-top: 44px; position: relative; padding: 6px 0 0 56px; background: repeating-linear-gradient(to bottom, transparent 0, transparent 63px, var(--fio) 63px, var(--fio) 64.5px); }
.sl .rasc::before { content: ""; position: absolute; left: 22px; top: 0; bottom: 0; border-left: 1.5px solid var(--acento); opacity: .7; }
.sl .rasc p { font-size: 40px; line-height: 64.5px; font-style: italic; color: var(--tinta); }
.sl .conv { margin-top: 52px; display: flex; flex-direction: column; gap: 28px; }
.sl .conv .bo { max-width: 760px; padding: 28px 34px 30px; font-size: 36px; line-height: 1.3; border: 1.5px solid var(--fio); }
.sl .conv .bo small { display: block; font-family: var(--sans); font-size: 16px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--t3); margin-bottom: 12px; font-style: normal; }
.sl .conv .eles { align-self: flex-start; font-style: italic; color: var(--t2); border-radius: 4px 28px 28px 28px; }
.sl .conv .voce { align-self: flex-end; background: var(--cartao); border-color: var(--acento); border-radius: 28px 4px 28px 28px; }
.sl .ex-nota { font-size: 25px; line-height: 1.35; font-style: italic; color: var(--t3); margin-top: 30px; }

/* cta */
.sl.cta h2 { font-size: 96px; line-height: .98; }
.sl.cta .apoio { margin-top: 48px; }
.sl .acao { align-self: flex-start; margin-top: 64px; font-size: 38px; font-style: italic; color: var(--acento); padding-bottom: 10px; border-bottom: 1.5px solid var(--acento); }
.sl .assina { margin-top: 96px; display: flex; align-items: center; gap: 18px; color: var(--t2); }
.sl .assina span { font-family: var(--sans); font-size: 20px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.sl .assina i { font-size: 28px; color: var(--t3); margin-left: auto; }
`;
}

// ------------------------------------------------------------------ figuras
function camadas(d: Dados): string {
  const cam: Dados[] = d.camadas;
  const dest = d.destaque ?? cam.length - 1;
  const div: number | undefined = d.divisao;
  const grupos: string[] = d.grupos || [];
  let out = "";
  if (div && grupos[0]) out += `<div class="grp">${esc(grupos[0])}</div>`;
  cam.forEach((c, i) => {
    if (div && i === div && grupos[1]) out += `<div class="grp">${esc(grupos[1])}</div>`;
    out += `<div class="cam${i === dest ? " dest" : ""}"><div class="r">${md(c.rotulo)}</div><div class="n">${md(c.nota)}</div></div>`;
  });
  return out;
}

function fluxo(d: Dados): string {
  const nos: Dados[] = d.nos || d.passos;
  const dest = d.destaque ?? nos.length - 1;
  return nos
    .map((n, i) => `<div class="no${i === dest ? " dest" : ""}"><div class="c">${i + 1}</div><div><div class="t">${md(n.rotulo)}</div>${n.nota ? `<div class="d">${md(n.nota)}</div>` : ""}</div></div>`)
    .join("");
}

function barras(d: Dados): string {
  const ser: Dados[] = d.series;
  const mx = Math.max(...ser.map((s) => s.valor)) || 1;
  const dest = d.destaque ?? 0;
  return (
    ser
      .map((s, i) => `<div class="bar${i === dest ? " dest" : ""}"><div class="r">${md(s.rotulo)}</div><div class="tri"><div class="pr" style="width:${((100 * s.valor) / mx).toFixed(0)}%"></div></div>${s.nota ? `<div class="n">${md(s.nota)}</div>` : ""}</div>`)
      .join("") + (d.unidade ? `<div class="un">${esc(d.unidade)}</div>` : "")
  );
}

function balanca(d: Dados): string {
  const lados: Dados[] = [d.esquerda, d.direita];
  const mx = Math.max(...lados.map((x) => x.peso)) || 1;
  const cols = lados.map((x) => {
    const pesado = x.peso === mx;
    const h = 110 + (360 * x.peso) / mx;
    return `<div class="bc"><div class="bb${pesado ? " dest" : ""}" style="height:${h.toFixed(0)}px"></div><div class="br${pesado ? " dest" : ""}">${md(x.rotulo)}</div></div>`;
  });
  return `<div class="bal">${cols.join("")}</div>`;
}

function escada(d: Dados): string {
  const dg: Dados[] = d.degraus;
  const n = dg.length;
  return dg
    .map((g, i) => `<div class="deg${i === n - 1 ? " dest" : ""}" style="margin-left:${((i * 300) / Math.max(n - 1, 1)).toFixed(0)}px"><span class="num">${i + 1}</span><div><div class="r">${md(g.rotulo)}</div>${g.nota ? `<div class="n">${md(g.nota)}</div>` : ""}</div></div>`)
    .join("");
}

function funil(d: Dados): string {
  const et: Dados[] = d.etapas;
  const n = et.length;
  return et
    .map((e, i) => `<div class="fun${i === n - 1 ? " dest" : ""}" style="width:${(100 - (48 * i) / Math.max(n - 1, 1)).toFixed(0)}%"><div class="r">${md(e.rotulo)}</div>${e.nota ? `<div class="n">${md(e.nota)}</div>` : ""}</div>`)
    .join("");
}

function gap(d: Dados): string {
  const a = d.a, b = d.b;
  const [lo, hi] = [a.valor, b.valor].sort((x: number, y: number) => x - y);
  return (
    `<div class="gapl"><div class="r">${md(a.rotulo)}</div><div class="tri"><div class="pr" style="width:${a.valor}%"></div></div>${a.nota ? `<div class="n">${md(a.nota)}</div>` : ""}</div>` +
    `<div class="dist"><div class="lin" style="left:${lo}%;width:${hi - lo}%"></div><div class="tx" style="left:${(lo + hi) / 2}%">${esc(d.rotulo_distancia || "a distância")}</div></div>` +
    `<div class="gapl b"><div class="r">${md(b.rotulo)}</div><div class="tri"><div class="pr" style="width:${b.valor}%"></div></div>${b.nota ? `<div class="n">${md(b.nota)}</div>` : ""}</div>`
  );
}

function quadrante(d: Dados): string {
  const pts = (d.pontos as Dados[])
    .map((p) => {
      const dest = p.destaque ? " dest" : "";
      const lado = p.x > 60 ? `right:calc(${100 - p.x}% + 26px)` : `left:calc(${p.x}% + 26px)`;
      return `<div class="p${dest}" style="left:${p.x}%;bottom:${p.y}%"></div><div class="pl${dest}" style="${lado};bottom:${p.y}%">${esc(p.rotulo)}</div>`;
    })
    .join("");
  const ex: string[] = d.eixoX, ey: string[] = d.eixoY;
  return (
    `<div class="qd"><div class="meio-x"></div><div class="meio-y"></div>${pts}</div>` +
    `<div class="qx"><span>← ${esc(ex[0])}</span><span>${esc(ex[1])} →</span></div>` +
    `<div class="qx" style="margin-top:10px"><span>↑ ${esc(ey[1])}</span><span>↓ ${esc(ey[0])}</span></div>`
  );
}

function espectro(d: Dados): string {
  const marcas = (d.marcas as Dados[])
    .map((m, i) => {
      const pos = Math.max(8, Math.min(92, m.pos));
      const dest = m.destaque ? " dest" : "";
      const tag = m.destaque ? `<small>${esc(m.destaque)}</small>` : "";
      return `<div class="m${dest}" style="left:${m.pos}%"></div><div class="ml ${i % 2 ? "dn" : "up"}${dest}" style="left:${pos}%">${tag}${esc(m.rotulo)}</div>`;
    })
    .join("");
  return `<div class="esp"><div class="lin"></div>${marcas}</div><div class="espe"><span>${esc(d.esquerda)}</span><span style="text-align:right">${esc(d.direita)}</span></div>`;
}

const FIGURAS: Record<string, (d: Dados) => string> = {
  camadas, fluxo, passos: fluxo, barras, balanca, escada, funil, gap, quadrante, espectro,
};

export function figura(d: Dados): string {
  const f = FIGURAS[d.tipo];
  if (!f) throw new Error(`figura '${d.tipo}' ainda não tem desenho no carrossel. Prontas: ${FIGURAS_PRONTAS.join(", ")}`);
  return f(d);
}

// ------------------------------------------------------------------ exemplo (aplicação)
function paragrafos(t: string): string {
  return String(t || "").split(/\n\s*\n/).map((p) => `<p>${md(p.trim())}</p>`).join("");
}

function exemplo(s: Dados): string {
  const quem = s.quem ? `<p class="ex-quem">${md(s.quem)}</p>` : "";
  const nota = `<p class="ex-nota">${md(s.nota || "Exemplo ilustrativo, escrito para mostrar a aplicação.")}</p>`;
  let corpo = "";
  switch (s.forma) {
    case "post": {
      const ini = String(s.quem || "?").replace(/^(uma?|o|a)\s+/i, "").trim().charAt(0).toUpperCase();
      corpo = `<div class="post"><div class="cab"><div class="av">${esc(ini)}</div><div class="nome">${md(s.perfil || s.quem || "")}<small>post</small></div></div><div class="corpo">${paragrafos(s.texto)}</div></div>`;
      break;
    }
    case "antes_depois":
      corpo = `<div class="ad"><div class="bl comum"><p class="rot">${esc(s.rotulo_comum || "O comum")}</p><p class="tx">${md(s.comum)}</p></div>` +
        `<div class="bl sing"><p class="rot ac">${esc(s.rotulo_singular || "O singular")}</p><p class="tx">${md(s.singular)}</p>${s.porque ? `<p class="pq">${md(s.porque)}</p>` : ""}</div></div>`;
      break;
    case "rascunho":
      corpo = `<div class="rasc">${String(s.texto || "").split(/\n+/).map((l) => `<p>${md(l)}</p>`).join("")}</div>`;
      break;
    case "conversa":
      corpo = `<div class="conv"><div class="bo eles"><small>${esc(s.rotulo_pergunta || "A pergunta")}</small>${md(s.pergunta)}</div><div class="bo voce"><small>${esc(s.rotulo_resposta || "A resposta")}</small>${md(s.resposta)}</div></div>`;
      break;
    default:
      throw new Error(`forma de exemplo desconhecida: ${s.forma}. Formas: ${FORMAS_EXEMPLO.join(", ")}`);
  }
  return `<p class="rot ac">${esc(s.rotulo || "Como ficaria")}</p><h2 class="ftit ds" style="font-size:60px">${md(s.titulo)}</h2>${quem}${corpo}${nota}`;
}

// ------------------------------------------------------------------ slides
function rodape(i: number, total: number, ctx: Contexto): string {
  return `<div class="rodape"><span class="m">Modo Singular</span><span class="c">${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span></div>`;
}

export function slideHTML(s: Dados, i: number, total: number, ctx: Contexto = {}): string {
  const escuro = s.fundo === "escuro" ? " escuro" : "";
  const rod = rodape(i, total, ctx);
  switch (s.tipo) {
    case "capa":
      return `<div class="sl capa${escuro}"><div class="topo"><span class="rot">${esc(ctx.rotuloDia || "")}</span>${marca(40)}</div>` +
        `<div class="centro"><h1 class="ds">${md(s.titulo)}</h1>${s.sub ? `<p class="sub">${md(s.sub)}</p>` : ""}<div class="desliza">Deslize</div></div>` +
        `<div class="rodape"><span class="m">Modo Singular</span><span class="c">${esc(ctx.handle || "")}</span></div></div>`;
    case "texto": {
      const cls = s.grande ? " g" : s.medio ? " m" : "";
      return `<div class="sl${escuro}"><div class="centro">${s.rotulo ? `<p class="rot ac">${esc(s.rotulo)}</p>` : ""}<p class="fala ds${cls}">${md(s.fala)}</p>` +
        `${s.apoio ? `<p class="apoio">${md(s.apoio)}</p>` : ""}${s.tag ? `<p class="tag">${md(s.tag)}</p>` : ""}</div>${rod}</div>`;
    }
    case "lista": {
      const itens = (s.itens as Dados[]).map((x) => `<div class="item"><div class="k">${md(x.rotulo)}</div><div class="v">${md(x.texto)}</div></div>`).join("");
      return `<div class="sl${escuro}"><div class="centro">${s.rotulo ? `<p class="rot ac">${esc(s.rotulo)}</p>` : ""}<p class="fala m ds">${md(s.fala)}</p><div class="itens">${itens}</div></div>${rod}</div>`;
    }
    case "figura": {
      const fig = s.figura as Dados;
      const ilus = fig.ilustrativo || s.ilustrativo;
      const leg = s.legenda ?? fig.legenda;
      return `<div class="sl${escuro}"><p class="rot ac">${esc(s.rotulo || "Figura do livro")}</p><h2 class="ftit ds">${md(s.titulo || fig.titulo)}</h2>` +
        `<div class="fig">${figura(fig)}</div>${leg ? `<p class="leg">${md(leg)}</p>` : ""}${ilus ? `<p class="selo">Esquema ilustrativo</p>` : ""}${s.solo ? "" : rod}</div>`;
    }
    case "exemplo":
      return `<div class="sl${escuro}"><div class="centro">${exemplo(s)}</div>${rod}</div>`;
    case "cta":
      return `<div class="sl cta${escuro}"><div class="centro">${s.rotulo ? `<p class="rot ac" style="margin-bottom:40px">${esc(s.rotulo)}</p>` : ""}<h2 class="ds">${md(s.titulo)}</h2>` +
        `${s.apoio ? `<p class="apoio">${md(s.apoio)}</p>` : ""}${s.acao ? `<p class="acao">${esc(s.acao)}</p>` : ""}` +
        `<div class="assina">${marca(48)}<span>${esc(ctx.assinatura || "Modo Singular")}</span><i>${esc(ctx.handle || "")}</i></div></div></div>`;
    default:
      throw new Error(`tipo de slide desconhecido: ${s.tipo}`);
  }
}

/** Documento HTML completo de um slide (usado pelo gerador de PNG). */
export function pagina(s: Dados, i: number, total: number, ctx: Contexto = {}): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>html,body{margin:0;width:${L}px;height:${A}px;overflow:hidden}${css(ctx.fontBase)}</style></head><body>${slideHTML(s, i, total, ctx)}</body></html>`;
}
