"use client";

import { useState, useTransition } from "react";
import { salvarPerfil } from "@/app/actions";
import type { Perfil } from "@/lib/dados";

export function FormPerfil({ perfil }: { perfil: Perfil }) {
  const [pendente, start] = useTransition();
  const [salvo, setSalvo] = useState(false);
  const [d, setD] = useState({
    nome: perfil.nome ?? "",
    profissao: perfil.profissao ?? "",
    especialidade: perfil.especialidade ?? "",
    instagram: perfil.instagram ?? "",
    bio: perfil.bio ?? "",
  });

  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setD((s) => ({ ...s, [k]: e.target.value })); setSalvo(false);
  };

  return (
    <div className="card p-4 space-y-3.5">
      <Campo label="Nome" value={d.nome} onChange={set("nome")} placeholder="Como você se apresenta" />
      <Campo label="Profissão" value={d.profissao} onChange={set("profissao")} placeholder="Dentista, advogado, consultor…" />
      <Campo label="Especialidade" value={d.especialidade} onChange={set("especialidade")} placeholder="O recorte dentro da sua profissão" />
      <Campo label="Instagram" value={d.instagram} onChange={set("instagram")} placeholder="@seuperfil" />
      <label className="block">
        <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
              style={{ color: "var(--ink-3)" }}>Em uma frase, o que você resolve</span>
        <textarea className="field resize-y" rows={2} value={d.bio} onChange={set("bio")}
                  placeholder="Não é slogan. É o problema que você resolve melhor do que a maioria." />
      </label>

      <div className="flex items-center gap-3">
        <button className="btn btn-primary flex-1" disabled={pendente}
          onClick={() => start(async () => { await salvarPerfil(d); setSalvo(true); })}>
          {pendente ? "Salvando…" : "Salvar"}
        </button>
        {salvo && <span className="text-[12.5px]" style={{ color: "var(--pos)" }}>salvo ✓</span>}
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, placeholder }: {
  label: string; value: string; placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
            style={{ color: "var(--ink-3)" }}>{label}</span>
      <input className="field" value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}
