"use client";
import { useEffect, useRef } from "react";

/* O cursor que sente: um ponto que segue a mão, um anel que vem atrás com
   inércia e se estica com a velocidade, cresce e diz o que o toque vai fazer
   (data-emo), vira traço sobre o texto, e deixa uma gota de tinta no clique. */
export default function Cursor() {
  const ponto = useRef<HTMLDivElement>(null);
  const anel = useRef<HTMLDivElement>(null);
  const rotulo = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fino = window.matchMedia("(pointer: fine)").matches;
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raiz = document.querySelector(".est");
    if (!fino || !raiz) return;
    raiz.classList.add("vivo");
    let x = innerWidth / 2, y = innerHeight / 2, ax = x, ay = y, vx = 0, vy = 0, quadro = 0, ultimoRastro = 0;

    const mover = (e: PointerEvent) => {
      vx = e.clientX - x; vy = e.clientY - y; x = e.clientX; y = e.clientY;
      if (ponto.current) ponto.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const agora = performance.now();
      if (!calmo && Math.hypot(vx, vy) > 18 && agora - ultimoRastro > 45) {
        ultimoRastro = agora;
        const r = document.createElement("i");
        r.className = "rastro"; r.style.left = `${x}px`; r.style.top = `${y}px`;
        raiz.appendChild(r); setTimeout(() => r.remove(), 1400);
      }
    };
    const laco = () => {
      ax += (x - ax) * 0.16; ay += (y - ay) * 0.16;
      const vel = Math.min(Math.hypot(vx, vy), 60);
      const ang = Math.atan2(vy, vx);
      const estica = calmo ? 1 : 1 + vel / 90;
      if (anel.current) anel.current.style.transform = `translate3d(${ax}px, ${ay}px, 0) rotate(${ang}rad) scale(${estica}, ${1 / estica})`;
      if (rotulo.current) rotulo.current.style.transform = `rotate(${-ang}rad) scale(${1 / estica}, ${estica})`;
      vx *= 0.82; vy *= 0.82;
      quadro = requestAnimationFrame(laco);
    };
    const sobre = (e: Event) => {
      const alvo = e.target as HTMLElement;
      const emo = alvo.closest<HTMLElement>("[data-emo]");
      const texto = alvo.closest("input, textarea");
      anel.current?.classList.toggle("sobre", !!emo && !texto);
      anel.current?.classList.toggle("texto", !!texto);
      if (rotulo.current) rotulo.current.textContent = emo?.dataset.emo || "";
    };
    const aperta = (e: PointerEvent) => {
      anel.current?.classList.add("aperta");
      if (calmo) return;
      const g = document.createElement("i");
      g.className = "gota"; g.style.left = `${e.clientX}px`; g.style.top = `${e.clientY}px`;
      raiz.appendChild(g); setTimeout(() => g.remove(), 1100);
    };
    const solta = () => anel.current?.classList.remove("aperta");
    const some = () => { if (ponto.current) ponto.current.style.opacity = "0"; if (anel.current) anel.current.style.opacity = "0"; };
    const volta = () => { if (ponto.current) ponto.current.style.opacity = "1"; if (anel.current) anel.current.style.opacity = "1"; };

    addEventListener("pointermove", mover, { passive: true });
    addEventListener("pointerover", sobre, { passive: true });
    addEventListener("pointerdown", aperta);
    addEventListener("pointerup", solta);
    document.addEventListener("mouseleave", some);
    document.addEventListener("mouseenter", volta);
    quadro = requestAnimationFrame(laco);
    return () => {
      cancelAnimationFrame(quadro);
      removeEventListener("pointermove", mover); removeEventListener("pointerover", sobre);
      removeEventListener("pointerdown", aperta); removeEventListener("pointerup", solta);
      document.removeEventListener("mouseleave", some); document.removeEventListener("mouseenter", volta);
      raiz.classList.remove("vivo");
    };
  }, []);

  return (
    <>
      <div ref={anel} className="cur-anel" aria-hidden><span ref={rotulo} /></div>
      <div ref={ponto} className="cur-ponto" aria-hidden />
    </>
  );
}
