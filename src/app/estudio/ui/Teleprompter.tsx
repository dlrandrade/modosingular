"use client";
import { useEffect, useRef, useState } from "react";

/* Teleprompter: texto grande correndo devagar sobre fundo escuro.
   Espaço pausa, ↑ e ↓ mudam a velocidade, Esc fecha. */
export default function Teleprompter({ paragrafos, fechar }: { paragrafos: string[]; fechar: () => void }) {
  const rolo = useRef<HTMLDivElement>(null);
  const [vel, setVel] = useState(38);
  const [parado, setParado] = useState(true);
  const pos = useRef(0);
  const estado = useRef({ vel: 38, parado: true });
  estado.current = { vel, parado };
  const sair = useRef(fechar);
  sair.current = fechar;

  useEffect(() => {
    pos.current = innerHeight * 0.38;
    let antes = performance.now(), q = 0;
    const laco = (t: number) => {
      const dt = (t - antes) / 1000; antes = t;
      if (!estado.current.parado) pos.current -= estado.current.vel * dt;
      const alt = rolo.current?.offsetHeight || 0;
      if (pos.current < -alt + innerHeight * 0.3) pos.current = -alt + innerHeight * 0.3;
      if (rolo.current) rolo.current.style.transform = `translate(-50%, ${pos.current}px)`;
      q = requestAnimationFrame(laco);
    };
    q = requestAnimationFrame(laco);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") sair.current();
      else if (e.key === " ") { e.preventDefault(); setParado((p) => !p); }
      else if (e.key === "ArrowUp") setVel((v) => Math.min(140, v + 6));
      else if (e.key === "ArrowDown") setVel((v) => Math.max(10, v - 6));
    };
    addEventListener("keydown", tecla);
    // a tela não apaga enquanto o texto corre (Screen Wake Lock, onde houver)
    let trava: { release: () => Promise<void> } | null = null;
    const travar = () => {
      const wl = (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock;
      wl?.request("screen").then((t) => { trava = t; }).catch(() => {});
    };
    const volta = () => { if (document.visibilityState === "visible") travar(); };
    travar();
    document.addEventListener("visibilitychange", volta);
    return () => {
      cancelAnimationFrame(q); removeEventListener("keydown", tecla);
      document.removeEventListener("visibilitychange", volta);
      trava?.release().catch(() => {});
    };
  }, []);

  return (
    <div className="tele" onClick={() => setParado((p) => !p)}>
      <div className="guia" />
      <div ref={rolo} className="rolo">{paragrafos.map((p, i) => <p key={i}>{p}</p>)}</div>
      <div className="ctl" onClick={(e) => e.stopPropagation()}>
        <button data-emo="ritmo" onClick={() => setVel((v) => Math.max(10, v - 6))}>mais devagar</button>
        <button data-emo={parado ? "rodar" : "pausar"} onClick={() => setParado((p) => !p)}>{parado ? "começar" : "pausar"}</button>
        <button data-emo="ritmo" onClick={() => setVel((v) => Math.min(140, v + 6))}>mais rápido</button>
        <button data-emo="do início" onClick={() => { pos.current = innerHeight * 0.38; setParado(true); }}>do início</button>
        <button data-emo="fechar" onClick={fechar}>fechar</button>
      </div>
    </div>
  );
}
