"use client";
import { useEffect, useMemo, useRef } from "react";

const SINAIS = ["a", "ç", "ã", "é", "s", "i", "n", "g", "u", "l", "r", "§", "¶", "*", "—", "&", "ô", "?", "m", "o"];

/* Letras soltas que sobem devagar enquanto o dia é escrito, e se afastam
   um pouco do cursor. É a sensação de flutuar enquanto se espera. */
export default function Glifos({ n = 26 }: { n?: number }) {
  const raiz = useRef<HTMLDivElement>(null);
  const itens = useMemo(() => Array.from({ length: n }, (_, i) => ({
    ch: SINAIS[(i * 7) % SINAIS.length],
    left: Math.random() * 100,
    top: 20 + Math.random() * 75,
    tam: 28 + Math.random() * 110,
    dur: 11 + Math.random() * 14,
    atraso: -Math.random() * 20,
    o: (0.12 + Math.random() * 0.28).toFixed(2),
    dx: `${(Math.random() - 0.5) * 80}px`,
  })), [n]);

  useEffect(() => {
    const el = raiz.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 }, q = 0;
    const mover = (e: PointerEvent) => { alvo = { x: (e.clientX / innerWidth - 0.5) * -36, y: (e.clientY / innerHeight - 0.5) * -24 }; };
    const laco = () => {
      atual.x += (alvo.x - atual.x) * 0.04; atual.y += (alvo.y - atual.y) * 0.04;
      el.style.transform = `translate3d(${atual.x}px, ${atual.y}px, 0)`;
      q = requestAnimationFrame(laco);
    };
    addEventListener("pointermove", mover, { passive: true });
    q = requestAnimationFrame(laco);
    return () => { cancelAnimationFrame(q); removeEventListener("pointermove", mover); };
  }, []);

  return (
    <div ref={raiz} className="glifos" aria-hidden>
      {itens.map((g, i) => (
        <span key={i} style={{
          left: `${g.left}%`, top: `${g.top}%`, fontSize: `${g.tam}px`, animationDuration: `${g.dur}s`,
          animationDelay: `${g.atraso}s`, ["--o" as string]: g.o, ["--dx" as string]: g.dx,
        }}>{g.ch}</span>
      ))}
    </div>
  );
}
