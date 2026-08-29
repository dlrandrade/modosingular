"use client";

import { useState } from "react";
import type { Capitulo } from "@/content/types";
import { ROTEIROS, montarPrompt } from "@/content/roteiros";

type Modo = "ler" | "roteiro" | "prompt";

const MODOS: { id: Modo; rotulo: string; tempo: string }[] = [
  { id: "ler",     rotulo: "Ler e gravar", tempo: "4 min" },
  { id: "roteiro", rotulo: "Roteiro",      tempo: "8 min" },
  { id: "prompt",  rotulo: "Prompt de IA", tempo: "5 min" },
];

/**
 * O convite para publicar, no momento em que a ideia ainda está quente.
 * Nunca bloqueia a conclusão do capítulo: é oferta, não pedágio.
 * O modo sugerido gira a cada capítulo para a rotina não virar fórmula.
 */
export function CrieAgora({ cap }: { cap: Capitulo }) {
  // Cap. 1 abre em 'ler e gravar', o modo de menor atrito para quem começa.
  const sugerido = MODOS[(cap.n - 1) % 3].id;
  const [modo, setModo] = useState<Modo>(sugerido);
  const [copiado, setCopiado] = useState(false);

  const roteiro = ROTEIROS[cap.n] ?? "";
  const prompt = montarPrompt(cap);
  const texto = modo === "ler" ? roteiro : modo === "prompt" ? prompt : "";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      /* navegador sem permissão de área de transferência: o texto está à vista */
    }
  }

  return (
    <section className="rounded-2xl border overflow-hidden"
             style={{ borderColor: "var(--accent)" }}>
      <div className="px-5 pt-5 pb-4" style={{ background: "var(--accent-dim)" }}>
        <div className="text-[10.5px] font-bold uppercase tracking-[.12em] mb-2"
             style={{ color: "var(--accent)" }}>
          Antes de concluir
        </div>
        <h2 className="font-serif text-[1.4rem] leading-tight mb-2">
          Publique sobre isso hoje
        </h2>
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          A ideia está quente agora. Daqui a dois dias ela vira uma anotação que
          você não vai reler. Escolha o caminho mais curto para você:
        </p>
      </div>

      {/* ---------------------------------------------------- os modos */}
      <div className="px-5 pt-4">
        <div className="grid grid-cols-3 gap-1.5">
          {MODOS.map((m) => {
            const ativo = modo === m.id;
            return (
              <button key={m.id} type="button" onClick={() => { setModo(m.id); setCopiado(false); }}
                className="py-2 px-1 rounded-lg border text-center transition"
                style={{
                  borderColor: ativo ? "var(--accent)" : "var(--line)",
                  background: ativo ? "var(--accent-dim)" : "transparent",
                }}>
                <div className="text-[12.5px] font-semibold leading-tight"
                     style={{ color: ativo ? "var(--accent)" : "var(--ink-2)" }}>
                  {m.rotulo}
                </div>
                <div className="text-[10.5px] mt-0.5" style={{ color: "var(--ink-3)" }}>
                  {m.tempo}
                </div>
              </button>
            );
          })}
        </div>
        {modo === sugerido && (
          <p className="text-[11.5px] mt-2 text-center" style={{ color: "var(--ink-3)" }}>
            sugestão de hoje — os outros dois servem igual
          </p>
        )}
      </div>

      {/* -------------------------------------------------- o conteúdo */}
      <div className="px-5 pt-4 pb-5">
        {modo === "ler" && (
          <>
            <Instrucao>
              Apoie o celular em qualquer coisa, abra a câmera e leia isto olhando
              para a lente. Uma tomada só. Se tropeçar numa palavra, siga — a
              hesitação mostra que você está pensando, não atrapalha.
            </Instrucao>
            <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed rounded-xl p-4 mt-3"
                 style={{ background: "var(--bg-2)", color: "var(--ink)" }}>
              {roteiro}
            </pre>
            <Legenda>
              O que estiver entre chaves é seu. Troque por um caso real antes de gravar —
              é o detalhe concreto que faz alguém parar.
            </Legenda>
          </>
        )}

        {modo === "roteiro" && (
          <>
            <Instrucao>
              Você fala do seu jeito; isto aqui só segura a ordem. Cada bloco é uma
              parte da peça — escreva ou grave seguindo a sequência.
            </Instrucao>
            <ol className="mt-3 space-y-2">
              {(cap.diretrizes.gabarito ?? []).map((g, i) => (
                <li key={i} className="rounded-xl p-3.5" style={{ background: "var(--bg-2)" }}>
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="text-[11px] font-bold tabular-nums"
                          style={{ color: "var(--accent)" }}>{i + 1}</span>
                    <span className="text-[12.5px] font-bold uppercase tracking-wide"
                          style={{ color: "var(--accent)" }}>{g.rotulo}</span>
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                    {g.texto}
                  </p>
                </li>
              ))}
            </ol>
            <Legenda>
              A última linha é a que as pessoas repetem para outra pessoa. Vale gastar
              um minuto a mais nela.
            </Legenda>
          </>
        )}

        {modo === "prompt" && (
          <>
            <Instrucao>
              Copie, cole no ChatGPT (ou no que você usar) e substitua o que está
              entre chaves. Ele organiza — a matéria-prima e a última frase continuam
              sendo suas.
            </Instrucao>
            <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed rounded-xl p-4 mt-3 max-h-72 overflow-y-auto"
                 style={{ background: "var(--bg-2)", color: "var(--ink-2)" }}>
              {prompt}
            </pre>
            <Legenda>
              Revise o que voltar com uma pergunta só: eu falaria assim? Se alguma
              frase não for sua, reescreva antes de publicar.
            </Legenda>
          </>
        )}

        {texto && (
          <button onClick={copiar} className="btn btn-ghost w-full mt-3.5">
            {copiado ? "✓ copiado" : modo === "ler" ? "Copiar o roteiro" : "Copiar o prompt"}
          </button>
        )}

        <p className="text-[12px] leading-relaxed mt-4 text-center" style={{ color: "var(--ink-3)" }}>
          Se hoje não der, tudo bem — o capítulo conclui do mesmo jeito.
          Isto fica aqui esperando quando você voltar.
        </p>
      </div>
    </section>
  );
}

function Instrucao({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
      {children}
    </p>
  );
}

function Legenda({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] leading-relaxed mt-2.5" style={{ color: "var(--ink-3)" }}>
      {children}
    </p>
  );
}
