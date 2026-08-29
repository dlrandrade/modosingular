"use client";

import { useActionState } from "react";
import { definirNovaSenha, type EstadoAuth } from "@/app/entrar/actions";

export function NovaSenha() {
  const [estado, action, pendente] = useActionState<EstadoAuth, FormData>(definirNovaSenha, {});

  return (
    <section className="card p-4 mb-6" style={{ borderColor: "var(--accent)" }}>
      <div className="text-[10.5px] font-bold uppercase tracking-[.1em] mb-2"
           style={{ color: "var(--accent)" }}>
        Redefinir senha
      </div>
      <p className="text-[13.5px] leading-relaxed mb-3.5" style={{ color: "var(--ink-2)" }}>
        Escolha a nova senha. Ela substitui a anterior imediatamente.
      </p>

      <form action={action} className="space-y-3">
        <label className="block">
          <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
                style={{ color: "var(--ink-3)" }}>Nova senha</span>
          <input className="field" type="password" name="senha" required
                 autoComplete="new-password" placeholder="Mínimo 8 caracteres" />
        </label>
        <label className="block">
          <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
                style={{ color: "var(--ink-3)" }}>Repita a nova senha</span>
          <input className="field" type="password" name="repetir" required
                 autoComplete="new-password" placeholder="A mesma de cima" />
        </label>

        {estado.erro && (
          <p className="text-[13px] rounded-lg px-3 py-2.5"
             style={{ color: "var(--neg)", background: "color-mix(in srgb, var(--neg) 12%, transparent)" }}>
            {estado.erro}
          </p>
        )}
        {estado.aviso && (
          <p className="text-[13px] rounded-lg px-3 py-2.5"
             style={{ color: "var(--pos)", background: "color-mix(in srgb, var(--pos) 12%, transparent)" }}>
            {estado.aviso}
          </p>
        )}

        <button className="btn btn-primary w-full" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </section>
  );
}
