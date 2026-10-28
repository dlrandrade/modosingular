"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ETAPAS } from "@/estudio/lint";
import { css, marca, type Contexto, type Dados } from "@/estudio/slides";
import Cursor from "./Cursor";
import Glifos from "./Glifos";
import { baixarSlide, baixarTexto } from "./png";
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

export default function Estudio({ publico }: { publico: Publico }) {
  const router = useRouter();
  const [modo, setModo] = useState<"inicio" | "esperando" | "kit">("inicio");
  const [kit, setKit] = useState<Dados | null>(null);
  const [verif, setVerif] = useState<Verificacao | null>(null);
  const [locais, setLocais] = useState<Record<string, Dados>>({});
  const [pedido, setPedido] = useState("");
  const [fase, setFase] = useState("");
  const [caracteres, setCaracteres] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [erro, setErro] = useState("");
  const corte = useRef<AbortController | null>(null);

  useEffect(() => { setLocais(lerGuardados()); }, []);

  const todos = useMemo(() => ({ ...publico.kits, ...locais }), [publico.kits, locais]);
  const proxima = publico.pautas.find((p) => p.template && !todos[String(p.dia)]);
  const ctx: Contexto = { handle: publico.marca.handle, assinatura: publico.marca.oferta?.nome || "Modo Singular", fontBase: "/estudio/fontes" };

  const abrir = useCallback((k: Dados, v: Verificacao | null = null) => {
    setKit(k); setVerif(v); setModo("kit"); setErro("");
    document.querySelector(".est")?.scrollTo({ top: 0 });
  }, []);

  async function gerar(texto: string) {
    setErro(""); setFase(""); setCaracteres(0); setInicio(Date.now()); setModo("esperando");
    const ac = new AbortController(); corte.current = ac;
    try {
      const r = await fetch("/api/estudio/gerar", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ac.signal,
        body: JSON.stringify({ pedido: texto, feitos: Object.keys(todos).map(Number) }),
      });
      if (r.status === 401) { router.refresh(); return; }
      if (!r.ok || !r.body) { const j = await r.json().catch(() => ({})); throw new Error(j.erro || "Não consegui gerar agora."); }
      const leitor = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "", chegou = false;
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
          if (ev === "fase") setFase(d.texto);
          else if (ev === "progresso") setCaracteres(d.caracteres);
          else if (ev === "erro") throw new Error(d.mensagem);
          else if (ev === "kit") {
            chegou = true;
            const novo = { ...lerGuardados(), [String(d.kit.dia)]: d.kit };
            try { localStorage.setItem(GUARDA, JSON.stringify(novo)); } catch { /* sem espaço: segue só na tela */ }
            setLocais(novo);
            abrir(d.kit, d.verificacao);
          }
        }
      }
      if (!chegou) throw new Error("A conexão caiu antes do fim. Tente de novo.");
    } catch (e) {
      if ((e as Error).name === "AbortError") { setModo("inicio"); return; }
      setErro((e as Error).message); setModo("inicio");
    }
  }

  function pedir(e?: React.FormEvent) {
    e?.preventDefault();
    const t = pedido.trim();
    const n = t.match(/^(?:dia\s*)?(\d{1,2})$/i);
    if (n && todos[String(Number(n[1]))]) return abrir(todos[String(Number(n[1]))]);
    gerar(t);
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
                  <button key={k.dia} data-emo="abrir" onClick={() => abrir(k)}>
                    <span className="n">{dois(k.dia)}</span>
                    <span className="t">{k.tema}{locais[String(k.dia)] && <span className="local">gerado aqui</span>}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {modo === "esperando" && (
        <Espera fase={fase} caracteres={caracteres} inicio={inicio} cancelar={() => corte.current?.abort()} />
      )}

      {modo === "kit" && kit && (
        <Kit kit={kit} verif={verif} ctx={{ ...ctx, rotuloDia: `Dia ${dois(kit.dia)}` }}
          voltar={() => setModo("inicio")} outra={() => gerar(`dia ${kit.dia}`)} />
      )}
      <Cursor />
    </div>
  );
}

// ------------------------------------------------------------------ espera
function Espera({ fase, caracteres, inicio, cancelar }: { fase: string; caracteres: number; inicio: number; cancelar: () => void }) {
  const [i, setI] = useState(0);
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
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
        <button className="lnk cancela" data-emo="parar" onClick={cancelar}>cancelar</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ kit
function Kit({ kit, verif, ctx, voltar, outra }: { kit: Dados; verif: Verificacao | null; ctx: Contexto; voltar: () => void; outra: () => void }) {
  const slides: Dados[] = kit.carrossel || [];
  const figs = slides.map((s, i) => ({ s, i })).filter((x) => x.s.tipo === "figura");
  const [aba, setAba] = useState<"etapas" | "gravar">("gravar");
  const [lupa, setLupa] = useState<number | null>(null);
  const [tele, setTele] = useState(false);
  const [feito, setFeito] = useState("");
  const [larg, setLarg] = useState(300);
  const [figLarg, setFigLarg] = useState(430);
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
  useEffect(() => {
    if (lupa === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLupa(null);
      if (e.key === "ArrowRight") setLupa((x) => (x === null ? x : Math.min(slides.length - 1, x + 1)));
      if (e.key === "ArrowLeft") setLupa((x) => (x === null ? x : Math.max(0, x - 1)));
    };
    addEventListener("keydown", tecla);
    return () => removeEventListener("keydown", tecla);
  }, [lupa, slides.length]);

  const marcar = (t: string) => { setFeito(t); setTimeout(() => setFeito(""), 1800); };
  const copiar = async (t: string, qual: string) => { await navigator.clipboard.writeText(t); marcar(qual); };
  const baixarTodos = async () => {
    for (let i = 0; i < slides.length; i++) {
      await baixarSlide(slides[i], i + 1, slides.length, ctx, `${nome}-slide-${dois(i + 1)}.png`);
      await new Promise((res) => setTimeout(res, 350));
    }
  };
  const lupaLarg = typeof window !== "undefined" ? Math.min(innerWidth - 160, (innerHeight - 140) * 0.8, 720) : 600;

  return (
    <main className="kit">
      <div className="kit-cab">
        <div>
          <div className="num">Dia {dois(kit.dia)}</div>
          <h2 dangerouslySetInnerHTML={{ __html: String(kit.tema || "").replace(/</g, "&lt;") }} />
          <p className="meta">
            capítulo {kit.fonte?.cap} · {kit.fonte?.figura} · Reels de {kit.duracao} s · CTA de {NIVEIS[kit.cta_nivel] || kit.cta_nivel}
            {kit.gerado_em ? " · gerado aqui" : ""}
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
          <div className="acoes"><button className="bt" data-emo="baixar" onClick={baixarTodos}>baixar os {slides.length} slides</button></div>
        </div>
        <div className="fita">
          {slides.map((s, i) => (
            <Quadro key={i} s={s} i={i + 1} total={slides.length} ctx={ctx} largura={larg} emo="ampliar" onClick={() => setLupa(i)} />
          ))}
        </div>
      </section>

      {figs.length > 0 && (
        <section className="secao">
          <div className="cab"><h3>A figura, separada</h3></div>
          <div className="figs">
            {figs.map(({ s, i }) => (
              <div className="item" key={i}>
                <Quadro s={{ ...s, solo: true }} i={i + 1} total={slides.length} ctx={ctx} largura={figLarg} emo="baixar"
                  onClick={() => baixarSlide({ ...s, solo: true }, i + 1, slides.length, ctx, `${nome}-figura-${dois(i + 1)}.png`)} />
                <span className="rot">{s.figura?.tipo} · clique para baixar</span>
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
        <div className="lupa" onClick={() => setLupa(null)}>
          <div className="barra-l" onClick={(e) => e.stopPropagation()}>
            <span className="rot">{dois(lupa + 1)} / {dois(slides.length)}</span>
            <span style={{ display: "flex", gap: 28 }}>
              <button className="bt" data-emo="baixar" onClick={() => baixarSlide(slides[lupa], lupa + 1, slides.length, ctx, `${nome}-slide-${dois(lupa + 1)}.png`)}>baixar este</button>
              <button className="bt" data-emo="fechar" onClick={() => setLupa(null)}>fechar</button>
            </span>
          </div>
          {lupa > 0 && <button className="nav e" data-emo="anterior" onClick={(e) => { e.stopPropagation(); setLupa(lupa - 1); }}>←</button>}
          <div onClick={(e) => e.stopPropagation()}>
            <Quadro key={lupa} s={slides[lupa]} i={lupa + 1} total={slides.length} ctx={ctx} largura={lupaLarg} emo="" />
          </div>
          {lupa < slides.length - 1 && <button className="nav d" data-emo="próximo" onClick={(e) => { e.stopPropagation(); setLupa(lupa + 1); }}>→</button>}
        </div>
      )}
      {tele && <Teleprompter paragrafos={corrido} fechar={() => setTele(false)} />}
    </main>
  );
}
