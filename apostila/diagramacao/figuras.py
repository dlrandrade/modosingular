"""Figuras da apostila em SVG para impressão.

Cada função recebe o dicionário do bloco ```figura``` e devolve SVG.
Largura lógica fixa (W=500) = largura da coluna de texto (~131 mm),
então 1 unidade ~ 0,26 mm e corpo 11 ~ 8 pt.
"""
from __future__ import annotations

import math
import re
from html import escape

W = 500
INK, INK2, INK3 = "#1b1b1a", "#4d4b47", "#8b877f"
LINE, SOFT, PAPER = "#cdc7bb", "#f1ece2", "#ffffff"
ACC, ACC_L, ACC_D = "#9a7328", "#ecdfc2", "#6f521b"
SANS = "Inter, sans-serif"
ESCALA = 1.12          # corpo dos rótulos (a coluna ficou mais estreita e o leitor tem 30 a 60 anos)
BARRA_B = "#b3ada2"    # cinza claro: em P&B precisa contrastar com o dourado escuro
SERIF = "'Instrument Serif', serif"


# ------------------------------------------------------------ utilidades
def aspas(t) -> str:
    """Aspas tipográficas: "x" -> “x”, d'água -> d’água."""
    t = re.sub(r'"([^"]*)"', "“\\1”", str(t))
    return re.sub(r"(\w)'", "\\1’", t)


def _larg(txt: str, tam: float) -> float:
    estreitas = sum(1 for c in txt if c in "ilIjtf.,;:!'|() ")
    largas = sum(1 for c in txt if c in "mwMWOQ@")
    return tam * (0.6 * (len(txt) - estreitas - largas) + 0.32 * estreitas + 0.86 * largas)


def quebrar(txt: str, largura: float, tam: float) -> list[str]:
    linhas, atual = [], ""
    for p in str(txt).split():
        tentativa = f"{atual} {p}".strip()
        if _larg(tentativa, tam) <= largura or not atual:
            atual = tentativa
        else:
            linhas.append(atual)
            atual = p
    if atual:
        linhas.append(atual)
    return linhas


def texto(x, y, txt, tam=11, cor=INK, peso=400, ancora="start", largura=None,
          entrelinha=1.3, fonte=SANS, estilo="normal", esp=0.0) -> tuple[str, float]:
    """Texto com quebra. Devolve (svg, altura_ocupada). Corpo mínimo ~8 pt impresso."""
    tam = max(tam * ESCALA, 12)
    txt = aspas(txt)
    linhas = quebrar(txt, largura, tam) if largura else [str(txt)]
    partes = [f'<tspan x="{x:.1f}" dy="{0 if i == 0 else tam * entrelinha:.1f}">{escape(l)}</tspan>'
              for i, l in enumerate(linhas)]
    ls = f' letter-spacing="{esp}"' if esp else ""
    svg = (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{fonte}" font-size="{tam}" '
           f'font-weight="{peso}" font-style="{estilo}" fill="{cor}" text-anchor="{ancora}"{ls}>'
           + "".join(partes) + "</text>")
    return svg, tam * entrelinha * len(linhas)


def svg(corpo: str, h: float, w: float = W) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
            f'width="100%" preserveAspectRatio="xMidYMid meet">{corpo}</svg>')


def seta(x1, y1, x2, y2, cor=INK3, larg=1.1, ponta=6):
    ang = math.atan2(y2 - y1, x2 - x1)
    a1 = (x2 - ponta * math.cos(ang - 0.45), y2 - ponta * math.sin(ang - 0.45))
    a2 = (x2 - ponta * math.cos(ang + 0.45), y2 - ponta * math.sin(ang + 0.45))
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{cor}" stroke-width="{larg}"/>'
            f'<path d="M{a1[0]:.1f} {a1[1]:.1f} L{x2:.1f} {y2:.1f} L{a2[0]:.1f} {a2[1]:.1f}" '
            f'fill="none" stroke="{cor}" stroke-width="{larg}" stroke-linejoin="round"/>')


HACHURA = (f'<defs><pattern id="hach" width="6" height="6" patternUnits="userSpaceOnUse" '
           f'patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="{INK2}" '
           f'stroke-width="1.6" opacity=".75"/></pattern></defs>')


def _legenda(out, y, d):
    if d.get("legenda"):
        s, h = texto(0, y + 10, d["legenda"], 9.6, INK2, largura=W - 8, estilo="italic")
        out.append(s)
        y += h + 6
    return y


# ------------------------------------------------------------ diagramas
def gap(d):
    """Duas barras; a diferença entre elas aparece hachurada na segunda."""
    a, b = d["a"], d["b"]
    x0, bw = 150, 340
    out, y, topos = [HACHURA], 6, []
    for i, item in enumerate((a, b)):
        topos.append(y)
        s, hh = texto(0, y + 15, item["rotulo"], 10.5, INK, 600, largura=138)
        out.append(s)
        out.append(f'<rect x="{x0}" y="{y}" width="{bw}" height="22" fill="{SOFT}"/>')
        out.append(f'<rect x="{x0}" y="{y}" width="{bw * item["valor"] / 100:.1f}" height="22" '
                   f'fill="{ACC_D if i == 0 else BARRA_B}"/>')
        h2 = 0
        if item.get("nota"):
            s, h2 = texto(x0, y + 38, item["nota"], 9.5, INK2, largura=bw, estilo="italic")
            out.append(s)
        y += max(32 + h2, hh + 6) + 14
    xa, xb = x0 + bw * a["valor"] / 100, x0 + bw * b["valor"] / 100
    yb = topos[1]
    out.append(f'<rect x="{min(xa, xb):.1f}" y="{yb}" width="{abs(xa - xb):.1f}" height="22" '
               f'fill="url(#hach)" stroke="{ACC}" stroke-width=".8"/>')
    rot = d.get("rotulo_distancia", "a distância")
    lr = _larg(rot, 11.4) + 12
    out.append(f'<rect x="{(xa + xb) / 2 - lr / 2:.1f}" y="{yb + 3}" rx="2" '
               f'width="{lr:.1f}" height="16" fill="{PAPER}" stroke="{ACC}" stroke-width=".8"/>')
    out.append(texto((xa + xb) / 2, yb + 15, rot, 9.5, ACC_D, 600, "middle")[0])
    y = _legenda(out, y - 4, d)
    return svg("".join(out), y + 4)


def funil(d):
    etapas = d["etapas"]
    n = len(etapas)
    topo, base, alt, x_c = 230, 70, 44, 125
    out, y = [], 6
    for i, e in enumerate(etapas):
        w1 = topo - (topo - base) * i / n
        w2 = topo - (topo - base) * (i + 1) / n
        pts = f"{x_c - w1/2:.1f},{y} {x_c + w1/2:.1f},{y} {x_c + w2/2:.1f},{y + alt - 4} {x_c - w2/2:.1f},{y + alt - 4}"
        cor = ACC if i == n - 1 else (ACC_L if i == 0 else SOFT)
        out.append(f'<polygon points="{pts}" fill="{cor}" stroke="{PAPER}" stroke-width="1"/>')
        out.append(texto(x_c, y + alt / 2 + 3, f"{i + 1}", 14, PAPER if i == n - 1 else ACC_D, 400, "middle", fonte=SERIF)[0])
        s, h = texto(262, y + 14, e["rotulo"], 10.5, INK, 600, largura=235)
        out.append(s)
        if e.get("nota"):
            s2, h2 = texto(262, y + 14 + h, e["nota"], 9.5, INK2, largura=235)
            out.append(s2)
            h += h2
        out.append(f'<line x1="{x_c + w1/2 + 4:.1f}" y1="{y + 10}" x2="254" y2="{y + 10}" stroke="{LINE}" stroke-width=".8"/>')
        y += max(alt, h + 12)
    y = _legenda(out, y, d)
    return svg("".join(out), y + 4)


def quadrante(d):
    L, T, S = 60, 10, 380
    H = S * .62
    out = [f'<rect x="{L}" y="{T}" width="{S}" height="{H:.0f}" fill="{PAPER}" stroke="{LINE}"/>',
           f'<rect x="{L + S/2}" y="{T}" width="{S/2}" height="{H/2:.1f}" fill="{ACC_L}" opacity=".6"/>',
           f'<line x1="{L + S/2}" y1="{T}" x2="{L + S/2}" y2="{T + H:.1f}" stroke="{LINE}"/>',
           f'<line x1="{L}" y1="{T + H/2:.1f}" x2="{L + S}" y2="{T + H/2:.1f}" stroke="{LINE}"/>']
    ex, ey = d["eixoX"], d["eixoY"]
    out.append(seta(L, T + H + 14, L + S, T + H + 14, INK3))
    out.append(texto(L, T + H + 30, ex[0], 9.5, INK2)[0])
    out.append(texto(L + S, T + H + 30, ex[1], 9.5, INK2, ancora="end")[0])
    out.append(seta(L - 14, T + H, L - 14, T, INK3))
    out.append(f'<text transform="translate({L - 22},{T + H}) rotate(-90)" font-family="{SANS}" font-size="9.5" fill="{INK2}">{escape(aspas(ey[0]))}</text>')
    out.append(f'<text transform="translate({L - 22},{T}) rotate(-90)" font-family="{SANS}" font-size="9.5" fill="{INK2}" text-anchor="end">{escape(aspas(ey[1]))}</text>')
    for p in d["pontos"]:
        px = L + S * p["x"] / 100
        py = T + H - H * p["y"] / 100
        dest = p.get("destaque")
        out.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{6 if dest else 4}" fill="{ACC if dest else INK3}"/>')
        anc = "end" if p["x"] > 70 else "start"
        dx = -10 if anc == "end" else 10
        out.append(texto(px + dx, py + 4, p["rotulo"], 9.5, INK if dest else INK2, 600 if dest else 400, anc, largura=150)[0])
    y = _legenda(out, T + H + 36, d)
    return svg("".join(out), y + 4)


def fluxo(d):
    if d.get("ciclico"):
        return ciclo(d)
    nos = d["nos"]
    out, y, xs, posicoes = [], 4, 18, []
    for n in nos:
        s, h = texto(52, y + 14, n["rotulo"], 11, INK, 600, largura=440)
        out.append(s)
        if n.get("nota"):
            s2, h2 = texto(52, y + 14 + h, n["nota"], 9.5, INK2, largura=440)
            out.append(s2)
            h += h2
        posicoes.append(y + 10)
        y += max(h + 18, 40)
    out.insert(0, f'<line x1="{xs}" y1="{posicoes[0]}" x2="{xs}" y2="{posicoes[-1]}" stroke="{LINE}" stroke-width="1.4"/>')
    for i, py in enumerate(posicoes):
        ult = i == len(posicoes) - 1
        out.append(f'<circle cx="{xs}" cy="{py}" r="11" fill="{ACC if ult else PAPER}" stroke="{ACC}" stroke-width="1.2"/>')
        out.append(texto(xs, py + 4.5, str(i + 1), 13, PAPER if ult else ACC_D, 400, "middle", fonte=SERIF)[0])
    y = _legenda(out, y - 6, d)
    return svg("".join(out), y)


def ciclo(d):
    nos = d["nos"]
    n = len(nos)
    cx, r = W / 2, 78
    larg = 118
    # altura dos rótulos de cima e de baixo define o centro vertical
    def bloco(no, lg):
        _, h1 = texto(0, 0, no["rotulo"], 10.5, INK, 600, largura=lg)
        h2 = texto(0, 0, no["nota"], 9, INK2, largura=lg)[1] if no.get("nota") else 0
        return h1 + h2
    topo = bloco(nos[0], 190) + 10
    cy = topo + r + 16
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{LINE}" stroke-width="1.2" stroke-dasharray="3 3"/>']
    pts = [(cx + r * math.cos(-math.pi / 2 + 2 * math.pi * i / n), cy + r * math.sin(-math.pi / 2 + 2 * math.pi * i / n),
            -math.pi / 2 + 2 * math.pi * i / n) for i in range(n)]
    for x, y, ang in pts:
        a1, a2 = ang + 0.42, ang + 2 * math.pi / n - 0.42
        mx1, my1 = cx + r * math.cos(a2 - 0.08), cy + r * math.sin(a2 - 0.08)
        mx2, my2 = cx + r * math.cos(a2), cy + r * math.sin(a2)
        out.append(f'<path d="M{cx + r * math.cos(a1):.1f} {cy + r * math.sin(a1):.1f} A{r} {r} 0 0 1 {mx2:.1f} {my2:.1f}" fill="none" stroke="{ACC}" stroke-width="1.3"/>')
        out.append(seta(mx1, my1, mx2, my2, ACC, 1.3, 6))
    base = cy + r
    for i, (x, y, ang) in enumerate(pts):
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="13" fill="{PAPER}" stroke="{ACC}" stroke-width="1.3"/>')
        out.append(texto(x, y + 5, str(i + 1), 14, ACC_D, 400, "middle", fonte=SERIF)[0])
        c, sn = math.cos(ang), math.sin(ang)
        no = nos[i]
        if abs(c) < .3:
            anc, tx, lg = "middle", x, 190
            h = bloco(no, lg)
            ty = y - 22 - h + 12 if sn < 0 else y + 34
        else:
            anc, tx, lg = ("start", x + 22, larg) if c > 0 else ("end", x - 22, larg)
            h = bloco(no, lg)
            ty = y - h / 2 + 10
        s1, h1 = texto(tx, ty, no["rotulo"], 10.5, INK, 600, anc, largura=lg)
        out.append(s1)
        if no.get("nota"):
            out.append(texto(tx, ty + h1, no["nota"], 9, INK2, 400, anc, largura=lg)[0])
        base = max(base, ty + h + 4)
    y = _legenda(out, base + 6, d)
    return svg("".join(out), y + 4)


def camadas(d):
    cam = d["camadas"]  # do topo para a base
    n = len(cam)
    out, y = [], 4
    for i, c in enumerate(cam):
        base = i == n - 1
        w = 120 + 90 * i / max(n - 1, 1)
        x = 105 - w / 2
        cor = ACC if base else (ACC_L if i == n - 2 else SOFT)
        out.append(f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="38" fill="{cor}"/>')
        out.append(texto(105, y + 24, c["rotulo"], 11, PAPER if base else INK, 600, "middle")[0])
        s, h = texto(232, y + 15, c.get("nota", ""), 9.8, INK2, largura=262)
        out.append(s)
        out.append(f'<line x1="{x + w + 4:.1f}" y1="{y + 19}" x2="226" y2="{y + 19}" stroke="{LINE}" stroke-width=".8"/>')
        y += max(42, h + 12)
    if d.get("rotulo_base"):
        out.append(texto(105, y + 12, d["rotulo_base"], 9, ACC_D, 600, "middle", esp=1)[0])
        y += 16
    y = _legenda(out, y, d)
    return svg("".join(out), y + 2)


def espectro(d):
    L, R, Y = 20, 480, 70
    out = [f'<defs><linearGradient id="gesp" x1="0" x2="1"><stop offset="0" stop-color="{SOFT}"/>'
           f'<stop offset="1" stop-color="{ACC}"/></linearGradient></defs>',
           f'<rect x="{L}" y="{Y - 5}" width="{R - L}" height="10" fill="url(#gesp)"/>',
           texto(L, Y + 40, d["esquerda"], 9.5, INK2, 600)[0],
           texto(R, Y + 40, d["direita"], 9.5, ACC_D, 600, "end")[0]]
    for i, m in enumerate(sorted(d["marcas"], key=lambda m: m["pos"])):
        x = L + (R - L) * m["pos"] / 100
        cima = i % 2 == 0
        out.append(f'<line x1="{x:.1f}" y1="{Y - 9}" x2="{x:.1f}" y2="{Y + 9}" stroke="{INK}" stroke-width="1.2"/>')
        anc = "start" if x < 90 else ("end" if x > 410 else "middle")
        if cima:
            _, h = texto(x, 0, m["rotulo"], 10, INK, 600, anc, largura=120)
            s, _ = texto(x, Y - 16 - h + 12, m["rotulo"], 10, INK, 600, anc, largura=120)
        else:
            s, _ = texto(x, Y + 24, m["rotulo"], 10, INK, 600, anc, largura=120)
        out.append(s)
    y = _legenda(out, 122, d)
    return svg("".join(out), y + 2)


def balanca(d):
    e, r = d["esquerda"], d["direita"]
    ang = max(min((r["peso"] - e["peso"]) / 100 * 0.5, 0.28), -0.28)
    cx, cy, bw = W / 2, 60, 170
    xl, yl = cx - bw * math.cos(ang), cy - bw * math.sin(ang)
    xr, yr = cx + bw * math.cos(ang), cy + bw * math.sin(ang)
    out = [f'<path d="M{cx - 30} 190 L{cx + 30} 190 L{cx} {cy + 6} Z" fill="{SOFT}" stroke="{LINE}"/>',
           f'<line x1="{xl:.1f}" y1="{yl:.1f}" x2="{xr:.1f}" y2="{yr:.1f}" stroke="{INK}" stroke-width="2.2"/>',
           f'<circle cx="{cx}" cy="{cy}" r="5" fill="{ACC}"/>']
    for (x, y, item, pesado) in ((xl, yl, e, e["peso"] > r["peso"]), (xr, yr, r, r["peso"] >= e["peso"])):
        out.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x - 38:.1f}" y2="{y + 42:.1f}" stroke="{INK3}"/>')
        out.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x + 38:.1f}" y2="{y + 42:.1f}" stroke="{INK3}"/>')
        out.append(f'<path d="M{x - 48:.1f} {y + 42:.1f} q48 26 96 0 Z" fill="{ACC if pesado else SOFT}" stroke="{ACC if pesado else LINE}"/>')
        out.append(texto(x, y + 88, item["rotulo"], 10.5, INK, 600, "middle", largura=190)[0])
    y = _legenda(out, 214, d)
    return svg("".join(out), y + 4)


def matriz(d):
    cols, linhas = d["colunas"], d["linhas"]
    L = 170
    cw = (W - L) / len(cols)
    out, y = [], 8
    for j, c in enumerate(cols):
        out.append(texto(L + cw * j + cw / 2, y + 10, c, 9.5, INK2, 600, "middle", largura=cw - 6)[0])
    y += 36
    for i, l in enumerate(linhas):
        if i % 2 == 0:
            out.append(f'<rect x="0" y="{y - 4}" width="{W}" height="30" fill="{SOFT}" opacity=".6"/>')
        out.append(texto(4, y + 15, l["rotulo"], 10.5, INK, 600, largura=L - 10)[0])
        for j, v in enumerate(l["celulas"]):
            x = L + cw * j + cw / 2
            out.append(_bolinha(x, y + 11, 7, v))
        y += 30
    lx, y = 4, y + 10
    for k, rot in enumerate(d.get("legenda_marcas", ["não combina", "às vezes", "combina"])):
        out.append(_bolinha(lx + 8, y, 5, k))
        out.append(texto(lx + 18, y + 3.5, rot, 9, INK2)[0])
        lx += 26 + _larg(rot, 9) + 14
    y = _legenda(out, y + 6, d)
    return svg("".join(out), y + 6)


def _bolinha(x, y, r, v):
    if v == 2:
        return f'<circle cx="{x:.1f}" cy="{y}" r="{r}" fill="{ACC}"/>'
    if v == 1:
        return (f'<circle cx="{x:.1f}" cy="{y}" r="{r}" fill="none" stroke="{ACC}" stroke-width="1.3"/>'
                f'<path d="M{x:.1f} {y - r} A{r} {r} 0 0 1 {x:.1f} {y + r} Z" fill="{ACC}"/>')
    return f'<circle cx="{x:.1f}" cy="{y}" r="{r}" fill="none" stroke="{LINE}" stroke-width="1.2"/>'


def orbita(d):
    sat = d["satelites"]
    n = len(sat)
    cx, cy, r = W / 2, 150, 108
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{LINE}" stroke-dasharray="2 4"/>',
           f'<circle cx="{cx}" cy="{cy}" r="46" fill="{ACC}"/>']
    _, h = texto(cx, cy, d["centro"], 11, PAPER, 600, "middle", largura=80)
    out.append(texto(cx, cy - h / 2 + 10, d["centro"], 11, PAPER, 600, "middle", largura=80)[0])
    for i, t in enumerate(sat):
        ang = -math.pi / 2 + 2 * math.pi * i / n
        x, y = cx + r * math.cos(ang), cy + r * math.sin(ang)
        out.append(f'<line x1="{cx + 46 * math.cos(ang):.1f}" y1="{cy + 46 * math.sin(ang):.1f}" x2="{x - 8 * math.cos(ang):.1f}" y2="{y - 8 * math.sin(ang):.1f}" stroke="{ACC}" stroke-width=".8"/>')
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="{PAPER}" stroke="{ACC}" stroke-width="1.4"/>')
        c, sn = math.cos(ang), math.sin(ang)
        anc = "middle" if abs(c) < .25 else ("start" if c > 0 else "end")
        tx = x + (14 if anc == "start" else -14 if anc == "end" else 0)
        _, h = texto(0, 0, t, 10, INK, 600, anc, largura=130)
        if anc == "middle":
            ty = y - 14 - h + 12 if sn < 0 else y + 24
        else:
            ty = y + 4 - (h - 13) / 2
        out.append(texto(tx, ty, t, 10, INK, 600, anc, largura=130)[0])
    y = _legenda(out, 296, d)
    return svg("".join(out), y + 4)


# ------------------------------------------------------------ gráficos
def barras(d):
    series = d["series"]
    out, y = [], 6
    mx = max(s["valor"] for s in series) or 1
    if d.get("destaque") is not None:
        melhor = d["destaque"]
    elif d.get("menor_melhor", True):
        melhor = min(range(len(series)), key=lambda i: series[i]["valor"])
    else:
        melhor = max(range(len(series)), key=lambda i: series[i]["valor"])
    for i, s in enumerate(series):
        rt, h = texto(0, y + 11, s["rotulo"], 10.5, INK, 600, largura=W)
        out.append(rt)
        y += h + 2
        w = (W - 40) * s["valor"] / mx
        out.append(f'<rect x="0" y="{y}" width="{W - 40}" height="14" fill="{SOFT}"/>')
        out.append(f'<rect x="0" y="{y}" width="{w:.1f}" height="14" fill="{ACC if i == melhor else INK3}"/>')
        y += 18
        if s.get("nota"):
            rn, h2 = texto(0, y + 9, s["nota"], 9.5, INK2, largura=W - 40, estilo="italic")
            out.append(rn)
            y += h2 + 2
        y += 10
    if d.get("unidade"):
        out.append(texto(0, y + 6, d["unidade"], 9, INK3, estilo="italic")[0])
        y += 14
    y = _legenda(out, y, d)
    return svg("".join(out), y + 2)


def linha(d, area=False):
    labels = d["labels"]
    series = d.get("series") or [{"nome": d.get("nome", ""), "pontos": d["pontos"], "destaque": True}]
    L, R, T, B = 34, 360, 12, 190
    mx = max(max(s["pontos"]) for s in series) * 1.08 or 1
    out = []
    for k in range(5):
        yy = B - (B - T) * k / 4
        out.append(f'<line x1="{L}" y1="{yy:.1f}" x2="{R}" y2="{yy:.1f}" stroke="{SOFT}" stroke-width="1"/>')
    out.append(f'<line x1="{L}" y1="{B}" x2="{R}" y2="{B}" stroke="{INK3}" stroke-width="1"/>')
    n = len(labels)
    if d.get("x"):  # eixo proporcional aos valores (ex.: dias 1, 5, 10, 23…)
        x0, x1 = d["x"][0], d["x"][-1]
        xs = [L + (R - L) * (v - x0) / (x1 - x0) for v in d["x"]]
    else:
        xs = [L + (R - L) * i / (n - 1) for i in range(n)]
    for i, (x, lb) in enumerate(zip(xs, labels)):
        anc = "start" if i == 0 else ("end" if i == n - 1 and area else "middle")
        out.append(texto(x - (4 if anc == "start" else 0), B + 16, lb, 9, INK2, 400, anc)[0])
    fins = []
    for s in series:
        pts = [(x, B - (B - T) * v / mx) for x, v in zip(xs, s["pontos"])]
        dest = s.get("destaque")
        cor = ACC if dest else INK3
        if area:
            poly = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
            out.append(f'<polygon points="{L},{B} {poly} {R},{B}" fill="{ACC_L}"/>')
        path = " ".join(("M" if i == 0 else "L") + f"{x:.1f} {y:.1f}" for i, (x, y) in enumerate(pts))
        tr = "" if dest or area else ' stroke-dasharray="5 3"'
        out.append(f'<path d="{path}" fill="none" stroke="{cor}" stroke-width="{2.2 if dest else 1.5}"{tr}/>')
        for x, y in pts:
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{2.6 if dest else 2}" fill="{cor}"/>')
        fins.append([pts[-1][1], s["nome"], dest])
    fins.sort(key=lambda f: f[0])
    rot = [texto(R + 10, 0, nome, 9.5, largura=W - R - 12)[1] if nome else 0 for _, nome, _ in fins]
    for i in range(1, len(fins)):  # empilha rótulos pela altura real (1 ou 2 linhas)
        minimo = fins[i - 1][0] + rot[i - 1] + 3
        if fins[i][0] < minimo:
            fins[i][0] = minimo
    for y, nome, dest in fins:
        if nome:
            out.append(texto(R + 10, y + 3, nome, 9.5, INK if dest else INK2, 600 if dest else 400, largura=W - R - 12)[0])
    for m in d.get("marcas", []):
        if isinstance(m["em"], (int, float)) and d.get("x"):
            x0, x1 = d["x"][0], d["x"][-1]
            x = L + (R - L) * (m["em"] - x0) / (x1 - x0)
        else:
            x = xs[labels.index(m["em"])]
        out.append(f'<line x1="{x:.1f}" y1="{T}" x2="{x:.1f}" y2="{B}" stroke="{ACC}" stroke-dasharray="3 3"/>')
        out.append(texto(x + 4, T + 10, m["rotulo"], 9, ACC_D, 600, largura=110)[0])
    h = B + 26
    if d.get("unidade"):
        out.append(texto(L, h + 4, d["unidade"], 9, INK3, estilo="italic")[0])
        h += 12
    h = _legenda(out, h, d)
    return svg("".join(out), h + 2)


def area(d):
    return linha(d, area=True)


def radar(d):
    eixos, series = d["eixos"], d["series"]
    n = len(eixos)
    cx, cy, r = W / 2, 135, 100

    def pt(i, v):
        a = -math.pi / 2 + 2 * math.pi * i / n
        return cx + r * v * math.cos(a), cy + r * v * math.sin(a)
    out = []
    for k in range(1, 5):
        out.append(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in (pt(i, k / 4) for i in range(n)))}" fill="none" stroke="{SOFT}"/>')
    for i, e in enumerate(eixos):
        x, y = pt(i, 1)
        out.append(f'<line x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}" stroke="{LINE}"/>')
        c = math.cos(-math.pi / 2 + 2 * math.pi * i / n)
        anc = "middle" if abs(c) < .3 else ("start" if c > 0 else "end")
        lx, ly = pt(i, 1.14)
        out.append(texto(lx, ly + 4, e, 9.5, INK2, 600, anc, largura=110)[0])
    for j, s in enumerate(series):
        cor = ACC if j == 0 else INK3
        pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in (pt(i, v / 100) for i, v in enumerate(s["valores"])))
        out.append(f'<polygon points="{pts}" fill="{cor}" fill-opacity="{.25 if j == 0 else .08}" stroke="{cor}" stroke-width="1.6"/>')
    y = _legenda(out, 262, d)
    return svg("".join(out), y + 4)


def escada(d):
    """Degraus ascendentes: estágios de um processo."""
    passos = d["degraus"]
    n = len(passos)
    lw = (W - 10) / n
    out, base = [], 40 + 34 * n
    for i, p in enumerate(passos):
        x = 5 + lw * i
        top = base - 34 * (i + 1)
        ult = i == n - 1
        out.append(f'<rect x="{x:.1f}" y="{top}" width="{lw - 3:.1f}" height="{base - top}" fill="{ACC if ult else (ACC_L if i == n - 2 else SOFT)}"/>')
        out.append(texto(x + 8, top + 22, str(i + 1), 18, PAPER if ult else ACC_D, 400, fonte=SERIF)[0])
        out.append(texto(x + 8, top + 38, p["rotulo"], 9.6, PAPER if ult else INK, 600, largura=lw - 16)[0])
    y = base + 14
    alt_max = 0
    for i, p in enumerate(passos):
        if p.get("nota"):
            s, h = texto(5 + lw * i + 2, y + 8, p["nota"], 8.8, INK2, largura=lw - 8)
            out.append(s)
            alt_max = max(alt_max, h)
    y += alt_max + 6
    y = _legenda(out, y, d)
    return svg("".join(out), y)


FIGURAS = {
    "gap": gap, "funil": funil, "quadrante": quadrante, "fluxo": fluxo, "ciclo": ciclo,
    "camadas": camadas, "espectro": espectro, "balanca": balanca, "matriz": matriz,
    "orbita": orbita, "barras": barras, "linha": linha, "area": area, "radar": radar,
    "escada": escada,
}


def figura(d: dict) -> str:
    if d["tipo"] not in FIGURAS:
        raise ValueError(f"figura desconhecida: {d['tipo']}")
    return FIGURAS[d["tipo"]](d)


# ------------------------------------------------------------ ilustrações de abertura
# Traço fino, uma massa em dourado. Composição 400x300.
def _ilu(corpo: str) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" '
            f'fill="none" stroke="{INK}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">'
            + corpo + "</svg>")


def _ondas(y, x0=20, x1=380, amp=3, passo=18, cor=INK3, larg=.9):
    d, x = f"M{x0} {y}", x0
    while x < x1:
        d += f" q{passo/4} {-amp} {passo/2} 0 t{passo/2} 0"
        x += passo
    return f'<path d="{d}" stroke="{cor}" stroke-width="{larg}"/>'


def ilu_iceberg():
    return _ilu(
        f'<path d="M200 70 L236 118 L252 112 L282 162 L118 162 L150 124 L168 128 Z" fill="{PAPER}"/>'
        f'<path d="M190 96 l10 -8 l12 14" stroke="{INK3}" stroke-width=".8"/>'
        + _ondas(162, 20, 380, 2.5, 22, INK, 1.1)
        + f'<path d="M118 162 L84 214 L110 262 L186 286 L268 276 L318 232 L282 162 Z" fill="{ACC}" stroke="{ACC}"/>'
        f'<path d="M150 190 l20 30 l40 8 M240 200 l20 36" stroke="{ACC_L}" stroke-width=".9"/>'
        + "".join(f'<line x1="{x}" y1="{176 + (i % 3) * 10}" x2="{x + 26}" y2="{176 + (i % 3) * 10}" stroke="{INK3}" stroke-width=".6"/>'
                  for i, x in enumerate((30, 330, 52, 344, 26))))


def ilu_territorio():
    return _ilu(
        f'<path d="M30 230 C90 200 150 214 200 204 C260 192 320 208 370 230"/>'
        f'<path d="M60 230 C120 214 170 222 210 216 C260 208 300 218 340 230" stroke="{INK3}" stroke-width=".8"/>'
        f'<line x1="206" y1="206" x2="206" y2="86"/>'
        f'<path d="M206 88 L276 100 L256 118 L278 136 L206 128 Z" fill="{ACC}" stroke="{ACC}"/>'
        f'<circle cx="206" cy="84" r="3" fill="{INK}"/>'
        f'<path d="M90 222 l4 -10 l4 10 M300 224 l4 -9 l4 9 M140 220 l3 -7 l3 7" stroke="{INK3}" stroke-width=".8"/>'
        f'<ellipse cx="206" cy="210" rx="34" ry="5" stroke="{ACC}" stroke-dasharray="3 3" stroke-width=".9"/>')


def ilu_raizes():
    raizes = "".join(
        f'<path d="M200 170 C{200 + dx * .3} {200 + k * 6} {200 + dx * .8} {220 + k * 8} {200 + dx} {250 + k * 10}" stroke="{ACC}" stroke-width="{1.6 - k * .2:.2f}"/>'
        for k, dx in enumerate((-90, 90, -48, 52, -14, 18)))
    return _ilu(
        f'<line x1="30" y1="170" x2="370" y2="170" stroke="{INK3}" stroke-dasharray="4 4"/>' + raizes +
        f'<path d="M200 170 L200 108" stroke-width="1.6"/>'
        f'<path d="M200 128 C176 122 164 104 166 86 C186 90 198 106 200 128 Z" fill="{PAPER}"/>'
        f'<path d="M200 112 C222 106 234 88 232 70 C212 74 202 90 200 112 Z" fill="{PAPER}"/>'
        f'<path d="M200 128 L178 100 M200 112 L222 82" stroke="{INK3}" stroke-width=".7"/>')


def ilu_impressao():
    arcos = []
    for k in range(9):
        r = 14 + k * 11
        dest = k in (3, 4)
        arcos.append(f'<path d="M{200 - r} {150 + k * 2} A{r} {r * 1.18:.1f} 0 0 1 {200 + r} {150 - k}" '
                     f'stroke="{ACC if dest else INK}" stroke-width="{1.6 if dest else 1}"/>')
        if k > 1:
            arcos.append(f'<path d="M{200 - r} {150 + k * 2} C{200 - r} {190 + k * 4} {200 - r * .4} {212 + k * 3} {200 - r * .1:.1f} {226 + k * 3}" '
                         f'stroke="{INK3}" stroke-width=".8"/>')
    return _ilu("".join(arcos) + f'<circle cx="200" cy="150" r="3" fill="{ACC}" stroke="none"/>')


def ilu_engrenagem():
    def eng(cx, cy, r, dentes, cor, fill):
        pts = []
        for i in range(dentes * 2):
            a = math.pi * i / dentes
            rr = r + (7 if i % 2 == 0 else 0)
            pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
        return (f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="{cor}"/>'
                f'<circle cx="{cx}" cy="{cy}" r="{r * .35:.1f}" fill="{PAPER}" stroke="{cor}"/>')
    return _ilu(eng(160, 150, 58, 12, INK, PAPER) + eng(254, 108, 34, 8, ACC, ACC_L)
                + eng(268, 210, 30, 7, INK3, PAPER)
                + f'<path d="M296 196 l18 -8 M300 208 l20 0 M318 180 l6 -6 M322 214 l8 4" stroke="{ACC}" stroke-width="1.2"/>')


def ilu_colheita():
    espigas = ""
    for i, x in enumerate(range(70, 340, 30)):
        h = 110 + (i % 3) * 16
        cor = ACC if i in (3, 4, 5) else INK
        espigas += f'<path d="M{x} 232 C{x + 2} 200 {x - 2} 170 {x} {232 - h}" stroke="{cor}"/>'
        for k in range(5):
            yy = 232 - h + 10 + k * 11
            espigas += (f'<path d="M{x} {yy} q-9 -4 -11 -14" stroke="{cor}" stroke-width=".9"/>'
                        f'<path d="M{x} {yy + 4} q9 -4 11 -14" stroke="{cor}" stroke-width=".9"/>')
    return _ilu(f'<line x1="30" y1="232" x2="370" y2="232"/>' + espigas
                + f'<path d="M150 262 h100 l-10 22 h-80 Z" fill="{ACC_L}" stroke="{ACC}"/>')


def ilu_prisma():
    return _ilu(
        f'<path d="M200 90 L262 198 L138 198 Z" fill="{PAPER}"/>'
        f'<line x1="30" y1="160" x2="170" y2="146" stroke-width="1.6"/>'
        + "".join(f'<line x1="232" y1="{150 + i * 6}" x2="372" y2="{118 + i * 26}" stroke="{c}" stroke-width="1.4"/>'
                  for i, c in enumerate((INK, INK2, ACC, INK3)))
        + f'<path d="M170 146 L232 150 L232 168" stroke="{INK3}" stroke-width=".7" stroke-dasharray="2 3"/>')


def ilu_semente():
    return _ilu(
        f'<line x1="30" y1="200" x2="370" y2="200"/>'
        f'<path d="M40 214 H360 M60 228 H340" stroke="{INK3}" stroke-width=".6"/>'
        f'<ellipse cx="200" cy="222" rx="12" ry="8" fill="{ACC}" stroke="{ACC}"/>'
        f'<path d="M200 214 C200 190 196 170 200 140" stroke-width="1.4"/>'
        f'<path d="M200 160 C182 158 172 144 172 130 C188 132 198 144 200 160 Z" fill="{ACC_L}" stroke="{ACC}"/>'
        f'<path d="M200 148 C216 144 226 130 224 116 C208 120 200 132 200 148 Z" fill="{PAPER}"/>'
        f'<path d="M226 234 q10 10 22 12 M176 234 q-12 8 -20 16" stroke="{INK3}" stroke-width=".8"/>')


def ilu_farol():
    return _ilu(
        f'<path d="M212 96 L370 60 L370 132 Z" fill="{ACC_L}" stroke="none"/>'
        f'<path d="M188 96 L60 76 L60 116 Z" fill="{SOFT}" stroke="none"/>'
        f'<path d="M184 230 L192 110 L208 110 L216 230 Z" fill="{PAPER}"/>'
        f'<path d="M188 180 H212 M190 150 H210" stroke="{INK3}"/>'
        f'<rect x="188" y="92" width="24" height="18" fill="{ACC}" stroke="{ACC}"/>'
        f'<path d="M184 92 L200 76 L216 92 Z"/>'
        + _ondas(236, 20, 380, 2.5, 20, INK3, .9) + _ondas(250, 40, 360, 2, 26, INK3, .7))


def ilu_chave():
    return _ilu(
        f'<circle cx="130" cy="150" r="40" fill="{PAPER}" stroke-width="1.4"/>'
        f'<circle cx="130" cy="150" r="16" stroke="{INK3}"/>'
        f'<path d="M170 150 H320" stroke-width="1.4"/>'
        f'<path d="M280 150 v18 h12 v-10 h10 v14 h12 v-22" fill="{ACC}" stroke="{ACC}"/>'
        f'<rect x="250" y="190" width="100" height="60" fill="none" stroke="{INK3}"/>'
        f'<path d="M296 212 a6 6 0 1 1 8 0 l3 16 h-14 Z" fill="{ACC_L}" stroke="{ACC}"/>')


def ilu_lente():
    pontos = "".join(f'<circle cx="{x}" cy="{y}" r="1.6" fill="{INK3}" stroke="none"/>'
                     for x, y in ((60, 90), (90, 210), (120, 130), (300, 80), (330, 220), (350, 140), (80, 170), (310, 180)))
    return _ilu(pontos +
                f'<circle cx="190" cy="140" r="62" fill="{PAPER}" stroke-width="1.6"/>'
                f'<circle cx="190" cy="140" r="54" stroke="{INK3}" stroke-width=".6"/>'
                f'<circle cx="176" cy="128" r="9" fill="{ACC}" stroke="none"/>'
                f'<circle cx="206" cy="154" r="5" fill="{ACC_L}" stroke="{ACC}"/>'
                f'<line x1="234" y1="184" x2="286" y2="236" stroke-width="7"/>')


def ilu_ponte():
    return _ilu(
        f'<path d="M20 190 H120 M280 190 H380" stroke-width="1.6"/>'
        f'<path d="M20 190 L20 250 M380 190 L380 250" stroke="{INK3}"/>'
        f'<path d="M120 190 Q200 120 280 190" stroke="{ACC}" stroke-width="2"/>'
        + "".join(f'<line x1="{x}" y1="190" x2="{x}" y2="{190 - 70 * (1 - ((x - 200) / 80) ** 2) * .5:.1f}" stroke="{INK3}" stroke-width=".8"/>'
                  for x in range(136, 280, 16))
        + f'<line x1="120" y1="190" x2="280" y2="190" stroke-width="1.2"/>'
        + _ondas(230, 120, 280, 2.5, 18, INK3, .8))


def ilu_espelho():
    """A pessoa, inteira, diante de um espelho que devolve uma silhueta menor e sem traços."""
    return _ilu(
        f'<ellipse cx="270" cy="140" rx="62" ry="90" fill="{PAPER}" stroke-width="1.5"/>'
        f'<ellipse cx="270" cy="140" rx="53" ry="80" stroke="{INK3}" stroke-width=".7"/>'
        f'<path d="M232 88 l14 -14 M236 106 l26 -26" stroke="{INK3}" stroke-width=".7"/>'
        f'<circle cx="270" cy="138" r="12" fill="{SOFT}" stroke="{INK2}" stroke-width="1.1"/>'
        f'<path d="M248 186 C251 166 289 166 292 186" fill="{SOFT}" stroke="{INK2}" stroke-width="1.1"/>'
        f'<path d="M258 230 l-8 30 h40 l-8 -30"/>'
        f'<circle cx="110" cy="118" r="26" fill="{ACC}" stroke="none"/>'
        f'<path d="M66 214 C72 162 148 162 154 214 Z" fill="{ACC_L}" stroke="{ACC}"/>'
        f'<path d="M86 104 q24 -16 48 0" stroke="{ACC_D}" stroke-width="1"/>'
        f'<line x1="40" y1="262" x2="360" y2="262" stroke="{INK3}" stroke-width=".8"/>')


def ilu_mapa():
    return _ilu(
        f'<path d="M60 70 L150 90 L250 70 L340 90 L340 240 L250 220 L150 240 L60 220 Z" fill="{PAPER}"/>'
        f'<path d="M150 90 V240 M250 70 V220" stroke="{INK3}" stroke-width=".8"/>'
        f'<path d="M90 200 C130 180 140 140 180 150 C220 160 230 120 270 118 C290 117 300 110 306 100" stroke="{ACC}" stroke-width="1.6" stroke-dasharray="5 4"/>'
        f'<circle cx="90" cy="200" r="4" fill="{INK}"/>'
        f'<path d="M306 100 m-8 -18 a8 8 0 1 1 16 0 c0 8 -8 18 -8 18 c0 0 -8 -10 -8 -18 Z" fill="{ACC}" stroke="{ACC}"/>')


def ilu_megafone():
    return _ilu(
        f'<path d="M110 130 h36 L250 84 v132 L146 170 h-36 Z" fill="{PAPER}" stroke-width="1.4"/>'
        f'<path d="M126 170 l10 44 h18 l-6 -44"/>'
        f'<path d="M272 118 q16 32 0 64" stroke="{ACC}" stroke-width="1.6"/>'
        f'<path d="M294 100 q30 50 0 100" stroke="{ACC}" stroke-width="1.2"/>'
        f'<path d="M316 84 q42 66 0 132" stroke="{ACC_L}" stroke-width="1"/>')


ILUSTRACOES = {
    "iceberg": ilu_iceberg, "territorio": ilu_territorio, "raizes": ilu_raizes,
    "impressao-digital": ilu_impressao, "engrenagem": ilu_engrenagem, "colheita": ilu_colheita,
    "prisma": ilu_prisma, "semente": ilu_semente, "farol": ilu_farol, "chave": ilu_chave,
    "lente": ilu_lente, "ponte": ilu_ponte, "espelho": ilu_espelho, "mapa": ilu_mapa,
    "megafone": ilu_megafone,
}


def ilustracao(motivo: str) -> str:
    return ILUSTRACOES[motivo]()


def marca(tam=40, cor=ACC):
    """Marca do Modo Singular (arcos concêntricos do PWA)."""
    arcos = "".join(
        f'<path d="M{16 - r} 16 a{r} {r * 1.2:.1f} 0 0 1 {r * 2} 0" fill="none" stroke="{cor}" '
        f'stroke-width="1.5" opacity="{1 - i * .22:.2f}"/>' for i, r in enumerate((11, 8, 5)))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="{tam}" height="{tam}">'
            f'<circle cx="16" cy="16" r="14.5" fill="none" stroke="{LINE}" stroke-width="1"/>{arcos}'
            f'<circle cx="16" cy="16" r="1.8" fill="{cor}"/></svg>')
