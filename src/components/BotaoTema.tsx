"use client";
import { useEffect, useState } from "react";

export function BotaoTema() {
  const [claro, setClaro] = useState(false);

  useEffect(() => {
    setClaro(document.documentElement.dataset.theme === "light");
  }, []);

  function alternar() {
    const novo = claro ? "dark" : "light";
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem("ms-tema", novo); } catch {}
    setClaro(!claro);
  }

  return (
    <button onClick={alternar} aria-label="Alternar tema"
            className="w-8 h-8 grid place-items-center rounded-lg border"
            style={{ borderColor: "var(--line)", color: "var(--ink-3)" }}>
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        {claro
          ? <><circle cx="10" cy="10" r="3.6" /><path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M16 4l-1.4 1.4M5.4 14.6L4 16" strokeLinecap="round" /></>
          : <path d="M16.5 11.4A7 7 0 018.6 3.5a7 7 0 107.9 7.9z" strokeLinejoin="round" />}
      </svg>
    </button>
  );
}
