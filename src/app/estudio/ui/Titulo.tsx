"use client";
import { useEffect, useRef } from "react";

export type Parte = { t: string; it?: boolean };

/* Título cujas letras respondem ao cursor: as que estão perto mudam de peso
   e sobem um pouco, como quem respira. Usa o eixo de peso das fontes variáveis. */
export default function Titulo({ partes, como: Tag = "h1", pesoBase = 650, pesoItalico = 520 }: { partes: Parte[]; como?: "h1" | "h2"; pesoBase?: number; pesoItalico?: number }) {
  const raiz = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letras = Array.from(el.querySelectorAll<HTMLSpanElement>(".le"));
    let centros: { x: number; y: number }[] = [];
    const medir = () => { centros = letras.map((l) => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); };
    let px = -9999, py = -9999, pedido = 0;
    const pintar = () => {
      pedido = 0;
      letras.forEach((l, i) => {
        const c = centros[i]; if (!c) return;
        const d = Math.hypot(c.x - px, c.y - py);
        const f = Math.max(0, 1 - d / 190);
        const k = f * f * (3 - 2 * f);
        const base = Number(l.dataset.b), alvo = Number(l.dataset.a);
        l.style.fontVariationSettings = `"wght" ${Math.round(base + (alvo - base) * k)}`;
        l.style.transform = `translateY(${(-0.06 * k).toFixed(3)}em)`;
      });
    };
    const mover = (e: PointerEvent) => { px = e.clientX; py = e.clientY; if (!pedido) pedido = requestAnimationFrame(pintar); };
    medir();
    const ro = new ResizeObserver(medir); ro.observe(el);
    const rolar = () => medir();
    addEventListener("pointermove", mover, { passive: true });
    document.querySelector(".est")?.addEventListener("scroll", rolar, { passive: true });
    document.fonts?.ready.then(medir);
    return () => { ro.disconnect(); removeEventListener("pointermove", mover); document.querySelector(".est")?.removeEventListener("scroll", rolar); };
  }, [partes]);

  return (
    <Tag ref={raiz} className="titulo" aria-label={partes.map((p) => p.t).join("")}>
      {partes.map((p, i) => {
        // grotesca: 650 → 260 (a letra perto do cursor afina, como quem expira);
        // Garamond itálica: 520 → 780 (ganha corpo). Pesos: props pesoBase / pesoItalico.
        const [b, a] = p.it ? [pesoItalico, Math.min(800, pesoItalico + 260)] : [pesoBase, 260];
        const palavras = p.t.split(/(\s+)/);
        const conteudo = palavras.map((w, j) =>
          /^\s+$/.test(w) ? w : (
            <span key={j} style={{ whiteSpace: "nowrap" }} aria-hidden>
              {Array.from(w).map((ch, k) => <span key={k} className="le" data-b={b} data-a={a}>{ch}</span>)}
            </span>
          ),
        );
        return p.it ? <em key={i}>{conteudo}</em> : <span key={i}>{conteudo}</span>;
      })}
    </Tag>
  );
}
