"use client";
import { useEffect, useRef } from "react";

/* O cursor que sente: só um ponto de tinta. Ele cresce e ganha o dourado
   sobre o que pode ser tocado, vira traço sobre o texto, deixa um rastro
   quando a mão corre e uma gota de tinta no clique. */
export default function Cursor() {
  const ponto = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fino = window.matchMedia("(pointer: fine)").matches;
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raiz = document.querySelector(".est");
    if (!fino || !raiz) return;
    raiz.classList.add("vivo");
    let x = innerWidth / 2, y = innerHeight / 2, ultimoRastro = 0;

    const mover = (e: PointerEvent) => {
      const vx = e.clientX - x, vy = e.clientY - y;
      x = e.clientX; y = e.clientY;
      if (ponto.current) ponto.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const agora = performance.now();
      if (!calmo && Math.hypot(vx, vy) > 18 && agora - ultimoRastro > 45) {
        ultimoRastro = agora;
        const r = document.createElement("i");
        r.className = "rastro"; r.style.left = `${x}px`; r.style.top = `${y}px`;
        raiz.appendChild(r); setTimeout(() => r.remove(), 1400);
      }
    };
    const sobre = (e: Event) => {
      const alvo = e.target as HTMLElement;
      const texto = alvo.closest("input, textarea, [contenteditable='true']");
      ponto.current?.classList.toggle("sobre", !!alvo.closest("[data-emo]") && !texto);
      ponto.current?.classList.toggle("texto", !!texto);
    };
    const aperta = (e: PointerEvent) => {
      ponto.current?.classList.add("aperta");
      if (calmo) return;
      const g = document.createElement("i");
      g.className = "gota"; g.style.left = `${e.clientX}px`; g.style.top = `${e.clientY}px`;
      raiz.appendChild(g); setTimeout(() => g.remove(), 1100);
    };
    const solta = () => ponto.current?.classList.remove("aperta");
    const some = () => { if (ponto.current) ponto.current.style.opacity = "0"; };
    const volta = () => { if (ponto.current) ponto.current.style.opacity = "1"; };

    addEventListener("pointermove", mover, { passive: true });
    addEventListener("pointerover", sobre, { passive: true });
    addEventListener("pointerdown", aperta);
    addEventListener("pointerup", solta);
    document.addEventListener("mouseleave", some);
    document.addEventListener("mouseenter", volta);
    return () => {
      removeEventListener("pointermove", mover); removeEventListener("pointerover", sobre);
      removeEventListener("pointerdown", aperta); removeEventListener("pointerup", solta);
      document.removeEventListener("mouseleave", some); document.removeEventListener("mouseenter", volta);
      raiz.classList.remove("vivo");
    };
  }, []);

  return <div ref={ponto} className="cur-ponto" aria-hidden><i /></div>;
}
