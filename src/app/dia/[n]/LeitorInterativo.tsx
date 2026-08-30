"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CrieAgora } from "./CrieAgora";
import { useRouter } from "next/navigation";
import type { CapituloCliente, Publicar } from "./tipos";
import {
  abrirCapitulo, concluirCapitulo, enviarQuiz,
  salvarTarefa, salvarPontuacao, salvarTeste, salvarNota,
} from "@/app/actions";

type Detalhe = { id: string; marcada: number; correta: number; acertou: boolean; explicacao: string };
type ResultadoQuiz = { acertos: number; total: number; passou: boolean; detalhes: Detalhe[] };

export function LeitorInterativo({
  capitulo: cap, publicar, concluido, quizAnterior, tarefaAnterior, scoreAnterior, notaAnterior, proximo,
}: {
  capitulo: CapituloCliente;
  publicar: Publicar;
  concluido: boolean;
  quizAnterior: { acertos: number; total: number; passou: boolean; answers: unknown } | null;
  tarefaAnterior: { campos: Record<string, string>; state: string; formato: string | null; link_publicacao: string | null } | null;
  scoreAnterior: { criterios: Record<string, number>; score: number } | null;
  notaAnterior: string;
  proximo: number | null;
}) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();

  useEffect(() => { abrirCapitulo(cap.n); }, [cap.n]);

  /* ------------------------------------------------------------ quiz */
  const [respostas, setRespostas] = useState<number[]>(() => Array(cap.quiz.length).fill(-1));
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(
    quizAnterior
      ? { acertos: quizAnterior.acertos, total: quizAnterior.total, passou: quizAnterior.passou,
          detalhes: (quizAnterior.answers as Detalhe[]) ?? [] }
      : null,
  );
  const quizCompleto = respostas.every((r) => r >= 0);
  const quizAprovado = resultado?.passou ?? false;

  function corrigir() {
    startTransition(async () => {
      const r = await enviarQuiz(cap.n, respostas);
      if (r.ok) setResultado({ acertos: r.acertos, total: r.total, passou: r.passou, detalhes: r.detalhes });
    });
  }

  /* ----------------------------------------------------------- teste */
  const [teste, setTeste] = useState<Record<string, number>>({});
  const [resTeste, setResTeste] = useState<
    { soma: number; faixa: { min: number; max: number; titulo: string; leitura: string } } | null
  >(null);
  const refResultado = useRef<HTMLDivElement>(null);

  // O resultado é a recompensa de responder o teste inteiro: leva a tela até ele.
  useEffect(() => {
    if (resTeste) refResultado.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [resTeste]);
  const testeCompleto = cap.teste ? cap.teste.itens.every((i) => teste[i.id] > 0) : true;

  /* ------------------------------------------------------- pontuação */
  const [criterios, setCriterios] = useState<Record<string, number>>(scoreAnterior?.criterios ?? {});
  const [score, setScore] = useState<number | null>(scoreAnterior?.score ?? null);

  /* ---------------------------------------------------------- tarefa */
  const [campos, setCampos] = useState<Record<string, string>>(tarefaAnterior?.campos ?? {});
  const [formato, setFormato] = useState(tarefaAnterior?.formato ?? "");
  const [salvo, setSalvo] = useState<"idle" | "salvando" | "ok">("idle");
  // Só salva rascunho depois de uma edição real: sem isso, reabrir um
  // capítulo com a tarefa já entregue a rebaixaria para rascunho.
  const [tocado, setTocado] = useState(false);
  const [entregue, setEntregue] = useState(
    tarefaAnterior?.state === "submitted" || tarefaAnterior?.state === "published",
  );
  const [erroTarefa, setErroTarefa] = useState("");
  const refEntrega = useRef<HTMLDivElement>(null);
  // Reeditar depois de entregar: precisa reenviar para valer.
  const editadaAposEntrega = entregue && tocado;

  /* ----------------------------------------------------------- notas */
  const [nota, setNota] = useState(notaAnterior);

  // Autosave de rascunho a cada 2,5s de inatividade.
  useEffect(() => {
    if (!tocado) return;
    setSalvo("salvando");
    const t = setTimeout(async () => {
      await salvarTarefa(cap.n, campos, false, { formato });
      setSalvo("ok");
    }, 2500);
    return () => clearTimeout(t);
  }, [campos, formato, cap.n, tocado]);

  useEffect(() => {
    if (nota === notaAnterior) return;
    const t = setTimeout(() => { salvarNota(cap.n, nota); }, 2500);
    return () => clearTimeout(t);
  }, [nota, notaAnterior, cap.n]);

  function concluir() {
    startTransition(async () => {
      const r = await concluirCapitulo(cap.n);
      if (r.ok) router.push(proximo ? `/dia/${proximo}` : "/jornada");
      else if (r.erro === "quiz_pendente") {
        document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  return (
    <div className="space-y-10">
      {/* ================================================== TESTE ==== */}
      {cap.teste && (
        <Secao numero="Teste" titulo={cap.teste.titulo} legenda={cap.teste.instrucao}>
          <div className="space-y-3">
            {cap.teste.itens.map((item) => (
              <div key={item.id} className="card p-3.5">
                <p className="text-[14px] leading-snug mb-2.5" style={{ color: "var(--ink-2)" }}>{item.texto}</p>
                <div className="flex gap-1.5">
                  {cap.teste!.escala.map((rot, i) => {
                    const v = i + 1, ativo = teste[item.id] === v;
                    return (
                      <button key={v} type="button" title={rot}
                        onClick={() => setTeste((s) => ({ ...s, [item.id]: v }))}
                        className="flex-1 py-2 rounded-md text-[12px] font-semibold border transition"
                        style={{
                          borderColor: ativo ? "var(--accent)" : "var(--line)",
                          background: ativo ? "var(--accent-dim)" : "transparent",
                          color: ativo ? "var(--accent)" : "var(--ink-3)",
                        }}>
                        {v}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1.5 text-[10.5px]" style={{ color: "var(--ink-3)" }}>
                  <span>{cap.teste!.escala[0]}</span>
                  <span>{cap.teste!.escala[cap.teste!.escala.length - 1]}</span>
                </div>
              </div>
            ))}
          </div>

          {!resTeste ? (
            <button disabled={!testeCompleto || pendente} className="btn btn-primary w-full mt-4"
              onClick={() => startTransition(async () => {
                const r = await salvarTeste(cap.n === 7 ? "linguagem-criativa" : `teste-${cap.n}`, cap.n, teste);
                if (r.ok) setResTeste({ soma: r.soma, faixa: r.faixa });
              })}>
              {testeCompleto ? "Ver meu resultado" : `Responda os ${cap.teste.itens.length} itens`}
            </button>
          ) : (
            <div ref={refResultado} className="rise mt-5 rounded-2xl border overflow-hidden"
                 style={{ borderColor: "var(--accent)" }}>
              <div className="px-5 pt-6 pb-5 text-center" style={{ background: "var(--accent-dim)" }}>
                <div className="text-[10.5px] font-bold uppercase tracking-[.14em] mb-3"
                     style={{ color: "var(--accent)" }}>
                  Seu resultado
                </div>
                <div className="flex items-baseline justify-center gap-1.5 mb-3">
                  <span className="font-serif leading-none tabular-nums"
                        style={{ fontSize: "3.6rem", color: "var(--accent)" }}>
                    {resTeste.soma}
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--ink-3)" }}>
                    de {cap.teste!.itens.length * cap.teste!.escala.length}
                  </span>
                </div>
                <h4 className="font-serif text-[1.65rem] leading-tight" style={{ color: "var(--ink)" }}>
                  {resTeste.faixa.titulo}
                </h4>
              </div>

              <div className="px-5">
                <Medidor faixas={cap.teste!.faixas} soma={resTeste.soma} />
              </div>

              <div className="px-5 pb-5 pt-4">
                <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {resTeste.faixa.leitura}
                </p>
              </div>
            </div>
          )}
        </Secao>
      )}

      {/* =================================================== QUIZ ==== */}
      <Secao id="quiz" numero="Quiz" titulo="Fixação"
             legenda="70% de acerto libera o próximo capítulo. Pode repetir quantas vezes quiser.">
        <div className="space-y-4">
          {cap.quiz.map((q, i) => {
            const det = resultado?.detalhes[i];
            return (
              <div key={q.id} className="card p-4">
                <p className="text-[14.5px] font-medium leading-snug mb-3">
                  <span style={{ color: "var(--accent)" }}>{i + 1}.</span> {q.pergunta}
                </p>
                <div className="space-y-1.5">
                  {q.opcoes.map((op, oi) => {
                    const marcada = resultado ? det?.marcada === oi : respostas[i] === oi;
                    const certa = resultado && det?.correta === oi;
                    const erradaMarcada = resultado && marcada && !certa;
                    return (
                      <button key={oi} type="button" disabled={!!resultado}
                        onClick={() => setRespostas((r) => r.map((v, k) => (k === i ? oi : v)))}
                        className="w-full text-left px-3 py-2.5 rounded-lg border text-[13.5px] leading-snug transition flex gap-2.5"
                        style={{
                          borderColor: certa ? "var(--pos)" : erradaMarcada ? "var(--neg)" : marcada ? "var(--accent)" : "var(--line)",
                          background: certa ? "color-mix(in srgb, var(--pos) 10%, transparent)"
                            : erradaMarcada ? "color-mix(in srgb, var(--neg) 10%, transparent)"
                            : marcada ? "var(--accent-dim)" : "transparent",
                          color: "var(--ink-2)",
                          cursor: resultado ? "default" : "pointer",
                        }}>
                        <span className="shrink-0 font-semibold"
                              style={{ color: certa ? "var(--pos)" : erradaMarcada ? "var(--neg)" : "var(--ink-3)" }}>
                          {certa ? "✓" : erradaMarcada ? "✕" : String.fromCharCode(65 + oi)}
                        </span>
                        <span>{op}</span>
                      </button>
                    );
                  })}
                </div>
                {det && (
                  <p className="text-[13px] leading-relaxed mt-3 pt-3 border-t hair" style={{ color: "var(--ink-3)" }}>
                    {det.explicacao}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!resultado ? (
          <button disabled={!quizCompleto || pendente} className="btn btn-primary w-full mt-4" onClick={corrigir}>
            {quizCompleto ? "Corrigir" : `Falta responder ${respostas.filter((r) => r < 0).length}`}
          </button>
        ) : (
          <div className="mt-4">
            <div className="card p-4 text-center"
                 style={{ borderColor: resultado.passou ? "var(--pos)" : "var(--neg)" }}>
              <div className="font-serif text-[2rem] mb-1"
                   style={{ color: resultado.passou ? "var(--pos)" : "var(--neg)" }}>
                {resultado.acertos}/{resultado.total}
              </div>
              <p className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
                {resultado.passou
                  ? "Aprovado. Você pode concluir o capítulo."
                  : "Releia as explicações acima e tente de novo — sem pressa."}
              </p>
            </div>
            {!resultado.passou && (
              <button className="btn btn-ghost w-full mt-2.5"
                onClick={() => { setResultado(null); setRespostas(Array(cap.quiz.length).fill(-1)); }}>
                Refazer o quiz
              </button>
            )}
          </div>
        )}
      </Secao>

      {/* ============================================== DIRETRIZES ==== */}
      <Secao numero="Diretrizes" titulo={cap.diretrizes.titulo}
             legenda="Como transformar o conceito deste capítulo em conteúdo publicável.">
        <div className="space-y-3">
          {cap.diretrizes.regras.map((r, i) => (
            <div key={i} className="card p-3.5">
              <p className="text-[14.5px] font-semibold mb-1">{r.regra}</p>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>{r.porque}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-4">
          <Lista titulo="Faça assim" itens={cap.diretrizes.facaAssim} cor="var(--pos)" marca="✓" />
          <Lista titulo="Evite" itens={cap.diretrizes.eviteAssim} cor="var(--neg)" marca="✕" />
        </div>

        {cap.diretrizes.gabarito && (
          <div className="card mt-4 overflow-hidden">
            <div className="px-4 py-2.5 border-b hair text-[10.5px] font-bold uppercase tracking-[.1em]"
                 style={{ color: "var(--ink-3)" }}>
              Esqueleto pronto para usar
            </div>
            <div className="divide-y" style={{ borderColor: "var(--line-soft)" }}>
              {cap.diretrizes.gabarito.map((g, i) => (
                <div key={i} className="p-3.5 grid gap-1 sm:grid-cols-[130px_1fr] sm:gap-3">
                  <div className="text-[12px] font-bold" style={{ color: "var(--accent)" }}>{g.rotulo}</div>
                  <div className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{g.texto}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Secao>

      {/* ================================================= TAREFA ==== */}
      <Secao numero="Tarefa" titulo={cap.tarefa.titulo} legenda={cap.tarefa.objetivo}>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="chip">~{cap.tarefa.tempoMin} min</span>
          {entregue && <span className="chip" style={{ color: "var(--pos)", borderColor: "var(--pos)" }}>entregue</span>}
        </div>

        <div className="card p-3.5 mb-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--ink-3)" }}>
            O que precisa existir ao final
          </div>
          <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{cap.tarefa.entrega}</p>
        </div>

        <div className="space-y-4">
          {cap.tarefa.campos.map((c) => (
            <label key={c.id} className="block">
              <span className="block text-[13px] font-semibold mb-1.5">{c.rotulo}</span>
              <textarea
                className="field resize-y"
                rows={c.linhas ?? 3}
                placeholder={c.placeholder}
                value={campos[c.id] ?? ""}
                onChange={(e) => {
                  setTocado(true);
                  setCampos((s) => ({ ...s, [c.id]: e.target.value }));
                }}
              />
            </label>
          ))}

          <label className="block">
            <span className="block text-[13px] font-semibold mb-1.5">Formato escolhido</span>
            <div className="flex flex-wrap gap-1.5">
              {cap.tarefa.formatoSugerido.map((f) => (
                <button key={f} type="button"
                  onClick={() => { setTocado(true); setFormato(formato === f ? "" : f); }}
                  className="px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition"
                  style={{
                    borderColor: formato === f ? "var(--accent)" : "var(--line)",
                    background: formato === f ? "var(--accent-dim)" : "transparent",
                    color: formato === f ? "var(--accent)" : "var(--ink-3)",
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="card p-3.5 mt-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--ink-3)" }}>
            Critérios de qualidade
          </div>
          <ul className="space-y-1.5">
            {cap.tarefa.criteriosDeQualidade.map((c, i) => (
              <li key={i} className="text-[13.5px] leading-snug flex gap-2" style={{ color: "var(--ink-2)" }}>
                <span style={{ color: "var(--accent)" }}>·</span>{c}
              </li>
            ))}
          </ul>
        </div>

        <div ref={refEntrega} className="mt-4 scroll-mt-24">
          {entregue && !editadaAposEntrega ? (
            <div className="rise rounded-xl border p-4"
                 style={{ borderColor: "var(--pos)",
                          background: "color-mix(in srgb, var(--pos) 9%, transparent)" }}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center text-[13px] font-bold"
                      style={{ background: "var(--pos)", color: "var(--bg)" }}>✓</span>
                <div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: "var(--pos)" }}>
                    Tarefa entregue
                  </p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                    Está salva na sua conta e aparece no seu perfil. Pode continuar editando
                    — se mudar algo, é só entregar de novo.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {editadaAposEntrega && (
                <p className="text-[13px] leading-relaxed mb-2.5 rounded-lg px-3 py-2.5"
                   style={{ color: "var(--accent)", background: "var(--accent-dim)" }}>
                  Você editou depois de entregar. Entregue de novo para gravar a versão nova.
                </p>
              )}
              <button className="btn btn-primary w-full" disabled={pendente}
                onClick={() => startTransition(async () => {
                  const preenchidos = Object.values(campos).filter((v) => v && v.trim()).length;
                  if (preenchidos === 0) {
                    setErroTarefa("Preencha ao menos um campo antes de entregar.");
                    return;
                  }
                  setErroTarefa("");
                  await salvarTarefa(cap.n, campos, true, { formato });
                  setEntregue(true);
                  setTocado(false);
                  setSalvo("idle");
                  refEntrega.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                })}>
                {pendente ? "Entregando…" : editadaAposEntrega ? "Entregar de novo" : "Entregar tarefa"}
              </button>
            </>
          )}

          {erroTarefa && (
            <p className="text-[13px] mt-2.5 rounded-lg px-3 py-2.5"
               style={{ color: "var(--neg)",
                        background: "color-mix(in srgb, var(--neg) 12%, transparent)" }}>
              {erroTarefa}
            </p>
          )}

          <p className="text-[12px] mt-2.5 text-center" style={{ color: "var(--ink-3)" }}>
            {salvo === "salvando"
              ? "salvando rascunho…"
              : salvo === "ok"
              ? "rascunho salvo automaticamente"
              : "o que você escrever é salvo sozinho enquanto digita"}
          </p>
        </div>
      </Secao>

      {/* ============================================== PONTUAÇÃO ==== */}
      <Secao numero="Pontuação" titulo="Pontuação de aplicação"
             legenda="Quanto deste capítulo você realmente aplicou? Seja honesto — o número é para você.">
        <div className="space-y-3">
          {cap.criterios.map((c) => (
            <div key={c.id} className="card p-3.5">
              <p className="text-[14px] font-medium leading-snug">{c.rotulo}</p>
              <p className="text-[12.5px] mt-0.5 mb-2.5 leading-snug" style={{ color: "var(--ink-3)" }}>{c.ajuda}</p>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((v) => {
                  const ativo = criterios[c.id] === v;
                  return (
                    <button key={v} type="button"
                      onClick={() => setCriterios((s) => ({ ...s, [c.id]: v }))}
                      className="flex-1 py-2 rounded-md text-[12.5px] font-semibold border transition"
                      style={{
                        borderColor: ativo ? "var(--accent)" : "var(--line)",
                        background: ativo ? "var(--accent-dim)" : "transparent",
                        color: ativo ? "var(--accent)" : "var(--ink-3)",
                      }}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost w-full mt-3.5" disabled={pendente}
          onClick={() => startTransition(async () => {
            const r = await salvarPontuacao(cap.n, criterios);
            if (r.ok) setScore(r.score!);
          })}>
          Calcular minha pontuação
        </button>

        {score !== null && (
          <div className="card p-4 mt-3 text-center" style={{ borderColor: "var(--accent)" }}>
            <div className="font-serif text-[2.35rem] mb-1" style={{ color: "var(--accent)" }}>{score}</div>
            <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
              {score >= 80 ? "Aplicado de verdade. Pode seguir."
                : score >= 50 ? "Parcialmente aplicado. Vale revisitar os critérios em branco antes de avançar."
                : "Você leu, mas ainda não aplicou. A leitura sozinha não muda nada — volte às tarefas."}
            </p>
          </div>
        )}
      </Secao>

      {/* ================================================== NOTAS ==== */}
      <Secao numero="Notas" titulo="Suas anotações" legenda="Fica salvo automaticamente e só você vê.">
        <textarea className="field resize-y" rows={5}
          placeholder="O que este capítulo mexeu em você? O que você quer lembrar daqui a três meses?"
          value={nota} onChange={(e) => setNota(e.target.value)} />
      </Secao>

      {/* ============================================= CRIE AGORA ==== */}
      <CrieAgora n={cap.n} publicar={publicar} />

      {/* =============================================== CONCLUIR ==== */}
      <div className="card p-5 text-center" style={{ borderColor: quizAprovado ? "var(--accent)" : "var(--line)" }}>
        {concluido ? (
          <>
            <p className="text-[14px] mb-3" style={{ color: "var(--pos)" }}>✓ Capítulo concluído</p>
            {proximo && (
              <button className="btn btn-primary w-full" onClick={() => router.push(`/dia/${proximo}`)}>
                Ir para o Dia {proximo}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-[13.5px] mb-3.5 leading-relaxed" style={{ color: "var(--ink-3)" }}>
              {quizAprovado
                ? "Quiz aprovado. Concluir libera o próximo capítulo — respeitando o teto do dia."
                : "Aprove o quiz acima para poder concluir este capítulo."}
            </p>
            <button className="btn btn-primary w-full" disabled={!quizAprovado || pendente} onClick={concluir}>
              {pendente ? "Concluindo…" : "Concluir capítulo"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- auxiliares */

/** Onde a pontuação caiu dentro do espectro completo do teste. */
function Medidor({ faixas, soma }: {
  faixas: { min: number; max: number; titulo: string }[]; soma: number;
}) {
  const lo = Math.min(...faixas.map((f) => f.min));
  const hi = Math.max(...faixas.map((f) => f.max));
  const amplitude = Math.max(hi - lo, 1);
  const pos = Math.min(100, Math.max(0, ((soma - lo) / amplitude) * 100));

  return (
    <div className="pt-7">
      <div className="relative">
        <div className="absolute -top-5 flex flex-col items-center"
             style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
          <span style={{
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "6px solid var(--accent)",
          }} />
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden">
          {faixas.map((f, i) => {
            const largura = ((f.max - f.min + 1) / (amplitude + 1)) * 100;
            const ativa = soma >= f.min && soma <= f.max;
            return (
              <div key={i} style={{
                width: `${largura}%`,
                background: ativa ? "var(--accent)" : "var(--line)",
                borderRight: i < faixas.length - 1 ? "2px solid var(--surface)" : undefined,
              }} />
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[10.5px] tabular-nums"
           style={{ color: "var(--ink-3)" }}>
        <span>{lo}</span>
        <span>{faixas.length} faixas</span>
        <span>{hi}</span>
      </div>
    </div>
  );
}

function Secao({ id, numero, titulo, legenda, children }: {
  id?: string; numero: string; titulo: string; legenda: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4">
        <div className="text-[10.5px] font-bold uppercase tracking-[.12em] mb-1" style={{ color: "var(--accent)" }}>
          {numero}
        </div>
        <h2 className="font-serif text-[1.4rem] leading-tight mb-1">{titulo}</h2>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-3)" }}>{legenda}</p>
      </div>
      {children}
    </section>
  );
}

function Lista({ titulo, itens, cor, marca }: {
  titulo: string; itens: string[]; cor: string; marca: string;
}) {
  return (
    <div className="rounded-xl border p-3.5"
         style={{ borderColor: cor, background: `color-mix(in srgb, ${cor} 7%, transparent)` }}>
      <div className="text-[11px] font-bold uppercase tracking-wide mb-2.5" style={{ color: cor }}>{titulo}</div>
      <ul className="space-y-2">
        {itens.map((t, i) => (
          <li key={i} className="text-[13px] leading-snug flex gap-2" style={{ color: "var(--ink-2)" }}>
            <span className="shrink-0" style={{ color: cor }}>{marca}</span>{t}
          </li>
        ))}
      </ul>
    </div>
  );
}
