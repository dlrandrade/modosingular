#!/usr/bin/env python3
"""Renderiza um carrossel (1080x1350) a partir do kit do dia.

As figuras usam os MESMOS dados YAML dos blocos ```figura do livro
(apostila/texto/capNN.md), redesenhados para o celular: o desenho do livro
foi feito para a coluna impressa e não sobrevive a 1080 px de largura.

Marcação inline nos textos: **assim** vira destaque dourado.
"""
import html as _html
import re
import sys
from pathlib import Path

AQUI = Path(__file__).parent
FONTES = (AQUI.parent / "apostila" / "diagramacao" / "fontes").resolve()
sys.path.insert(0, str(AQUI.parent / "apostila" / "diagramacao"))
import figuras as FIG  # noqa: E402  (só para a marca)

L, A = 1080, 1350

CSS = """
@font-face { font-family: "Instrument Serif"; src: url(FONTES/instrument-serif-latin-400-normal.woff2); font-style: normal; }
@font-face { font-family: "Instrument Serif"; src: url(FONTES/instrument-serif-latin-400-italic.woff2); font-style: italic; }
@font-face { font-family: "Newsreader"; src: url(FONTES/newsreader-latin-400-normal.woff2); font-style: normal; font-weight: 400; }
@font-face { font-family: "Newsreader"; src: url(FONTES/newsreader-latin-400-italic.woff2); font-style: italic; font-weight: 400; }
@font-face { font-family: "Newsreader"; src: url(FONTES/newsreader-latin-600-normal.woff2); font-style: normal; font-weight: 600; }
@font-face { font-family: "Inter"; src: url(FONTES/inter-latin-500-normal.woff2); font-weight: 500; }
@font-face { font-family: "Inter"; src: url(FONTES/inter-latin-600-normal.woff2); font-weight: 600; }
@font-face { font-family: "Inter"; src: url(FONTES/inter-latin-700-normal.woff2); font-weight: 700; }
:root { --paper:#f6f1e7; --soft:#ebe4d4; --ink:#1b1b1a; --ink2:#4d4b47; --ink3:#8b877f; --line:#cdc7bb;
        --gold:#9a7328; --gold-d:#6f521b; --gold-l:#d9b360; --gold-bg:#ecdfc2; --dark:#15130e; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1350px; overflow: hidden; }
.s { position: relative; width: 1080px; height: 1350px; padding: 96px 90px 128px; display: flex; flex-direction: column; }
.claro { background: var(--paper); color: var(--ink); }
.escuro { background: var(--dark); color: var(--paper); }
b { font-weight: inherit; color: var(--gold); font-style: italic; }
.escuro b { color: var(--gold-l); }
.rot { font: 600 26px/1 Inter, sans-serif; letter-spacing: .26em; text-transform: uppercase; color: var(--gold); }
.escuro .rot { color: var(--gold-l); }
.rodape { position: absolute; left: 90px; right: 90px; bottom: 54px; display: flex; justify-content: space-between;
          font: 500 24px/1 Inter, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); }
.marca { display: flex; align-items: center; gap: 18px; }
.marca svg { width: 52px; height: 52px; }

/* capa */
.capa { justify-content: space-between; }
.capa h1 { font: 400 148px/1.0 "Instrument Serif", serif; letter-spacing: -.012em; }
.capa .sub { font: italic 400 50px/1.3 Newsreader, serif; color: #cfc7b6; margin-top: 44px; }
.capa .desliza { font: 600 28px/1 Inter, sans-serif; letter-spacing: .22em; text-transform: uppercase; color: var(--gold-l); }
.filete { width: 150px; height: 4px; background: var(--gold-l); margin: 0 0 44px; }

/* texto */
.centro { justify-content: center; }
.fala { font: 400 88px/1.08 "Instrument Serif", serif; letter-spacing: -.01em; }
.fala.m { font-size: 74px; }
.apoio { font: 400 42px/1.4 Newsreader, serif; color: var(--ink2); margin-top: 48px; }
.escuro .apoio { color: #cfc7b6; }
.tag { font: italic 400 30px/1.3 Newsreader, serif; color: var(--ink3); margin-top: 40px; }

/* lista (rótulo + texto) */
.itens { margin-top: 44px; }
.item { border-top: 2px solid var(--line); padding: 30px 0 28px; }
.item .k { font: 400 58px/1.1 "Instrument Serif", serif; color: var(--gold); }
.item .v { font: 400 38px/1.38 Newsreader, serif; color: var(--ink2); margin-top: 8px; }

/* figura */
.ftit { font: 400 72px/1.06 "Instrument Serif", serif; margin: 20px 0 24px; }
.leg { font: italic 400 32px/1.36 Newsreader, serif; color: var(--ink2); margin-top: 22px; }
.fig { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.selo { display: inline-block; font: 600 22px/1 Inter, sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--ink3);
        border: 2px solid var(--line); padding: 8px 14px; margin-top: 18px; align-self: flex-start; }

/* camadas */
.cam { margin-bottom: 10px; padding: 16px 26px 14px; background: var(--soft); }
.cam .r { font: 600 38px/1.12 Newsreader, serif; }
.cam .n { font: 400 29px/1.28 Newsreader, serif; color: var(--ink2); margin-top: 2px; }
.cam.g1 { background: var(--gold-bg); }
.cam.g2 { background: #d9bd80; }
.cam.dest { background: var(--gold); color: #fff; }
.cam.dest .n { color: #f6ecd6; }
.grp { display: flex; align-items: center; gap: 16px; margin: 12px 0 10px; font: 700 25px/1 Inter, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-d); }
.grp::after { content: ""; flex: 1; border-top: 3px dashed var(--gold); }

/* fluxo / passos */
.nos { position: relative; }
.no { display: flex; gap: 30px; align-items: flex-start; padding-bottom: 34px; position: relative; }
.no:not(:last-child)::before { content: ""; position: absolute; left: 35px; top: 76px; bottom: 4px; width: 3px; background: var(--line); }
.no .c { flex: none; width: 72px; height: 72px; border-radius: 50%; border: 3px solid var(--gold); display: flex; align-items: center; justify-content: center;
         font: 400 40px/1 "Instrument Serif", serif; color: var(--gold); background: var(--paper); position: relative; z-index: 1; }
.no.dest .c { background: var(--gold); color: #fff; }
.no .t { font: 600 40px/1.15 Newsreader, serif; padding-top: 6px; }
.no .d { font: 400 31px/1.34 Newsreader, serif; color: var(--ink2); margin-top: 6px; }

/* barras */
.bar { margin-bottom: 34px; }
.bar .r { font: 600 38px/1.15 Newsreader, serif; }
.bar .trilho { height: 40px; background: var(--soft); margin: 14px 0 10px; }
.bar .preenche { height: 100%; background: #a39d90; }
.bar.dest .preenche { background: var(--gold); }
.bar .n { font: 400 30px/1.34 Newsreader, serif; color: var(--ink2); }
.un { font: 600 24px/1.3 Inter, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); margin-top: 6px; }

/* balança */
.bal { display: flex; gap: 40px; align-items: flex-end; height: 560px; margin-top: 10px; }
.bc { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
.bb { background: #a39d90; width: 100%; }
.bb.dest { background: var(--gold); }
.br { font: 600 36px/1.18 Newsreader, serif; margin-top: 18px; min-height: 90px; }
.bchao { height: 4px; background: var(--ink); margin-top: -108px; position: relative; z-index: 0; visibility: hidden; }
/* escada */
.deg { margin-bottom: 20px; }
.deg .blo { padding: 18px 26px; background: var(--soft); display: flex; gap: 22px; align-items: baseline; }
.deg .blo .num { font: 400 52px/1 "Instrument Serif", serif; color: var(--gold); }
.deg .blo .r { font: 600 38px/1.15 Newsreader, serif; }
.deg.dest .blo { background: var(--gold); color: #fff; }
.deg.dest .blo .num { color: #f6ecd6; }
.deg .n { font: 400 30px/1.34 Newsreader, serif; color: var(--ink2); margin-top: 8px; }

/* funil */
.fun { margin: 0 auto 16px; }
.fun .blo { padding: 18px 20px; text-align: center; background: var(--soft); font: 600 36px/1.15 Newsreader, serif; clip-path: polygon(0 0, 100% 0, calc(100% - 22px) 100%, 22px 100%); }
.fun.dest .blo { background: var(--gold); color: #fff; }
.fun .n { text-align: center; font: 400 28px/1.3 Newsreader, serif; color: var(--ink2); margin-top: 6px; }

/* gap */
.gapl { margin-bottom: 20px; }
.gapl .r { font: 600 40px/1.15 Newsreader, serif; }
.gapl .tr { height: 64px; background: var(--soft); margin: 14px 0 10px; position: relative; }
.gapl .pr { height: 100%; background: var(--gold); }
.gapl.b .pr { background: #a39d90; }
.gapl .n { font: 400 30px/1.34 Newsreader, serif; color: var(--ink2); }
.dist { position: relative; height: 90px; margin: 4px 0 26px; }
.dist .lin { position: absolute; top: 28px; height: 4px; background: var(--gold-d); }
.dist .lin::before, .dist .lin::after { content: ""; position: absolute; top: -10px; width: 4px; height: 24px; background: var(--gold-d); }
.dist .lin::before { left: 0; } .dist .lin::after { right: 0; }
.dist .tx { position: absolute; top: 44px; transform: translateX(-50%); font: 700 28px/1 Inter, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-d); white-space: nowrap; }

/* quadrante */
.qd { position: relative; width: 900px; height: 560px; border-left: 4px solid var(--ink); border-bottom: 4px solid var(--ink); margin: 6px 0 0 6px; background:
      linear-gradient(var(--line), var(--line)) 50% 0 / 2px 100% no-repeat, linear-gradient(var(--line), var(--line)) 0 50% / 100% 2px no-repeat; }
.qd .zona { position: absolute; right: 0; top: 0; width: 50%; height: 50%; background: rgba(154,115,40,.12); }
.qd .p { position: absolute; width: 24px; height: 24px; border-radius: 50%; background: var(--ink3); transform: translate(-50%, 50%); }
.qd .p.dest { background: var(--gold); width: 38px; height: 38px; }
.qd .pl { position: absolute; font: 600 30px/1.1 Newsreader, serif; white-space: nowrap; transform: translateY(50%); color: var(--ink2); }
.qd .pl.dest { color: var(--gold-d); font-size: 36px; }
.qy { position: absolute; left: 14px; font: 700 23px/1.2 Inter, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); max-width: 380px; }
.qx { display: flex; justify-content: space-between; margin: 16px 0 0 6px; width: 900px; font: 700 23px/1.2 Inter, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); }
.qx span:last-child { text-align: right; }

/* espectro */
.esp { position: relative; height: 250px; margin: 20px 10px 0; }
.esp .tri { position: absolute; left: 0; right: 0; top: 108px; height: 36px; background: linear-gradient(90deg, var(--soft), var(--gold)); }
.esp .m { position: absolute; top: 108px; width: 4px; height: 36px; background: var(--ink); }
.esp .ml { position: absolute; transform: translateX(-50%); text-align: center; font: 600 30px/1.15 Newsreader, serif; white-space: nowrap; }
.esp .ml.up { top: 40px; } .esp .ml.dn { top: 158px; }
.esp .pis { font: 700 22px/1 Inter, sans-serif; letter-spacing: .14em; color: var(--gold-d); display: block; margin-bottom: 8px; }
.espe { display: flex; justify-content: space-between; margin: 14px 10px 0; font: italic 400 30px/1.3 Newsreader, serif; color: var(--ink2); }

/* cta */
.cta h2 { font: 400 112px/1.04 "Instrument Serif", serif; letter-spacing: -.01em; }
.cta .apoio { margin-top: 44px; }
.pilula { align-self: flex-start; margin-top: 56px; border: 3px solid var(--gold-l); color: var(--gold-l); border-radius: 80px; padding: 24px 46px;
          font: 600 34px/1 Inter, sans-serif; letter-spacing: .08em; }
.assina { margin-top: 64px; display: flex; align-items: center; gap: 22px; font: 600 28px/1.2 Inter, sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-l); }
.assina svg { width: 64px; height: 64px; }
"""


def esc(t) -> str:
    return _html.escape(str(t), quote=False)


def md(t) -> str:
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", esc(t))


def marca_svg(cor="#d9b360", tam=52):
    return FIG.marca(tam, cor)


# ------------------------------------------------------------------ figuras
def f_camadas(d):
    cam = d["camadas"]
    n = len(cam)
    dest = d.get("destaque", n - 1)
    div = d.get("divisao")
    grupos = d.get("grupos") or []
    out = []
    if div and grupos:
        out.append(f'<div class="grp">{esc(grupos[0])}</div>')
    for i, c in enumerate(cam):
        if div and i == div and grupos:
            out.append(f'<div class="grp">{esc(grupos[1])}</div>')
        cls = "cam"
        if div and i >= div:
            cls += " g1" if i < n - 1 else ""
        if i == dest:
            cls += " dest"
        out.append(f'<div class="{cls}"><div class="r">{esc(c["rotulo"])}</div><div class="n">{md(c.get("nota", ""))}</div></div>')
    return "".join(out)


def f_fluxo(d):
    nos = d.get("nos") or d.get("passos")
    dest = d.get("destaque", len(nos) - 1)
    out = []
    for i, n in enumerate(nos):
        out.append(f'<div class="no{" dest" if i == dest else ""}"><div class="c">{i + 1}</div><div><div class="t">{md(n["rotulo"])}</div>'
                   f'<div class="d">{md(n.get("nota", ""))}</div></div></div>')
    return f'<div class="nos">{"".join(out)}</div>'


def f_barras(d):
    ser = d["series"]
    mx = max(s["valor"] for s in ser) or 1
    dest = d.get("destaque", 0)
    out = []
    for i, s in enumerate(ser):
        out.append(f'<div class="bar{" dest" if i == dest else ""}"><div class="r">{md(s["rotulo"])}</div>'
                   f'<div class="trilho"><div class="preenche" style="width:{100 * s["valor"] / mx:.0f}%"></div></div>'
                   f'<div class="n">{md(s.get("nota", ""))}</div></div>')
    un = f'<div class="un">{esc(d["unidade"])}</div>' if d.get("unidade") else ""
    return "".join(out) + un


def f_balanca(d):
    e, r = d["esquerda"], d["direita"]
    mx = max(e["peso"], r["peso"]) or 1
    cols = []
    for x in (e, r):
        pesado = x["peso"] == mx
        h = 120 + 380 * x["peso"] / mx
        cols.append(f'<div class="bc"><div class="bb{" dest" if pesado else ""}" style="height:{h:.0f}px"></div>'
                    f'<div class="br">{md(x["rotulo"])}</div></div>')
    return f'<div class="bal">{cols[0]}{cols[1]}</div><div class="bchao"></div>'


def f_escada(d):
    dg = d["degraus"]
    n = len(dg)
    out = []
    for i, g in enumerate(dg):
        w = 46 + 54 * i / max(n - 1, 1)
        out.append(f'<div class="deg{" dest" if i == n - 1 else ""}"><div class="blo" style="width:{w:.0f}%">'
                   f'<span class="num">{i + 1}</span><span class="r">{md(g["rotulo"])}</span></div>'
                   f'<div class="n">{md(g.get("nota", ""))}</div></div>')
    return "".join(out)


def f_funil(d):
    et = d["etapas"]
    n = len(et)
    out = []
    for i, e in enumerate(et):
        w = 100 - 50 * i / max(n - 1, 1)
        out.append(f'<div class="fun{" dest" if i == n - 1 else ""}" style="width:{w:.0f}%"><div class="blo">{md(e["rotulo"])}</div>'
                   f'<div class="n">{md(e.get("nota", ""))}</div></div>')
    return "".join(out)


def f_gap(d):
    a, b = d["a"], d["b"]
    va, vb = a["valor"], b["valor"]
    lo, hi = sorted((va, vb))
    return (f'<div class="gapl"><div class="r">{md(a["rotulo"])}</div><div class="tr"><div class="pr" style="width:{va}%"></div></div>'
            f'<div class="n">{md(a.get("nota", ""))}</div></div>'
            f'<div class="dist"><div class="lin" style="left:{lo}%;width:{hi - lo}%"></div>'
            f'<div class="tx" style="left:{(lo + hi) / 2}%">{esc(d.get("rotulo_distancia", "a distância"))}</div></div>'
            f'<div class="gapl b"><div class="r">{md(b["rotulo"])}</div><div class="tr"><div class="pr" style="width:{vb}%"></div></div>'
            f'<div class="n">{md(b.get("nota", ""))}</div></div>')


def f_quadrante(d):
    pts = []
    for p in d["pontos"]:
        x, y = p["x"], p["y"]
        dest = " dest" if p.get("destaque") else ""
        pts.append(f'<div class="p{dest}" style="left:{x}%;bottom:{y}%"></div>')
        if x > 60:
            pts.append(f'<div class="pl{dest}" style="right:calc({100 - x}% + 30px);bottom:{y}%">{esc(p["rotulo"])}</div>')
        else:
            pts.append(f'<div class="pl{dest}" style="left:calc({x}% + 30px);bottom:{y}%">{esc(p["rotulo"])}</div>')
    ex, ey = d["eixoX"], d["eixoY"]
    return (f'<div class="qd"><div class="zona"></div>{"".join(pts)}'
            f'<div class="qy" style="top:12px;left:18px;display:none">{esc(ey[1])}</div></div>'
            f'<div class="qx"><span>← {esc(ex[0])}</span><span>{esc(ex[1])} →</span></div>'
            f'<div class="un" style="margin:14px 0 0 6px">↑ {esc(ey[1])} &nbsp;·&nbsp; ↓ {esc(ey[0])}</div>')


def f_espectro(d):
    marcas = d["marcas"]
    out = []
    for i, m in enumerate(marcas):
        pos = max(7, min(93, m["pos"]))
        up = "up" if i % 2 == 0 else "dn"
        pis = f'<span class="pis">{esc(m["destaque"])}</span>' if m.get("destaque") else ""
        out.append(f'<div class="m" style="left:{m["pos"]}%"></div><div class="ml {up}" style="left:{pos}%">{pis}{esc(m["rotulo"])}</div>')
    return (f'<div class="esp"><div class="tri"></div>{"".join(out)}</div>'
            f'<div class="espe"><span>{esc(d["esquerda"])}</span><span style="text-align:right">{esc(d["direita"])}</span></div>')


FIGURAS = {"camadas": f_camadas, "fluxo": f_fluxo, "passos": f_fluxo, "barras": f_barras, "balanca": f_balanca,
           "escada": f_escada, "funil": f_funil, "gap": f_gap, "quadrante": f_quadrante, "espectro": f_espectro}


# ------------------------------------------------------------------ slides
def rodape(i, total, escuro, handle):
    handle = handle if len((handle or '').strip()) > 1 else 'Método Singular'
    return f'<div class="rodape"><span>{esc(handle)}</span><span>{i}/{total}</span></div>'


def slide_html(s, i, total, ctx):
    t = s["tipo"]
    handle = ctx.get("handle", "")
    rod = rodape(i, total, False, handle)
    if t == "capa":
        return (f'<div class="s escuro capa"><div class="marca">{marca_svg()}<span class="rot">Modo Singular · {esc(ctx.get("rotulo_dia", ""))}</span></div>'
                f'<div><div class="filete"></div><h1>{md(s["titulo"])}</h1><p class="sub">{md(s.get("sub", ""))}</p></div>'
                f'<div class="desliza">Deslize →</div></div>')
    if t == "texto":
        escuro = s.get("fundo") == "escuro"
        rot = f'<div class="rot" style="margin-bottom:36px">{esc(s["rotulo"])}</div>' if s.get("rotulo") else ""
        apoio = f'<p class="apoio">{md(s["apoio"])}</p>' if s.get("apoio") else ""
        tag = f'<p class="tag">{md(s["tag"])}</p>' if s.get("tag") else ""
        return (f'<div class="s {"escuro" if escuro else "claro"} centro">{rot}<p class="fala{" m" if s.get("medio") else ""}">{md(s["fala"])}</p>{apoio}{tag}'
                f'{rodape(i, total, escuro, handle)}</div>')
    if t == "lista":
        itens = "".join(f'<div class="item"><div class="k">{md(x["rotulo"])}</div><div class="v">{md(x["texto"])}</div></div>' for x in s["itens"])
        return (f'<div class="s claro centro"><div class="rot">{esc(s.get("rotulo", ""))}</div><p class="fala m" style="margin-top:30px">{md(s["fala"])}</p>'
                f'<div class="itens">{itens}</div>{rod}</div>')
    if t == "figura":
        fig = s["figura"]
        if fig["tipo"] not in FIGURAS:
            raise SystemExit(f"figura '{fig['tipo']}' ainda não tem template no carrossel. Prontos: {', '.join(sorted(FIGURAS))}")
        selo = '<span class="selo">esquema ilustrativo</span>' if fig.get("ilustrativo") or s.get("ilustrativo") else ""
        leg = s.get("legenda") or fig.get("legenda") or ""
        legenda = f'<p class="leg">{md(leg)}</p>' if leg else ""
        return (f'<div class="s claro"><div class="rot">{esc(s.get("rotulo", "Figura do livro"))}</div><h2 class="ftit">{md(s["titulo"])}</h2>'
                f'<div class="fig">{FIGURAS[fig["tipo"]](fig)}</div>{legenda}{selo}{rod}</div>')
    if t == "cta":
        pil = f'<div class="pilula">{esc(s["acao"])}</div>' if s.get("acao") else ""
        return (f'<div class="s escuro cta centro"><div class="rot" style="margin-bottom:34px">{esc(s.get("rotulo", ""))}</div><h2>{md(s["titulo"])}</h2>'
                f'<p class="apoio">{md(s.get("apoio", ""))}</p>{pil}'
                f'<div class="assina">{marca_svg(tam=64)}<span>{esc(ctx.get("assinatura", "Método Singular"))}</span></div></div>')
    raise SystemExit(f"tipo de slide desconhecido: {t}")


def pagina(corpo):
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS.replace("FONTES", FONTES.as_uri())}</style></head><body>{corpo}</body></html>'


def renderizar(slides, ctx, destino: Path):
    from playwright.sync_api import sync_playwright
    import glob
    destino.mkdir(parents=True, exist_ok=True)
    for velho in destino.glob("slide-*.png"):
        velho.unlink()
    exe = (glob.glob("/opt/pw-browsers/chromium-*/chrome-linux*/chrome") or [None])[0]
    total = len(slides)
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=exe, args=["--no-sandbox"]) if exe else p.chromium.launch()
        pg = nav.new_page(viewport={"width": L, "height": A})
        for i, s in enumerate(slides, 1):
            tmp = destino / f"_s{i}.html"
            tmp.write_text(pagina(slide_html(s, i, total, ctx)))
            pg.goto(tmp.resolve().as_uri())
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(150)
            # alerta se o conteúdo estourar o slide
            estoura = pg.evaluate("""() => { const s = document.querySelector('.s'); const r = s.getBoundingClientRect();
                return [...s.querySelectorAll('*')].some(e => { const b = e.getBoundingClientRect();
                  return b.width > 0 && (b.bottom > r.bottom - 96 && !e.closest('.rodape') || b.right > r.right + 2); }); }""")
            if estoura:
                print(f"AVISO slide {i}: conteúdo encosta ou passa da margem inferior/direita")
            pg.screenshot(path=str(destino / f"slide-{i:02d}.png"))
            tmp.unlink()
        nav.close()
    return total
