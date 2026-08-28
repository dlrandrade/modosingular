"use client";

import { useState, useTransition } from "react";
import { salvarConfig } from "../actions";

export function FormConfig({ cfg }: { cfg: Record<string, unknown> }) {
  const [pendente, start] = useTransition();
  const [msg, setMsg] = useState("");

  const preco = (cfg.preco ?? {}) as { cents?: number; label?: string };
  const checkout = (cfg.checkout_url ?? {}) as { url?: string };
  const avisos = (cfg.avisos ?? {}) as { banner?: string; ativo?: boolean };

  const [d, setD] = useState({
    label: preco.label ?? "R$ 19,90",
    cents: preco.cents ?? 1990,
    url: checkout.url ?? "",
    banner: avisos.banner ?? "",
    bannerAtivo: avisos.ativo ?? false,
  });

  function salvar() {
    setMsg("");
    start(async () => {
      const r1 = await salvarConfig("preco", { cents: Number(d.cents), label: d.label, periodo: "mês" });
      const r2 = await salvarConfig("checkout_url", { url: d.url.trim() });
      const r3 = await salvarConfig("avisos", { banner: d.banner.trim(), ativo: d.bannerAtivo });
      const erro = [r1, r2, r3].find((r) => !r.ok);
      setMsg(erro ? ("erro" in erro ? String(erro.erro) : "falhou") : "Ajustes salvos.");
    });
  }

  return (
    <div className="card p-4 space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <Rotulo>Preço exibido</Rotulo>
          <input className="field" value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })} />
        </label>
        <label className="block">
          <Rotulo>Valor em centavos</Rotulo>
          <input className="field" type="number" value={d.cents}
                 onChange={(e) => setD({ ...d, cents: Number(e.target.value) })} />
        </label>
      </div>

      <label className="block">
        <Rotulo>Link de checkout da Kiwify</Rotulo>
        <input className="field" value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })}
               placeholder="https://pay.kiwify.com.br/..." />
        <span className="block text-[11.5px] mt-1.5" style={{ color: "var(--ink-3)" }}>
          É o botão da página de assinatura. Enquanto vazio, o botão fica desativado.
        </span>
      </label>

      <label className="block">
        <Rotulo>Aviso no topo da jornada</Rotulo>
        <textarea className="field resize-y" rows={2} value={d.banner}
                  onChange={(e) => setD({ ...d, banner: e.target.value })}
                  placeholder="Ex.: encontro ao vivo na quinta, 20h." />
      </label>

      <label className="flex items-center gap-2.5 text-[13.5px]" style={{ color: "var(--ink-2)" }}>
        <input type="checkbox" checked={d.bannerAtivo}
               onChange={(e) => setD({ ...d, bannerAtivo: e.target.checked })} />
        Exibir aviso
      </label>

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={salvar} disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar ajustes"}
        </button>
        {msg && <span className="text-[12.5px]" style={{ color: "var(--pos)" }}>{msg}</span>}
      </div>
    </div>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-semibold uppercase tracking-[.08em] mb-1.5"
          style={{ color: "var(--ink-3)" }}>{children}</span>
  );
}
