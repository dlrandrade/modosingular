#!/usr/bin/env python3
"""Gera os PNGs do carrossel (1080x1350) a partir dos slides de um kit.

O desenho dos slides mora num lugar só: src/estudio/slides.ts, o mesmo arquivo
que a plataforma /estudio usa no navegador. Este script pede o HTML de cada slide
ao Node (estudio/slides-cli.mjs) e fotografa com o Chromium do Playwright.

Saída em <destino>/: slide-NN.png (o carrossel), figura-NN.png (cada figura
sozinha, sem rodapé, para usar fora do carrossel) e figura-NN-reels.png (1080x1920,
fundo transparente: a figura num cartão no alto, para ficar acima da cabeça no Reels
gravado em modo selfie).
"""
import glob
import json
import subprocess
from pathlib import Path

AQUI = Path(__file__).parent
RAIZ = AQUI.parent
FONTES = (RAIZ / "public" / "estudio" / "fontes").resolve()

L, A = 1080, 1350


def html_dos_slides(slides, ctx, reels=False):
    entrada = json.dumps({"slides": slides, "ctx": {**ctx, "fontBase": FONTES.as_uri()}, "reels": reels}, ensure_ascii=False)
    r = subprocess.run(["node", "--no-warnings", str(AQUI / "slides-cli.mjs")], input=entrada,
                       capture_output=True, text=True, cwd=RAIZ)
    if r.returncode:
        raise SystemExit("erro ao montar os slides:\n" + r.stderr.strip())
    return json.loads(r.stdout)


def verificador():
    """O código de textosQueEncostam (src/estudio/slides.ts), para rodar no Chromium."""
    r = subprocess.run(["node", "--no-warnings", str(AQUI / "slides-cli.mjs")], input=json.dumps({"verificador": True}),
                       capture_output=True, text=True, cwd=RAIZ)
    return json.loads(r.stdout) if r.returncode == 0 else None


def renderizar(slides, ctx, destino: Path):
    from playwright.sync_api import sync_playwright
    destino.mkdir(parents=True, exist_ok=True)
    for velho in list(destino.glob("slide-*.png")) + list(destino.glob("figura-*.png")):
        velho.unlink()
    figs = [(i, {**s, "solo": True}) for i, s in enumerate(slides, 1) if s["tipo"] == "figura"]
    paginas = html_dos_slides(slides, ctx)
    encosta = verificador()
    paginas_fig = html_dos_slides([s for _, s in figs], ctx) if figs else []
    paginas_reels = html_dos_slides([s for _, s in figs], ctx, reels=True) if figs else []
    exe = (glob.glob("/opt/pw-browsers/chromium-*/chrome-linux*/chrome") or [None])[0]
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=exe, args=["--no-sandbox"]) if exe else p.chromium.launch()
        pg = nav.new_page(viewport={"width": L, "height": A})

        def foto(html, nome, i):
            tmp = destino / "_tmp.html"
            tmp.write_text(html)
            pg.goto(tmp.resolve().as_uri())
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(120)
            estoura = pg.evaluate("""() => { const s = document.querySelector('.sl'); const r = s.getBoundingClientRect();
                return [...s.querySelectorAll('*')].some(e => { if (e.closest('.rodape')) return false; const b = e.getBoundingClientRect();
                  return b.width > 0 && (b.bottom > r.bottom - 118 || b.right > r.right - 60); }); }""")
            if estoura:
                print(f"AVISO {nome}: conteúdo encosta na margem (slide {i}); corte texto ou simplifique")
            if encosta:
                for p in pg.evaluate(f"({encosta})(document.querySelector('.sl'))"):
                    print(f"AVISO {nome}: {p} (slide {i}); nenhum texto pode tocar outro bloco")
            pg.screenshot(path=str(destino / nome))
            tmp.unlink()

        for i, html in enumerate(paginas, 1):
            foto(html, f"slide-{i:02d}.png", i)
        for (i, _), html in zip(figs, paginas_fig):
            foto(html, f"figura-{i:02d}.png", i)
        pg.set_viewport_size({"width": 1080, "height": 1920})
        for (i, _), html in zip(figs, paginas_reels):
            tmp = destino / "_tmp.html"
            tmp.write_text(html)
            pg.goto(tmp.resolve().as_uri())
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(120)
            pg.screenshot(path=str(destino / f"figura-{i:02d}-reels.png"), omit_background=True)
            tmp.unlink()
        nav.close()
    return len(paginas)
