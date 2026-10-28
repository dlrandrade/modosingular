"use client";
import { useRef } from "react";
import { A, L, slideHTML, type Contexto, type Dados } from "@/estudio/slides";

/* Um slide em miniatura, que se inclina na direção do cursor. */
export default function Quadro({ s, i, total, ctx, largura, emo = "abrir", onClick }: {
  s: Dados; i: number; total: number; ctx: Contexto; largura: number; emo?: string; onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const escala = largura / L;
  const inclina = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px)`;
  };
  const solta = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} className="quadro" style={{ width: largura, height: largura * (A / L) }} data-emo={emo}
      onPointerMove={inclina} onPointerLeave={solta} onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="esc" style={{ width: L, height: A, transform: `scale(${escala})` }} dangerouslySetInnerHTML={{ __html: slideHTML(s, i, total, ctx) }} />
    </div>
  );
}
