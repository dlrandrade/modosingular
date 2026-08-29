"use client";

import { useMemo, useState, useTransition } from "react";
import { adicionarMateriaPrima, removerMateriaPrima } from "@/app/actions";

interface Item {
  id: string; tipo: string; texto: string; contexto: string | null;
  created_at: string; usado_em: number | null;
}

const TIPOS = [
  { id: "pergunta",   rotulo: "Pergunta",   ajuda: "Uma dúvida que te fizeram" },
  { id: "objecao",    rotulo: "Objeção",    ajuda: "'Mas eu ouvi dizer que…'" },
  { id: "caso",       rotulo: "Caso",       ajuda: "Algo que fugiu do padrão" },
  { id: "erro",       rotulo: "Erro comum", ajuda: "O que fazem antes de chegar em você" },
  { id: "decisao",    rotulo: "Decisão",    ajuda: "Onde você escolheu A e não B" },
  { id: "opiniao",    rotulo: "Opinião",    ajuda: "Onde você discorda dos pares" },
  { id: "explicacao", rotulo: "Explicação", ajuda: "O que você repete há anos" },
  { id: "observacao", rotulo: "Observação", ajuda: "O que ninguém comentou" },
];

export function BancoMateriaPrima({ itens }: { itens: Item[] }) {
  const [pendente, start] = useTransition();
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("pergunta");
  const [filtro, setFiltro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const visiveis = useMemo(() => itens.filter((i) =>
    (!filtro || i.tipo === filtro) &&
    (!busca || i.texto.toLowerCase().includes(busca.toLowerCase()))
  ), [itens, filtro, busca]);

  const contagem = useMemo(() => {
    const m: Record<string, number> = {};
    itens.forEach((i) => { m[i.tipo] = (m[i.tipo] ?? 0) + 1; });
    return m;
  }, [itens]);

  function adicionar() {
    if (texto.trim().length < 3) return;
    start(async () => {
      await adicionarMateriaPrima({ tipo, texto: texto.trim() });
      setTexto("");
    });
  }

  return (
    <>
      {/* -------------------------------------------------- captura */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {TIPOS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTipo(t.id)} title={t.ajuda}
              className="px-2.5 py-1 rounded-full text-[12px] font-medium border transition"
              style={{
                borderColor: tipo === t.id ? "var(--accent)" : "var(--line)",
                background: tipo === t.id ? "var(--accent-dim)" : "transparent",
                color: tipo === t.id ? "var(--accent)" : "var(--ink-3)",
              }}>
              {t.rotulo}
            </button>
          ))}
        </div>
        <textarea className="field resize-y" rows={2} value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) adicionar(); }}
          placeholder={TIPOS.find((t) => t.id === tipo)?.ajuda + " — frase crua, sem estruturar."} />
        <button className="btn btn-primary w-full mt-2.5" disabled={pendente || texto.trim().length < 3}
                onClick={adicionar}>
          {pendente ? "Guardando…" : "Guardar (⌘+Enter)"}
        </button>
      </div>

      {/* ------------------------------------------------- estoque */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-[1.28rem]">
          {itens.length} {itens.length === 1 ? "item guardado" : "itens guardados"}
        </h2>
        {itens.length >= 20 && (
          <span className="text-[12px]" style={{ color: "var(--pos)" }}>
            estoque suficiente para {Math.floor(itens.length / 2)} semanas
          </span>
        )}
      </div>

      {itens.length > 0 && (
        <>
          <input className="field mb-3" placeholder="Buscar no banco…"
                 value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="flex flex-wrap gap-1.5 mb-4">
            <Chip ativo={!filtro} onClick={() => setFiltro(null)}>tudo ({itens.length})</Chip>
            {TIPOS.filter((t) => contagem[t.id]).map((t) => (
              <Chip key={t.id} ativo={filtro === t.id} onClick={() => setFiltro(filtro === t.id ? null : t.id)}>
                {t.rotulo} ({contagem[t.id]})
              </Chip>
            ))}
          </div>
        </>
      )}

      {visiveis.length === 0 ? (
        <p className="text-[14px] text-center py-10 leading-relaxed" style={{ color: "var(--ink-3)" }}>
          {itens.length === 0
            ? "Nada ainda. A próxima pergunta que te fizerem já é conteúdo — guarde antes de esquecer."
            : "Nenhum item com esse filtro."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visiveis.map((i) => (
            <li key={i.id} className="card p-3.5 group">
              <div className="flex items-start gap-3">
                <span className="chip shrink-0">{TIPOS.find((t) => t.id === i.tipo)?.rotulo ?? i.tipo}</span>
                <p className="text-[14px] leading-relaxed flex-1" style={{ color: "var(--ink-2)" }}>{i.texto}</p>
                <button onClick={() => start(async () => { await removerMateriaPrima(i.id); })}
                        className="shrink-0 text-[16px] opacity-0 group-hover:opacity-60 transition"
                        style={{ color: "var(--neg)" }} aria-label="Remover">×</button>
              </div>
              <div className="text-[11px] mt-2" style={{ color: "var(--ink-3)" }}>
                {new Date(i.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                {i.usado_em && ` · virou conteúdo no dia ${i.usado_em}`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Chip({ ativo, onClick, children }: {
  ativo: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[11.5px] font-medium border transition"
      style={{
        borderColor: ativo ? "var(--accent)" : "var(--line)",
        background: ativo ? "var(--accent-dim)" : "transparent",
        color: ativo ? "var(--accent)" : "var(--ink-3)",
      }}>
      {children}
    </button>
  );
}
