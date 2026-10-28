"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ETAPAS } from "@/estudio/lint";
import { css, marca, RA, reelsHTML, RL, type Contexto, type Dados } from "@/estudio/slides";
import { inscricao, podeAvisar, querAvisos, registrarSW, selo } from "./aparelho";
import Cursor from "./Cursor";
import Glifos from "./Glifos";
import Lupa from "./Lupa";
import { baixarReels, baixarSlide, baixarTexto } from "./png";
import Quadro from "./Quadro";
import Teleprompter from "./Teleprompter";
import Titulo from "./Titulo";

export type Pauta = { dia: number; cap: number; tipo: string; titulo: string; template: boolean; capTitulo: string };
export type Publico = { marca: Dados; pautas: Pauta[]; kits: Record<string, Dados> };
type Verificacao = { erros: string[]; avisos: string[]; palavras: number; segundos: number };

const GUARDA = "estudio-kits-v1";
const FRASES = [
  "lendo o capítulo devagar",
  "procurando o detalhe que só o livro tem",
  "escrevendo o gancho",
  "abrindo a primeira curiosidade",
  "desenhando a figura para o celular",
  "mostrando como ficaria na prática",
  "conferindo a voz, palavra por palavra",
  "deixando só o cerne",
];
const FICHA: [string, string][] = [["ideia", "A ideia"], ["conceito", "O conceito"], ["cena", "A cena"], ["detalhe", "O detalhe"], ["figura", "A figura"], ["virada", "A virada"], ["aplicacao", "A aplicação"], ["exercicio", "O exercício"]];
const NIVEIS: Record<string, string> = { pratica: "prática", conversa: "conversa", convite: "convite" };
const dois = (n: number) => String(n).padStart(2, "0");

function lerGuardados(): Record<string, Dados> {
  try { return JSON.parse(localStorage.getItem(GUARDA) || "{}"); } catch { return {}; }
}

type Aviso = "" | "pedindo" | "ligado" | "negado" | "falhou";
type Indice = Record<string, { tema: string; salvo: string; origem: string; modelo?: string }>;
const PENDENTE = "estudio-tarefa";

function guardarLocal(k: Dados): Record<string, Dados> {
  const novo = { ...lerGuardados(), [String(k.dia)]: k };
  try { localStorage.setItem(GUARDA, JSON.stringify(novo)); } catch { /* sem espaço: segue só na tela e no servidor */ }
  return novo;
}

export default function Estudio({ publico, pedidoInicial = "", tarefaInicial = "", gerarAoAbrir = false }: {
  publico: Publico; pedidoInicial?: string; tarefaInicial?: string; gerarAoAbrir?: boolean;
}) {
  const router = useRouter();
  const [modo, setModo] = useState<"inicio" | "esperando" | "kit">("inicio");
  const [kit, setKit] = useState<Dados | null>(null);
  const [verif, setVerif] = useState<Verificacao | null>(null);
  const [locais, setLocais] = useState<Record<string, Dados>>({});
  const [indice, setIndice] = useState<Indice>({});
  const [servidor, setServidor] = useState(false);
  const [pedido, setPedido] = useState(pedidoInicial);
  const [fase, setFase] = useState("");
  const [caracteres, setCaracteres] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState<Aviso>("");
  const [salvo, setSalvo] = useState<"" | "salvando" | "salvo" | "local">("");
  const corte = useRef<AbortController | null>(null);
  const tarefa = useRef<string>("");
  const resolvido = useRef(true);
  const vigia = useRef<ReturnType<typeof setTimeout> | null>(null);
  const envio = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todos = useMemo(() => {
    const t: Record<string, Dados> = { ...publico.kits, ...locais };
    for (const [d, x] of Object.entries(indice)) if (!t[d]) t[d] = { dia: Number(d), tema: x.tema, _servidor: true };
    return t;
  }, [publico.kits, locais, indice]);
  const proxima = publico.pautas.find((p) => p.template && !todos[String(p.dia)]);
  const ctx: Contexto = { handle: publico.marca.handle, assinatura: publico.marca.oferta?.nome || "Modo Singular", fontBase: "/estudio/fontes" };

  const abrir = useCallback((k: Dados, v: Verificacao | null = null) => {
    setKit(k); setVerif(v); setModo("kit"); setErro("");
    document.querySelector(".est")?.scrollTo({ top: 0 });
  }, []);

  const parar = () => {
    resolvido.current = true;
    if (vigia.current) clearTimeout(vigia.current);
    try { localStorage.removeItem(PENDENTE); } catch { /* nada */ }
  };

  const receber = useCallback((k: Dados, v: Verificacao | null) => {
    if (resolvido.current && tarefa.current) return; // já chegou pelo outro caminho
    parar();
    setLocais(guardarLocal(k));
    setIndice((ix) => ({ ...ix, [String(k.dia)]: { tema: String(k.tema || ""), salvo: new Date().toISOString(), origem: "gerado", modelo: k.modelo } }));
    if (document.hidden) selo(1);
    abrir(k, v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrir]);

  const falhar = (m: string) => { parar(); setErro(m); setModo("inicio"); };

  /** Consulta o servidor até a geração terminar (quando a conexão ao vivo caiu ou a tela voltou do bloqueio). */
  const acompanhar = useCallback((id: string, desde: number) => {
    tarefa.current = id; resolvido.current = false;
    setModo("esperando"); setInicio(desde);
    const consultar = async () => {
      if (resolvido.current) return;
      if (document.visibilityState === "visible") {
        try {
          const r = await fetch(`/api/estudio/tarefa?id=${id}`, { cache: "no-store" });
          if (r.status === 401) { router.refresh(); return; }
          if (r.status === 404) { falhar("Não encontrei essa geração no servidor."); return; }
          const j = await r.json();
          if (resolvido.current) return;
          if (j.tarefa?.fase) setFase(j.tarefa.fase);
          if (j.tarefa?.caracteres) setCaracteres(j.tarefa.caracteres);
          if (j.tarefa?.estado === "pronto" && j.kit) { resolvido.current = false; tarefa.current = ""; receber(j.kit, j.verificacao); return; }
          if (j.tarefa?.estado === "erro") { falhar(j.tarefa.erro || "A geração não terminou."); return; }
        } catch { /* sem rede agora: tenta de novo */ }
      }
      if (Date.now() - desde > 7 * 60_000) { falhar("A geração passou do tempo. Tente de novo."); return; }
      vigia.current = setTimeout(consultar, 3500);
    };
    if (vigia.current) clearTimeout(vigia.current);
    void consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receber, router]);

  async function gerar(texto: string) {
    setErro(""); setFase(""); setCaracteres(0); setInicio(Date.now()); setModo("esperando");
    setAviso(querAvisos() ? "ligado" : "");
    tarefa.current = ""; resolvido.current = false;
    const ac = new AbortController(); corte.current = ac;
    let id = "", noServidor = false;
    try {
      const push = querAvisos() ? await inscricao(false).catch(() => null) : null;
      const r = await fetch("/api/estudio/gerar", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ac.signal,
        body: JSON.stringify({ pedido: texto, feitos: Object.keys(todos).map(Number), push }),
      });
      if (r.status === 401) { router.refresh(); return; }
      if (!r.ok || !r.body) { const j = await r.json().catch(() => ({})); throw new Error(j.erro || "Não consegui gerar agora."); }
      const leitor = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await leitor.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const bloco = buf.slice(0, i); buf = buf.slice(i + 2);
          const ev = /^event: (.*)$/m.exec(bloco)?.[1];
          const dado = /^data: (.*)$/m.exec(bloco)?.[1];
          if (!ev || !dado) continue;
          const d = JSON.parse(dado);
          if (resolvido.current) continue;
          if (ev === "tarefa") {
            id = d.id; noServidor = d.servidor; tarefa.current = id;
            if (noServidor) try { localStorage.setItem(PENDENTE, JSON.stringify({ id, inicio: Date.now() })); } catch { /* nada */ }
          } else if (ev === "fase") setFase(d.texto);
          else if (ev === "progresso") setCaracteres(d.caracteres);
          else if (ev === "erro") { falhar(d.mensagem); return; }
          else if (ev === "kit") { tarefa.current = ""; receber(d.kit, d.verificacao); return; }
        }
      }
      if (resolvido.current) return;
      if (id && noServidor) { acompanhar(id, Date.now() - 1000); return; } // a conexão caiu, a geração não
      throw new Error("A conexão caiu antes do fim. Tente de novo.");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      if (resolvido.current) return;
      if (id && noServidor) { acompanhar(id, Date.now() - 1000); return; }
      falhar((e as Error).message);
    }
  }

  // volta do bloqueio ou de outro app: confere no servidor na hora
  useEffect(() => {
    const voltou = () => {
      if (document.visibilityState !== "visible") return;
      selo(0);
      if (!resolvido.current && tarefa.current) {
        let desde = Date.now();
        try { desde = JSON.parse(localStorage.getItem(PENDENTE) || "{}").inicio || desde; } catch { /* nada */ }
        acompanhar(tarefa.current, desde);
      }
    };
    document.addEventListener("visibilitychange", voltou);
    return () => document.removeEventListener("visibilitychange", voltou);
  }, [acompanhar]);

  useEffect(() => {
    setLocais(lerGuardados());
    void registrarSW();
    fetch("/api/estudio/kits", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (j) { setServidor(!!j.servidor); setIndice(j.indice || {}); }
    }).catch(() => {});
    // aberto pela notificação, por uma geração que ficou pela metade, ou pelo atalho do app
    let pendente: { id?: string; inicio?: number } = {};
    try { pendente = JSON.parse(localStorage.getItem(PENDENTE) || "{}"); } catch { /* nada */ }
    if (tarefaInicial) acompanhar(tarefaInicial, pendente.id === tarefaInicial ? pendente.inicio || Date.now() : Date.now());
    else if (pendente.id && Date.now() - (pendente.inicio || 0) < 7 * 60_000) acompanhar(pendente.id, pendente.inicio || Date.now());
    else if (gerarAoAbrir) void gerar("");
    if (tarefaInicial || pedidoInicial || gerarAoAbrir) history.replaceState(null, "", "/estudio");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrirDia(k: Dados) {
    const d = String(k.dia);
    if (indice[d]) {
      try {
        const r = await fetch(`/api/estudio/kits?dia=${d}`, { cache: "no-store" });
        if (r.ok) { const j = await r.json(); return abrir(j.kit, j.verificacao); }
      } catch { /* sem rede: usa a cópia local */ }
    }
    if (!k._servidor) abrir(k);
    else setErro("Não consegui abrir este dia agora.");
  }

  /** Uma edição no carrossel: aparece na hora, fica no aparelho e vai para o servidor logo depois. */
  const atualizarKit = useCallback((k: Dados) => {
    setKit(k);
    setLocais(guardarLocal(k));
    if (envio.current) clearTimeout(envio.current);
    if (!servidor) { setSalvo("local"); return; }
    setSalvo("salvando");
    envio.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/estudio/kits", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kit: k }) });
        setSalvo(r.ok ? "salvo" : "local");
        if (r.ok) setIndice((ix) => ({ ...ix, [String(k.dia)]: { tema: String(k.tema || ""), salvo: new Date().toISOString(), origem: "editado" } }));
      } catch { setSalvo("local"); }
    }, 1200);
  }, [servidor]);

  async function ligarAvisos() {
    setAviso("pedindo");
    const sub = await inscricao(true).catch(() => null);
    if (!sub) { setAviso(typeof Notification !== "undefined" && Notification.permission === "denied" ? "negado" : "falhou"); return; }
    setAviso("ligado");
    if (tarefa.current) {
      await fetch("/api/estudio/tarefa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: tarefa.current, push: sub }) }).catch(() => {});
    }
  }

  function pedir(e?: React.FormEvent) {
    e?.preventDefault();
    const t = pedido.trim();
    const n = t.match(/^(?:dia\s*)?(\d{1,2})$/i);
    if (n && todos[String(Number(n[1]))]) return void abrirDia(todos[String(Number(n[1]))]);
    void gerar(t);
  }

  async function sair() {
    await fetch("/api/estudio/sair", { method: "POST" });
    router.refresh();
  }

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const prontos = Object.values(todos).sort((a, b) => a.dia - b.dia);

  return (
    <div className="est">
      <style dangerouslySetInnerHTML={{ __html: css("/estudio/fontes") }} />
      <header className="barra">
        <button className="marca" data-emo="início" onClick={() => setModo("inicio")}>
          <span dangerouslySetInnerHTML={{ __html: marca(22) }} />
          <span className="rot">Modo Singular · Estúdio</span>
        </button>
        <div className="dir">
          <span className="data">{hoje}</span>
          <a className="lnk" data-emo="modelos" href="/estudio/admin">admin</a>
          <button className="lnk" data-emo="sair" onClick={sair}>sair</button>
        </div>
      </header>

      {modo === "inicio" && (
        <main className="palco">
          <Titulo partes={[{ t: "O que vamos " }, { t: "publicar", it: true }, { t: " hoje?" }]} />
          <form className="pedido" onSubmit={pedir}>
            <input value={pedido} onChange={(e) => setPedido(e.target.value)} autoFocus aria-label="Pedido"
              placeholder="o dia 3, um tema, ou só enter" />
            <button className="ir" type="submit" data-emo="pedir">pedir ↵</button>
          </form>
          {proxima && (
            <p className="ou">ou simplesmente{" "}
              <button data-emo="pedir" onClick={() => gerar("")}>
                o próximo: Dia {dois(proxima.dia)}, {proxima.titulo.toLowerCase()}
              </button>
            </p>
          )}
          {erro && <p className="aviso" role="alert">{erro}</p>}
          {prontos.length > 0 && (
            <section className="prontos">
              <p className="rot">Dias prontos</p>
              <div className="lista">
                {prontos.map((k) => (
                  <button key={k.dia} data-emo="abrir" onClick={() => abrirDia(k)}>
                    <span className="n">{dois(k.dia)}</span>
                    <span className="t">{k.tema}{indice[String(k.dia)]?.origem === "editado" && <span className="local">editado</span>}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {modo === "esperando" && (
        <Espera fase={fase} caracteres={caracteres} inicio={inicio} servidor={servidor} aviso={aviso} ligarAvisos={ligarAvisos}
          cancelar={() => { corte.current?.abort(); parar(); tarefa.current = ""; setModo("inicio"); }} />
      )}

      {modo === "kit" && kit && (
        <Kit kit={kit} verif={verif} ctx={{ ...ctx, rotuloDia: `Dia ${dois(kit.dia)}` }} salvo={salvo} mudar={atualizarKit}
          voltar={() => setModo("inicio")} outra={() => gerar(`dia ${kit.dia}`)} />
      )}
      <Cursor />
    </div>
  );
}

// ------------------------------------------------------------------ espera
function Espera({ fase, caracteres, inicio, servidor, aviso, ligarAvisos, cancelar }: {
  fase: string; caracteres: number; inicio: number; servidor: boolean;
  aviso: Aviso; ligarAvisos: () => void; cancelar: () => void;
}) {
  const [i, setI] = useState(0);
  const [agora, setAgora] = useState(Date.now());
  const [pode, setPode] = useState(false);
  useEffect(() => {
    setPode(podeAvisar());
    const a = setInterval(() => setI((x) => x + 1), 3800);
    const b = setInterval(() => setAgora(Date.now()), 500);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  const s = Math.max(0, Math.round((agora - inicio) / 1000));
  const pct = Math.min(0.94, 0.08 + 0.55 * (1 - Math.exp(-s / 70)) + 0.31 * (1 - Math.exp(-caracteres / 3500)));
  return (
    <div className="espera" aria-live="polite">
      <Glifos />
      <div className="meio">
        <p className="dia">{fase || "escolhendo a pauta"}</p>
        <p className="frase">
          {FRASES.map((f, k) => <span key={k} className={k === i % FRASES.length ? "" : "fora"}>{f}…</span>)}
        </p>
        <div className="fio"><i style={{ width: `${pct * 100}%` }} /></div>
        <p className="tempo">{s} s</p>
        {servidor && (
          <p className="solto">
            Pode bloquear a tela ou trocar de app: o estúdio continua escrevendo e mostra tudo quando você voltar.
            {pode && (aviso === "" || aviso === "pedindo") && (
              <> <button className="sino" data-emo="avisar" onClick={ligarAvisos} disabled={aviso === "pedindo"}>{aviso === "pedindo" ? "pedindo permissão…" : "Avise-me quando terminar"}</button></>
            )}
            {aviso === "ligado" && <> <em>Vou avisar neste aparelho.</em></>}
            {aviso === "negado" && <> <em>Sem permissão para notificar; o resultado fica guardado do mesmo jeito.</em></>}
            {aviso === "falhou" && <> <em>Este navegador não aceitou as notificações{/iPhone|iPad/.test(navigator.userAgent) ? " (no iPhone, só com o estúdio instalado na tela de início)" : ""}; o resultado fica guardado do mesmo jeito.</em></>}
          </p>
        )}
        <button className="lnk cancela" data-emo="voltar" onClick={cancelar}>{servidor ? "voltar ao início" : "cancelar"}</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ kit
function Kit({ kit, verif, ctx, salvo, mudar, voltar, outra }: {
  kit: Dados; verif: Verificacao | null; ctx: Contexto; salvo: "" | "salvando" | "salvo" | "local";
  mudar: (k: Dados) => void; voltar: () => void; outra: () => void;
}) {
  const slides: Dados[] = kit.carrossel || [];
  const figs = slides.map((s, i) => ({ s, i })).filter((x) => x.s.tipo === "figura");
  const [aba, setAba] = useState<"etapas" | "gravar">("gravar");
  const [lupa, setLupa] = useState<number | null>(null);
  const [tele, setTele] = useState(false);
  const [feito, setFeito] = useState("");
  const [larg, setLarg] = useState(300);
  const [figLarg, setFigLarg] = useState(430);
  const [tom, setTom] = useState<"claro" | "escuro">("claro");
  const r = kit.roteiro || {};
  const corrido = ETAPAS.map(([e]) => String(r[e] || "").trim()).filter(Boolean);
  const nome = `dia-${dois(kit.dia)}`;

  useEffect(() => {
    const medir = () => {
      setLarg(innerWidth < 720 ? Math.min(280, innerWidth - 80) : 300);
      setFigLarg(innerWidth < 720 ? innerWidth - 48 : 430);
    };
    medir(); addEventListener("resize", medir);
    return () => removeEventListener("resize", medir);
  }, []);

  const marcar = (t: string) => { setFeito(t); setTimeout(() => setFeito(""), 1800); };
  const copiar = async (t: string, qual: string) => { await navigator.clipboard.writeText(t); marcar(qual); };
  const baixarTodos = async () => {
    for (let i = 0; i < slides.length; i++) {
      await baixarSlide(slides[i], i + 1, slides.length, ctx, `${nome}-slide-${dois(i + 1)}.png`);
      await new Promise((res) => setTimeout(res, 350));
    }
  };
  const mudarSlide = (i: number, s: Dados) => mudar({ ...kit, carrossel: slides.map((x, n) => (n === i ? s : x)) });
  const editados = slides.filter((x) => x.ajustes && Object.keys(x.ajustes).length).length;

  return (
    <main className="kit">
      <div className="kit-cab">
        <div>
          <div className="num">Dia {dois(kit.dia)}</div>
          <h2 dangerouslySetInnerHTML={{ __html: String(kit.tema || "").replace(/</g, "&lt;") }} />
          <p className="meta">
            capítulo {kit.fonte?.cap} · {kit.fonte?.figura} · Reels de {kit.duracao} s · CTA de {NIVEIS[kit.cta_nivel] || kit.cta_nivel}
            {kit.gerado_em ? ` · escrito${kit.modelo ? ` por ${String(kit.modelo).replace(/^(openrouter|anthropic):/, "").replace(/:free$/, "")}` : ""}` : ""}
          </p>
          {verif && verif.erros.length > 0 && (
            <p className="nota-ver">O verificador ainda aponta: {verif.erros.slice(0, 3).join("; ")}{verif.erros.length > 3 ? "…" : ""}</p>
          )}
        </div>
        <div className="acoes">
          <button className="bt" data-emo="voltar" onClick={voltar}>← voltar</button>
          <button className="bt" data-emo="refazer" onClick={outra}>outra versão</button>
          <button className="bt" data-emo="baixar" onClick={() => baixarTexto(JSON.stringify(kit, null, 2), `${nome}-kit.json`)}>kit (.json)</button>
        </div>
      </div>

      <section className="secao">
        <div className="cab">
          <h3>O carrossel</h3>
          <div className="acoes">
            <span className="rot salvo">{salvo === "salvando" ? "salvando…" : salvo === "salvo" ? "edição salva" : salvo === "local" ? "edição salva neste aparelho" : editados ? `${editados} slide${editados > 1 ? "s" : ""} editado${editados > 1 ? "s" : ""}` : "clique para ampliar e editar"}</span>
            <button className="bt" data-emo="baixar" onClick={baixarTodos}>baixar os {slides.length} slides</button>
          </div>
        </div>
        <div className="fita">
          {slides.map((s, i) => (
            <Quadro key={i} s={s} i={i + 1} total={slides.length} ctx={ctx} largura={larg} emo="ampliar" onClick={() => setLupa(i)} />
          ))}
        </div>
      </section>

      {figs.length > 0 && (
        <section className="secao">
          <div className="cab"><h3>A figura, separada</h3><span className="rot">para o carrossel e para gravar o Reels</span></div>
          <div className="figs">
            {figs.map(({ s, i }) => (
              <div className="item" key={i}>
                <div className="par">
                  <Quadro s={{ ...s, solo: true }} i={i + 1} total={slides.length} ctx={ctx} largura={figLarg} emo="baixar"
                    onClick={() => baixarSlide({ ...s, solo: true }, i + 1, slides.length, ctx, `${nome}-figura-${dois(i + 1)}.png`)} />
                  <Selfie s={s} ctx={ctx} largura={Math.round(figLarg * 0.42)} tom={tom}
                    onClick={() => baixarReels(s, ctx, tom, `${nome}-figura-${dois(i + 1)}-reels-${tom}.png`)} />
                </div>
                <span className="rot">
                  {s.figura?.tipo} · a figura: PNG · o celular: Reels 9:16, transparente ·{" "}
                  <button className="tom" data-emo="cartão" onClick={() => setTom(tom === "claro" ? "escuro" : "claro")}>cartão {tom}</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="secao">
        <div className="cab">
          <h3>O roteiro</h3>
          <div className="acoes">
            <div className="abas">
              <button className={aba === "gravar" ? "on" : ""} data-emo="ler" onClick={() => setAba("gravar")}>para gravar</button>
              <button className={aba === "etapas" ? "on" : ""} data-emo="ler" onClick={() => setAba("etapas")}>por etapa</button>
            </div>
            <button className={`bt ${feito === "roteiro" ? "feito" : ""}`} data-emo="copiar" onClick={() => copiar(corrido.join("\n\n"), "roteiro")}>
              {feito === "roteiro" ? "copiado" : "copiar"}
            </button>
            <button className="bt" data-emo="gravar" onClick={() => setTele(true)}>teleprompter</button>
          </div>
        </div>
        {aba === "gravar" ? (
          <div className="corrido">{corrido.map((p, i) => <p key={i}>{p}</p>)}</div>
        ) : (
          <div className="roteiro">
            {ETAPAS.map(([e, nomeEtapa]) => (
              <div className="etapa" key={e}><span className="rot">{nomeEtapa}</span><p>{r[e]}</p></div>
            ))}
          </div>
        )}
      </section>

      <section className="secao">
        <div className="cab">
          <h3>A legenda</h3>
          <div className="acoes">
            <button className={`bt ${feito === "legenda" ? "feito" : ""}`} data-emo="copiar" onClick={() => copiar(kit.legenda || "", "legenda")}>
              {feito === "legenda" ? "copiada" : "copiar"}
            </button>
          </div>
        </div>
        <div className="legenda">{kit.legenda}</div>
      </section>

      {kit.ficha && (
        <section className="secao">
          <div className="cab"><h3>A ficha do dia</h3><span className="rot">as decisões de onde tudo saiu</span></div>
          <div className="roteiro">
            {FICHA.map(([c, nomeCampo]) => kit.ficha[c] ? (
              <div className="etapa" key={c}><span className="rot">{nomeCampo}</span><p style={{ fontSize: 19, color: "var(--t2)" }}>{kit.ficha[c]}</p></div>
            ) : null)}
          </div>
        </section>
      )}

      {lupa !== null && (
        <Lupa slides={slides} indice={lupa} ctx={ctx} ir={setLupa} fechar={() => setLupa(null)} mudar={mudarSlide}
          baixar={(i) => baixarSlide(slides[i], i + 1, slides.length, ctx, `${nome}-slide-${dois(i + 1)}.png`)} />
      )}
      {tele && <Teleprompter paragrafos={corrido} fechar={() => setTele(false)} />}
    </main>
  );
}

// ------------------------------------------------------------------ figura para o Reels
/* A prévia de como a figura fica no Reels gravado em modo selfie: o cartão no alto,
   a cabeça de quem grava logo abaixo (só um contorno, para dar a escala). */
function Selfie({ s, ctx, largura, tom, onClick }: { s: Dados; ctx: Contexto; largura: number; tom: "claro" | "escuro"; onClick: () => void }) {
  const esc = largura / RL;
  return (
    <div className="selfie" style={{ width: largura, height: largura * (RA / RL) }} data-emo="baixar" onClick={onClick} role="button">
      <span className="pessoa" aria-hidden />
      <div className="esc" style={{ width: RL, height: RA, transform: `scale(${esc})` }} dangerouslySetInnerHTML={{ __html: reelsHTML(s, ctx, tom) }} />
    </div>
  );
}
