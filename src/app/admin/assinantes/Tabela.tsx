"use client";

import { useMemo, useState, useTransition } from "react";
import {
  reenviarSenha, reenviarConfirmacao, definirAcesso, definirPapel, reiniciarJornada,
} from "../actions";

interface Linha {
  id: string; email: string | null; nome: string | null; profissao: string | null;
  role: string; linguagem_primaria: string | null;
  cadastrado_em: string; status_assinatura: string; current_period_end: string | null;
  jornada_iniciada_em: string | null; streak_atual: number | null;
  capitulos_concluidos: number; tarefas_entregues: number; ultima_atividade: string | null;
}

const FILTROS = [
  { id: "todos",    rotulo: "Todos" },
  { id: "ativos",   rotulo: "Ativos" },
  { id: "gratuito", rotulo: "Gratuitos" },
  { id: "perdidos", rotulo: "Cancelados" },
];

export function TabelaAssinantes({ linhas }: { linhas: Linha[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [aberto, setAberto] = useState<string | null>(null);

  const visiveis = useMemo(() => linhas.filter((l) => {
    const t = busca.toLowerCase();
    const casaBusca = !t ||
      (l.email ?? "").toLowerCase().includes(t) ||
      (l.nome ?? "").toLowerCase().includes(t);
    const ativo = ["active", "trialing"].includes(l.status_assinatura);
    const casaFiltro =
      filtro === "todos" ? true :
      filtro === "ativos" ? ativo :
      filtro === "gratuito" ? l.status_assinatura === "none" :
      !ativo && l.status_assinatura !== "none";
    return casaBusca && casaFiltro;
  }), [linhas, busca, filtro]);

  return (
    <>
      <input className="field mb-3" placeholder="Buscar por nome ou e-mail…"
             value={busca} onChange={(e) => setBusca(e.target.value)} />
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTROS.map((f) => (
          <button key={f.id} onClick={() => setFiltro(f.id)}
            className="px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition"
            style={{
              borderColor: filtro === f.id ? "var(--accent)" : "var(--line)",
              background: filtro === f.id ? "var(--accent-dim)" : "transparent",
              color: filtro === f.id ? "var(--accent)" : "var(--ink-3)",
            }}>
            {f.rotulo}
          </button>
        ))}
        <span className="ml-auto self-center text-[12.5px]" style={{ color: "var(--ink-3)" }}>
          {visiveis.length} {visiveis.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </div>

      <ul className="space-y-2">
        {visiveis.map((l) => (
          <Card key={l.id} l={l} aberto={aberto === l.id}
                alternar={() => setAberto(aberto === l.id ? null : l.id)} />
        ))}
      </ul>

      {visiveis.length === 0 && (
        <p className="text-center py-10 text-[14px]" style={{ color: "var(--ink-3)" }}>
          Ninguém com esse filtro.
        </p>
      )}
    </>
  );
}

function Card({ l, aberto, alternar }: { l: Linha; aberto: boolean; alternar: () => void }) {
  const [pendente, start] = useTransition();
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const ativo = ["active", "trialing"].includes(l.status_assinatura);

  function acao(fn: () => Promise<{ ok: boolean; mensagem?: string; erro?: string }>) {
    start(async () => {
      const r = await fn();
      setMsg(r.ok
        ? { tipo: "ok", texto: r.mensagem ?? "feito" }
        : { tipo: "erro", texto: r.erro ?? "falhou" });
    });
  }

  return (
    <li className="card overflow-hidden">
      <button onClick={alternar} className="w-full flex items-center gap-3 p-3.5 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium truncate">{l.nome ?? "sem nome"}</span>
            {l.role === "admin" && (
              <span className="chip shrink-0" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>admin</span>
            )}
          </div>
          <div className="text-[12px] truncate" style={{ color: "var(--ink-3)" }}>{l.email}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[12px] font-semibold"
               style={{ color: ativo ? "var(--pos)" : "var(--ink-3)" }}>
            {ativo ? "ativo" : l.status_assinatura === "none" ? "gratuito" : l.status_assinatura}
          </div>
          <div className="text-[11px]" style={{ color: "var(--ink-3)" }}>
            {l.capitulos_concluidos}/30 · {l.tarefas_entregues} tarefas
          </div>
        </div>
      </button>

      {aberto && (
        <div className="p-3.5 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[12.5px] pb-3 border-b hair">
            <Info rotulo="Profissão" valor={l.profissao ?? "—"} />
            <Info rotulo="Linguagem" valor={l.linguagem_primaria ?? "não testada"} />
            <Info rotulo="Cadastro" valor={fmt(l.cadastrado_em)} />
            <Info rotulo="Última atividade" valor={l.ultima_atividade ? fmt(l.ultima_atividade) : "nenhuma"} />
            <Info rotulo="Sequência" valor={`${l.streak_atual ?? 0} dias`} />
            <Info rotulo="Renova em" valor={l.current_period_end ? fmt(l.current_period_end) : "—"} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Botao onClick={() => l.email && acao(() => reenviarSenha(l.email!))} disabled={pendente}>
              Reenviar senha
            </Botao>
            <Botao onClick={() => l.email && acao(() => reenviarConfirmacao(l.email!))} disabled={pendente}>
              Reenviar confirmação
            </Botao>
            <Botao onClick={() => l.email && acao(() => definirAcesso(l.id, l.email!, !ativo))} disabled={pendente}
                   destaque={!ativo}>
              {ativo ? "Revogar acesso" : "Liberar acesso"}
            </Botao>
            <Botao onClick={() => acao(() => reiniciarJornada(l.id))} disabled={pendente}>
              Reiniciar no Dia 1
            </Botao>
            <Botao onClick={() => acao(() => definirPapel(l.id, l.role !== "admin"))} disabled={pendente}>
              {l.role === "admin" ? "Remover admin" : "Tornar admin"}
            </Botao>
          </div>

          {msg && (
            <p className="text-[12.5px]" style={{ color: msg.tipo === "ok" ? "var(--pos)" : "var(--neg)" }}>
              {msg.texto}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>{rotulo}</div>
      <div style={{ color: "var(--ink-2)" }}>{valor}</div>
    </div>
  );
}

function Botao({ children, onClick, disabled, destaque }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; destaque?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition disabled:opacity-40"
      style={{
        borderColor: destaque ? "var(--accent)" : "var(--line)",
        color: destaque ? "var(--accent)" : "var(--ink-2)",
        background: destaque ? "var(--accent-dim)" : "transparent",
      }}>
      {children}
    </button>
  );
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
