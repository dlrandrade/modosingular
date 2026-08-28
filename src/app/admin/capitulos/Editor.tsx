"use client";

import { useState, useTransition } from "react";
import { salvarCapitulo } from "../actions";

interface Cap {
  n: number; tema: string; fase: string;
  video_url: string; video_provider: string; nota_admin: string; publicado: boolean;
}

export function EditorCapitulos({ capitulos }: { capitulos: Cap[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  const [busca, setBusca] = useState("");

  const visiveis = capitulos.filter((c) =>
    !busca || c.tema.toLowerCase().includes(busca.toLowerCase()) || String(c.n) === busca);

  return (
    <>
      <input className="field mb-4" placeholder="Buscar capítulo por número ou tema…"
             value={busca} onChange={(e) => setBusca(e.target.value)} />
      <ul className="space-y-2">
        {visiveis.map((c) => (
          <Linha key={c.n} cap={c} aberto={aberto === c.n}
                 alternar={() => setAberto(aberto === c.n ? null : c.n)} />
        ))}
      </ul>
    </>
  );
}

function Linha({ cap, aberto, alternar }: { cap: Cap; aberto: boolean; alternar: () => void }) {
  const [pendente, start] = useTransition();
  const [d, setD] = useState({
    video_url: cap.video_url, nota_admin: cap.nota_admin, publicado: cap.publicado,
  });
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  return (
    <li className="card overflow-hidden">
      <button onClick={alternar} className="w-full flex items-center gap-3 p-3.5 text-left">
        <span className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold border"
              style={{ borderColor: "var(--line)", color: "var(--ink-3)" }}>{cap.n}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium truncate">{cap.tema}</div>
          <div className="text-[11.5px]" style={{ color: "var(--ink-3)" }}>{cap.fase}</div>
        </div>
        {cap.video_url && (
          <span className="chip shrink-0" style={{ color: "var(--pos)", borderColor: "var(--pos)" }}>vídeo</span>
        )}
        <span className="shrink-0 text-[13px]" style={{ color: "var(--ink-3)" }}>{aberto ? "−" : "+"}</span>
      </button>

      {aberto && (
        <div className="p-3.5 pt-0 space-y-3">
          <label className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
                  style={{ color: "var(--ink-3)" }}>URL do vídeo</span>
            <input className="field" value={d.video_url}
                   onChange={(e) => { setD({ ...d, video_url: e.target.value }); setMsg(null); }}
                   placeholder="https://youtu.be/… · vimeo · Panda · .mp4" />
            <span className="block text-[11.5px] mt-1.5" style={{ color: "var(--ink-3)" }}>
              YouTube, Vimeo e Panda são detectados automaticamente. Deixe vazio para remover.
            </span>
          </label>

          <label className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
                  style={{ color: "var(--ink-3)" }}>Recado no topo do capítulo</span>
            <textarea className="field resize-y" rows={2} value={d.nota_admin}
                      onChange={(e) => { setD({ ...d, nota_admin: e.target.value }); setMsg(null); }}
                      placeholder="Opcional. Aparece logo abaixo do vídeo, para todos os assinantes." />
          </label>

          <label className="flex items-center gap-2.5 text-[13.5px]" style={{ color: "var(--ink-2)" }}>
            <input type="checkbox" checked={d.publicado}
                   onChange={(e) => { setD({ ...d, publicado: e.target.checked }); setMsg(null); }} />
            Capítulo publicado
          </label>

          <div className="flex items-center gap-3">
            <button className="btn btn-primary" disabled={pendente}
              onClick={() => start(async () => {
                const r = await salvarCapitulo(cap.n, d);
                setMsg(r.ok ? { tipo: "ok", texto: "salvo" } : { tipo: "erro", texto: r.erro });
              })}>
              {pendente ? "Salvando…" : "Salvar"}
            </button>
            {msg && (
              <span className="text-[12.5px]"
                    style={{ color: msg.tipo === "ok" ? "var(--pos)" : "var(--neg)" }}>{msg.texto}</span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
