"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { entrar, criarConta, recuperarSenha, type EstadoAuth } from "./actions";

type Aba = "entrar" | "criar" | "recuperar";

export function FormAuth() {
  const params = useSearchParams();
  const proximo = params.get("proximo") ?? "/jornada";
  const [aba, setAba] = useState<Aba>("entrar");

  const [estEntrar, actEntrar, pEntrar] = useActionState<EstadoAuth, FormData>(entrar, {});
  const [estCriar, actCriar, pCriar] = useActionState<EstadoAuth, FormData>(criarConta, {});
  const [estRec, actRec, pRec] = useActionState<EstadoAuth, FormData>(recuperarSenha, {});

  const estado = aba === "entrar" ? estEntrar : aba === "criar" ? estCriar : estRec;
  const pendente = aba === "entrar" ? pEntrar : aba === "criar" ? pCriar : pRec;
  const action = aba === "entrar" ? actEntrar : aba === "criar" ? actCriar : actRec;

  return (
    <div className="card p-5">
      {aba !== "recuperar" && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg mb-5" style={{ background: "var(--bg-2)" }}>
          {(["entrar", "criar"] as const).map((a) => (
            <button key={a} type="button" onClick={() => setAba(a)}
              className="py-2 rounded-md text-[13.5px] font-semibold transition"
              style={{
                background: aba === a ? "var(--surface)" : "transparent",
                color: aba === a ? "var(--ink)" : "var(--ink-3)",
                border: aba === a ? "1px solid var(--line)" : "1px solid transparent",
              }}>
              {a === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>
      )}

      {aba === "recuperar" && (
        <div className="mb-4">
          <button type="button" onClick={() => setAba("entrar")}
                  className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
            ← voltar
          </button>
          <h2 className="font-serif text-[1.28rem] mt-2">Redefinir senha</h2>
          <p className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>
            Enviamos um link para você criar uma nova senha.
          </p>
        </div>
      )}

      <form action={action} className="space-y-3">
        <input type="hidden" name="proximo" value={proximo} />

        {aba === "criar" && (
          <Campo label="Como você se chama" name="nome" type="text"
                 placeholder="Seu nome" autoComplete="name" />
        )}

        <Campo label="E-mail" name="email" type="email"
               placeholder="voce@email.com" autoComplete="email" />

        {aba !== "recuperar" && (
          <Campo label="Senha" name="senha" type="password"
                 placeholder={aba === "criar" ? "Mínimo 8 caracteres" : "Sua senha"}
                 autoComplete={aba === "criar" ? "new-password" : "current-password"} />
        )}

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

        <button type="submit" disabled={pendente} className="btn btn-primary w-full">
          {pendente ? "Um momento…"
            : aba === "entrar" ? "Entrar"
            : aba === "criar" ? "Começar o Dia 1"
            : "Enviar link"}
        </button>
      </form>

      {aba === "entrar" && (
        <button type="button" onClick={() => setAba("recuperar")}
                className="w-full text-center text-[13px] mt-4" style={{ color: "var(--ink-3)" }}>
          Esqueci minha senha
        </button>
      )}
      {aba === "criar" && (
        <p className="text-[12px] mt-4 leading-relaxed text-center" style={{ color: "var(--ink-3)" }}>
          Capítulos 1 a 3 livres. A partir do Dia 4, a assinatura é de R$ 19,90 por mês.
        </p>
      )}
    </div>
  );
}

function Campo({ label, name, type, placeholder, autoComplete }: {
  label: string; name: string; type: string; placeholder: string; autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
            style={{ color: "var(--ink-3)" }}>{label}</span>
      <input className="field" name={name} type={type} placeholder={placeholder}
             autoComplete={autoComplete} required />
    </label>
  );
}
