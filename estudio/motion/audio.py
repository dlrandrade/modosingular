"""Trilha sincronizada: lê os tempos das cenas (json) e sintetiza whoosh + impacto por linha,
boom grave nos vereditos, risers entre cenas e um drone de fundo. Saída: wav 48 kHz estéreo."""
import json, sys, wave
import numpy as np
SR = 48000
ev = json.load(open(sys.argv[1])); D = ev["D"]
n = int((D + 1.5) * SR); L = np.zeros(n); R = np.zeros(n)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR

def put(sig, t, g=1.0, pan=0.0):
    i = int(max(t, 0) * SR); j = min(n, i + len(sig))
    if j <= i: return
    s = sig[: j - i] * g
    L[i:j] += s * (1 - max(pan, 0)); R[i:j] += s * (1 + min(pan, 0))

def lp_sweep(x, f0, f1):
    """passa-baixa de um polo com corte variável (whoosh/riser)"""
    f = np.linspace(f0, f1, len(x)); a = 1 - np.exp(-2 * np.pi * f / SR)
    y = np.empty_like(x); s = 0.0
    for k in range(len(x)):
        s += a[k] * (x[k] - s); y[k] = s
    return y

def whoosh(d, up=True):
    x = rng.standard_normal(int(d * SR))
    y = lp_sweep(x, 300, 7000) if up else lp_sweep(x, 7000, 300)
    t = np.linspace(0, 1, len(y)); env = np.sin(np.pi * t) ** 2 if up else np.sin(np.pi * t) ** 2
    return y * env * 1.6

def thud(f0, f1, d, tau):
    t = t_(d); f = f1 + (f0 - f1) * np.exp(-t / (tau * 0.25))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(2.2 * np.sin(ph)) * np.exp(-t / tau)

def click(d=0.05):
    t = t_(d); return rng.standard_normal(len(t)) * np.exp(-t / 0.008)

def blip(f, d=0.12):
    t = t_(d); return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03)

# drone: fundamental + quinta + oitava, respira devagar e cresce até o fim
t = t_(D + 1.5)
g = np.minimum(1, t / 2.0) * (0.45 + 0.55 * np.clip(t / D, 0, 1)) * np.clip((D + 1.5 - t) / 1.2, 0, 1)
dr = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t) + 0.35 * np.sin(2 * np.pi * 110 * t + 0.6 * np.sin(2 * np.pi * 0.15 * t)))
dr *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.5 * t)) * g * 0.16
L[: len(dr)] += dr; R[: len(dr)] += dr

for ci, sc in enumerate(ev["cenas"]):
    last = ci == len(ev["cenas"]) - 1
    if ci > 0:  # riser reverso desembocando na virada de cena
        put(whoosh(0.7, True), sc["a"] - 0.55, 0.55)
    for li, ln in enumerate(sc["linhas"]):
        T = ln["t"]; pan = ((li % 2) * 2 - 1) * 0.25
        c = ln["c"]
        if c == "a":    # linha de apoio: tique leve
            put(whoosh(0.28), T - 0.05, 0.35, pan); put(click(), T + 0.1, 0.5, pan); put(blip(1900), T + 0.1, 0.18, pan)
        elif c == "c":  # linha de texto: whoosh + impacto médio
            put(whoosh(0.34), T - 0.1, 0.55, pan); put(thud(170, 62, 0.45, 0.12), T + 0.1, 0.85); put(click(), T + 0.1, 0.5, pan)
        else:           # veredito / pergunta: boom grave
            put(whoosh(0.5), T - 0.3, 0.8, pan)
            put(thud(110, 38, 1.4, 0.38), T + 0.12, 1.25); put(thud(260, 80, 0.5, 0.1), T + 0.12, 0.7)
            put(click(0.08), T + 0.12, 0.9); put(blip(880, 0.5) * np.exp(-t_(0.5) / 0.25), T + 0.12, 0.2)
            if last: put(thud(80, 30, 3.0, 0.9), T + 0.12, 0.9)

# máster: saturação suave para dar corpo, depois loudnorm no ffmpeg
m = max(np.abs(L).max(), np.abs(R).max()); L, R = np.tanh(1.6 * L / m), np.tanh(1.6 * R / m)
pcm = (np.stack([L, R], 1) * 32767 * 0.95).astype("<i2")
w = wave.open(sys.argv[2] + ".raw.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
import subprocess
subprocess.run(["ffmpeg", "-y", "-i", sys.argv[2] + ".raw.wav", "-af", "loudnorm=I=-12:TP=-2.0:LRA=7,alimiter=limit=0.89", "-ar", "48000", sys.argv[2], "-loglevel", "error"], check=True)
import os; os.remove(sys.argv[2] + ".raw.wav")
