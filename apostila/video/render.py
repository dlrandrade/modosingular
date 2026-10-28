#!/usr/bin/env python3
"""Renderiza o vídeo promocional (30 s, 1080x1920, 30 fps) quadro a quadro e monta com áudio sintetizado.

  python3 apostila/video/render.py            # gera apostila/video/modo-singular-promo.mp4
  python3 apostila/video/render.py --teste    # só alguns quadros-chave em PNG
Requer: pip install playwright imageio-ffmpeg numpy
"""
import sys, math, wave, struct, subprocess, shutil
from pathlib import Path
import numpy as np

AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent / "diagramacao"))
import figuras as FIG  # noqa: E402

FPS, DUR, W, H = 30, 30.0, 1080, 1920
TMP = AQUI / "_quadros"


def html():
    s = (AQUI / "promo.html").read_text()
    return s.replace("{{MARCA}}", FIG.marca(96, "#d9b360"))


def quadros(so_teste):
    from playwright.sync_api import sync_playwright
    (AQUI / "_promo.html").write_text(html())
    TMP.mkdir(exist_ok=True)
    for f in TMP.glob("*.png"):
        f.unlink()
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--no-sandbox"])
        pg = nav.new_page(viewport={"width": W, "height": H})
        pg.goto((AQUI / "_promo.html").resolve().as_uri())
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(600)
        if so_teste:
            for t in (1.2, 3.3, 6.9, 10.0, 15.5, 21.5, 25.0, 29.5):
                pg.evaluate(f"seek({t})")
                pg.screenshot(path=str(TMP / f"t{t:05.1f}.png"))
        else:
            for n in range(int(FPS * DUR)):
                pg.evaluate(f"seek({n / FPS})")
                pg.screenshot(path=str(TMP / f"q{n:04d}.png"))
        nav.close()


def audio(caminho):
    """Trilha suave: pad em Lá menor (Am–F–C–G) com arpejo discreto e acorde final resolvido."""
    sr = 44100
    n = int(sr * DUR)
    t = np.arange(n) / sr
    L = np.zeros(n); R = np.zeros(n)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)

    def nota(m, ini, dur, amp, pan=0.0, ataque=.6, rel=1.4, harm=(1, .4, .18, .08)):
        i0 = int(ini * sr); k = min(int(dur * sr), n - i0)
        if k <= 0:
            return
        tt = np.arange(k) / sr
        y = sum(a * np.sin(2 * math.pi * hz(m) * (h) * tt + 0.3 * h) for h, a in zip(range(1, len(harm) + 1), harm))
        y += 0.5 * np.sin(2 * math.pi * hz(m) * 1.003 * tt)
        env = np.minimum(1, tt / ataque) * np.minimum(1, np.maximum(0, (dur - tt)) / rel)
        y = y * env * amp
        L[i0:i0 + k] += y * (1 - pan) / 2 * 2 * .5
        R[i0:i0 + k] += y * (1 + pan) / 2 * 2 * .5

    acordes = [(57, [45, 57, 60, 64]), (53, [41, 53, 57, 60]), (48, [48, 55, 60, 64]), (55, [43, 55, 59, 62])]
    passo = 3.75
    for c in range(8):
        base = acordes[c % 4][1]
        for j, m in enumerate(base):
            nota(m, c * passo, passo + .8, .055 if j else .08, pan=(j - 1.5) * .25)
    # arpejo suave sobre a estrutura (a partir do reveal do livro)
    esc = [69, 72, 76, 74, 72, 67, 69, 64]
    for k in range(int(11.7 / .5), int(26.4 / .5)):
        ac = acordes[int(k * .5 / passo) % 4][1]
        m = ac[1 + (k % 3)] + 12 + (12 if k % 5 == 0 else 0)
        nota(m, k * .5, 1.2, .028, pan=math.sin(k) * .5, ataque=.02, rel=1.1, harm=(1, .25, .08))
    # acorde final: Lá menor -> Lá maior, aberto, no "em breve!"
    for j, m in enumerate([45, 57, 61, 64, 69, 73]):
        nota(m, 26.7, 3.3, .07, pan=(j - 2.5) * .3, ataque=.5, rel=1.6)
    nota(81, 27.05, 2.9, .035, ataque=.01, rel=2.4, harm=(1, .12))
    y = np.stack([L, R], 1)
    fade = np.minimum(1, t / 1.0) * np.minimum(1, (DUR - t) / 1.2)
    y *= fade[:, None]
    y = y / (np.abs(y).max() + 1e-9) * 0.5
    with wave.open(str(caminho), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((y * 32767).astype("<i2").tobytes())


def montar(saida):
    import imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    wav = AQUI / "_trilha.wav"
    audio(wav)
    subprocess.run([ff, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(TMP / "q%04d.png"), "-i", str(wav),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "medium", "-movflags", "+faststart",
                    "-c:a", "aac", "-b:a", "192k", "-t", str(DUR), str(saida)], check=True)


if __name__ == "__main__":
    teste = "--teste" in sys.argv
    quadros(teste)
    if not teste:
        saida = AQUI / "modo-singular-promo.mp4"
        montar(saida)
        shutil.rmtree(TMP); (AQUI / "_promo.html").unlink(); (AQUI / "_trilha.wav").unlink()
        print(saida, saida.stat().st_size // 1024, "KB")
