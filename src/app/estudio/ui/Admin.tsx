"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { custoKit, formatarUS, type ConfigModelos, type Opcao } from "@/estudio/modelos";
import { marca } from "@/estudio/slides";
import Cursor from "./Cursor";
import Titulo from "./Titulo";

type Preco = { nome: string; entrada: number; saida: number; contexto: number } | null;
type Recente = { id: string; estado: string; dia?: number; modelo?: string; uso?: { entrada: number; saida: number; custo?: number }; erro?: string; criado: number; segundos: number };
type Dados = {
  config: ConfigModelos | null; salva: boolean; viaVariavel: boolean; cadeia: string[];
  catalogo: Opcao[]; gratuitos: string[]; precos: Record<string, Preco>; catalogoVivo: boolean;
  estado: { openrouter: boolean; anthropic: boolean; armazem: boolean; notificacoes: boolean; saldo: { total: number; usado: number } | null };
  recentes: Recente[];
};

const curto = (m?: string) => String(m || "").replace(/^(openrouter|anthropic):/, "").replace(/:free$/, " (grátis)");

/* Página de admin do estúdio: qual modelo escreve, quanto custa, e se está tudo ligado. */
export default function Admin() {
  const [d, setD] = useState<Dados | null>(null);
  const [principal, setPrincipal] = useState("");
  const [outro, setOutro] = useState("");
  const [gratis, setGratis] = useState(true);
  const [claude, setClaude] = useState(true);
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const r = await fetch("/api/estudio/admin", { cache: "no-store" });
    if (!r.ok) { setMsg("Não consegui ler o estado agora."); return; }
    const j = (await r.json()) as Dados;
    setD(j);
    const c = j.config;
    if (c) {
      const doCatalogo = j.catalogo.some((o) => o.id === c.principal) || !c.principal;
      setPrincipal(doCatalogo ? c.principal : "outro");
      setOutro(doCatalogo ? "" : c.principal);
      setGratis(c.gratuitosDeReserva); setClaude(c.claudeDeReserva);
    }
  };
  useEffect(() => { void carregar(); }, []);

  async function salvar() {
    setSalvando(true); setMsg("");
    const id = principal === "outro" ? outro.trim() : principal;
    const r = await fetch("/api/estudio/admin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ principal: id, gratuitosDeReserva: gratis, claudeDeReserva: claude }),
    });
    const j = await r.json().catch(() => ({}));
    setSalvando(false);
    if (!r.ok || !j.ok) { setMsg(j.erro || "Não consegui salvar."); return; }
    setMsg("Salvo. A próxima geração já usa esta escolha.");
    void carregar();
  }

  const preco = (id: string, ref?: Opcao) => {
    const p = d?.precos[id];
    const e = p ? p.entrada : ref?.entrada, s = p ? p.saida : ref?.saida;
    if (e == null || s == null) return null;
    return { e, s, kit: custoKit(e, s), vivo: !!p };
  };
  const idOutro = outro.trim();
  const outroVivo = idOutro && d?.precos[idOutro];

  return (
    <div className="est">
      <header className="barra">
        <Link className="marca" data-emo="estúdio" href="/estudio">
          <span dangerouslySetInnerHTML={{ __html: marca(22) }} />
          <span className="rot">Modo Singular · Estúdio</span>
        </Link>
        <div className="dir"><Link className="lnk" data-emo="voltar" href="/estudio">voltar ao estúdio</Link></div>
      </header>

      <main className="adm">
        <Titulo partes={[{ t: "Quem " }, { t: "escreve", it: true }, { t: " o seu dia" }]} />
        <p className="adm-sub">O modelo principal tenta primeiro; se falhar (sem crédito, fora do ar, limite), passa a vez às reservas, nesta ordem.</p>

        {!d ? <p className="adm-sub">carregando…</p> : (
          <>
            <section className="adm-sec">
              <p className="rot">Modelo principal</p>
              <div className="opcoes">
                {d.catalogo.map((o) => {
                  const p = preco(o.id, o);
                  return (
                    <label key={o.id} className={`op ${principal === o.id ? "on" : ""}`} data-emo="escolher">
                      <input type="radio" name="principal" checked={principal === o.id} onChange={() => setPrincipal(o.id)} />
                      <span className="nome">{o.nome}{o.recomendado && <em className="rec">recomendado</em>}</span>
                      <span className="porque">{o.porque}</span>
                      <span className="custo">
                        {p ? <>≈ {formatarUS(p.kit)} por dia · {formatarUS(p.kit * 30)} por mês · entrada US$ {p.e.toFixed(2)} e saída US$ {p.s.toFixed(2)} por milhão{p.vivo ? "" : " (preço de referência)"}</> : null}
                        {d.catalogoVivo && !d.precos[o.id] && <b> · não encontrei este ID no OpenRouter agora</b>}
                      </span>
                    </label>
                  );
                })}
                <label className={`op ${principal === "" ? "on" : ""}`} data-emo="escolher">
                  <input type="radio" name="principal" checked={principal === ""} onChange={() => setPrincipal("")} />
                  <span className="nome">Só os gratuitos</span>
                  <span className="porque">Sem custo. Mais lentos e menos fiéis ao manual; limite de 50 pedidos por dia no OpenRouter (1.000 depois de US$ 10 em créditos).</span>
                </label>
                <label className={`op ${principal === "outro" ? "on" : ""}`} data-emo="escolher">
                  <input type="radio" name="principal" checked={principal === "outro"} onChange={() => setPrincipal("outro")} />
                  <span className="nome">Outro modelo do OpenRouter</span>
                  <input className="campo" value={outro} placeholder="empresa/modelo, como openai/gpt-6-sol" aria-label="ID do modelo"
                    onFocus={() => setPrincipal("outro")} onChange={(e) => setOutro(e.target.value)} />
                  {idOutro && d.catalogoVivo && (
                    <span className="custo">
                      {outroVivo ? <>{outroVivo.nome} · ≈ {formatarUS(custoKit(outroVivo.entrada, outroVivo.saida))} por dia</> : <b>não encontrei este ID no OpenRouter</b>}
                    </span>
                  )}
                </label>
              </div>
            </section>

            <section className="adm-sec">
              <p className="rot">Reservas</p>
              <label className="chave" data-emo="ligar">
                <input type="checkbox" checked={gratis} onChange={(e) => setGratis(e.target.checked)} />
                <span>Os gratuitos do OpenRouter, se o principal falhar</span>
              </label>
              <label className="chave" data-emo="ligar">
                <input type="checkbox" checked={claude} onChange={(e) => setClaude(e.target.checked)} />
                <span>O Claude direto, por último{d.estado.anthropic ? "" : " (falta ANTHROPIC_API_KEY na Vercel)"}</span>
              </label>
              <div className="adm-acoes">
                <button className="bt" data-emo="salvar" onClick={salvar} disabled={salvando || !d.estado.armazem}>{salvando ? "salvando…" : "salvar escolha"}</button>
                {msg && <span className="adm-msg">{msg}</span>}
              </div>
              <p className="adm-nota">
                Ordem agora: {d.cadeia.length ? d.cadeia.map(curto).join(" → ") : "nenhum modelo disponível"}.
                {d.viaVariavel && " (vinda de ESTUDIO_MODELOS; salvar aqui passa a valer no lugar dela)"}
              </p>
            </section>

            <section className="adm-sec">
              <p className="rot">Estado</p>
              <ul className="estado">
                <li className={d.estado.openrouter ? "ok" : ""}>Chave do OpenRouter {d.estado.openrouter ? "configurada" : "ausente (OPENROUTER_API_KEY)"}</li>
                {d.estado.saldo && <li className="ok">Saldo no OpenRouter: {formatarUS(Math.max(0, d.estado.saldo.total - d.estado.saldo.usado))} de {formatarUS(d.estado.saldo.total)} comprados</li>}
                <li className={d.estado.armazem ? "ok" : ""}>Geração que continua com a tela bloqueada {d.estado.armazem ? "ligada" : "desligada (falta SUPABASE_SERVICE_ROLE_KEY)"}</li>
                <li className={d.estado.notificacoes ? "ok" : ""}>Notificações {d.estado.notificacoes ? "prontas" : "indisponíveis"}</li>
              </ul>
            </section>

            {d.recentes.length > 0 && (
              <section className="adm-sec">
                <p className="rot">Últimas gerações</p>
                <div className="recentes">
                  {d.recentes.map((t) => (
                    <div key={t.id} className={`rec-l ${t.estado}`}>
                      <span className="n">{t.dia ? String(t.dia).padStart(2, "0") : "—"}</span>
                      <span>{curto(t.modelo) || (t.estado === "erro" ? "não terminou" : "em andamento")}</span>
                      <span>{t.segundos} s</span>
                      <span>{t.uso?.custo != null ? formatarUS(t.uso.custo) : t.uso ? `${Math.round((t.uso.entrada + t.uso.saida) / 1000)} mil tokens` : ""}</span>
                      <span className="q">{new Date(t.criado).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Cursor />
    </div>
  );
}
