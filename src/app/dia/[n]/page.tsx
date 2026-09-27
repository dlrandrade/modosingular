import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { carregarJornada } from "@/lib/dados";
import { getCapitulo, FASES, ROTEIROS, ESTRUTURAS, montarPrompt } from "@/content";
import { paraCliente } from "./tipos";
import { textoBloqueio } from "@/lib/ritmo";
import { Cabecalho } from "@/components/Cabecalho";
import { Conteudo, IlustracaoCapitulo } from "@/components/Blocos";
import { LeitorInterativo } from "./LeitorInterativo";
import { Video } from "@/components/Video";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const cap = getCapitulo(Number((await params).n));
  return { title: cap ? `Dia ${cap.n} · ${cap.tema}` : "Capítulo" };
}

export default async function Dia({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const cap = getCapitulo(n);
  if (!cap) notFound();

  const j = await carregarJornada();
  if (!j) redirect("/entrar");

  const estado = j.gating.find((g) => g.n === n)!;
  if (!estado.liberado) return <Bloqueado n={n} motivo={estado.motivo} dia={j.dia} />;

  const supabase = await createClient();
  const [quizRes, tarefaRes, scoreRes, notaRes, cfgRes] = await Promise.all([
    supabase.from("quiz_attempts").select("acertos,total,passou,answers")
      .eq("user_id", j.perfil.id).eq("chapter", n).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("task_submissions").select("campos,state,formato,link_publicacao")
      .eq("user_id", j.perfil.id).eq("chapter", n).maybeSingle(),
    supabase.from("application_scores").select("criterios,score")
      .eq("user_id", j.perfil.id).eq("chapter", n).maybeSingle(),
    supabase.from("notes").select("corpo").eq("user_id", j.perfil.id).eq("chapter", n).maybeSingle(),
    supabase.from("chapter_settings").select("video_url,video_provider,nota_admin").eq("chapter", n).maybeSingle(),
  ]);

  const fase = FASES.find((f) => f.n === cap.fase)!;
  const anterior = n > 1 ? n - 1 : null;
  const proximo = n < 30 && j.gating.find((g) => g.n === n + 1)?.liberado ? n + 1 : null;

  return (
    <>
      <Cabecalho direita={
        <Link href="/jornada" className="text-[13px] font-medium" style={{ color: "var(--ink-3)" }}>
          Jornada
        </Link>
      } />

      <main className="max-w-2xl mx-auto px-page pt-6 pb-28">
        {/* ---------------------------------------------------- abertura */}
        <header className="rise">
          <div className="flex items-center gap-2 mb-3">
            <span className="chip">Dia {cap.n}</span>
            <span className="chip">Fase {fase.n} · {fase.nome}</span>
            <span className="ml-auto text-[11.5px]" style={{ color: "var(--ink-3)" }}>
              {cap.leituraMin} min
            </span>
          </div>

          <h1 className="font-serif text-[2.15rem] leading-[1.15] mb-2">{cap.tema}</h1>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: "var(--ink-2)" }}>
            {cap.subtitulo}
          </p>

          <blockquote className="rounded-xl p-4 mb-2"
                      style={{ background: "var(--accent-dim)", borderLeft: "3px solid var(--accent)" }}>
            <p className="font-serif italic text-[1.3rem] leading-snug" style={{ color: "var(--accent-2)" }}>
              “{cap.frase}”
            </p>
          </blockquote>
        </header>

        {/* -------------------------------------------------------- vídeo */}
        {cfgRes.data?.video_url && (
          <Video url={cfgRes.data.video_url} provider={cfgRes.data.video_provider} />
        )}
        {cfgRes.data?.nota_admin && (
          <aside className="card p-3.5 my-5 text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {cfgRes.data.nota_admin}
          </aside>
        )}

        {/* ------------------------------------------------------ conceito */}
        <section className="card p-4 my-7">
          <div className="text-[10.5px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-3)" }}>
            O conceito
          </div>
          <h2 className="font-serif text-[1.4rem] mb-2" style={{ color: "var(--accent)" }}>{cap.conceito.termo}</h2>
          <p className="text-[14.5px] leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>
            {cap.conceito.definicao}
          </p>
          <div className="pt-3 border-t hair">
            <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--ink-3)" }}>
              Por que importa
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {cap.conceito.porqueImporta}
            </p>
          </div>
        </section>

        <IlustracaoCapitulo ilustracao={cap.ilustracao} />

        {/* ------------------------------------------------------ conteúdo */}
        <article><Conteudo blocos={cap.conteudo} /></article>

        {/* ------------------------------------------------------- insights */}
        <section className="my-9">
          <h2 className="font-serif text-[1.4rem] mb-3">Para levar deste capítulo</h2>
          <ul className="space-y-2.5">
            {cap.insights.map((t, i) => (
              <li key={i} className="card p-3.5 flex gap-3">
                <span className="shrink-0 font-serif text-[1.28rem] leading-none mt-0.5" style={{ color: "var(--accent)" }}>
                  {i + 1}
                </span>
                <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{t}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------- tudo o que é interativo vive no cliente */}
        <LeitorInterativo
          capitulo={paraCliente(cap)}
          publicar={{
            roteiro: ROTEIROS[cap.n] ?? "",
            estrutura: ESTRUTURAS[cap.n] ?? [],
            prompt: montarPrompt(cap),
          }}
          concluido={estado.concluido}
          quizAnterior={quizRes.data ?? null}
          tarefaAnterior={tarefaRes.data ?? null}
          scoreAnterior={scoreRes.data ?? null}
          notaAnterior={notaRes.data?.corpo ?? ""}
          proximo={proximo}
        />

        {/* ------------------------------------------------------ navegação */}
        <nav className="flex gap-3 mt-10 pt-6 border-t hair">
          {anterior ? (
            <Link href={`/dia/${anterior}`} className="btn btn-ghost flex-1">← Dia {anterior}</Link>
          ) : <span className="flex-1" />}
          {proximo ? (
            <Link href={`/dia/${proximo}`} className="btn btn-ghost flex-1">Dia {proximo} →</Link>
          ) : <span className="flex-1" />}
        </nav>
      </main>
    </>
  );
}

function Bloqueado({ n, motivo, dia }: { n: number; motivo: string | null; dia: number }) {
  const assinatura = motivo === "assinatura";
  return (
    <>
      <Cabecalho />
      <main className="max-w-md mx-auto px-page py-16 text-center">
        <div className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-5 border"
             style={{ borderColor: "var(--line)", color: "var(--ink-3)" }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="9" width="12" height="8" rx="2" />
            <path d="M7 9V6.5a3 3 0 016 0V9" />
          </svg>
        </div>
        <h1 className="font-serif text-[1.65rem] mb-3">Capítulo {n} ainda fechado</h1>
        <p className="text-[14.5px] leading-relaxed mb-7" style={{ color: "var(--ink-2)" }}>
          {textoBloqueio(motivo as never, dia)}
        </p>
        <div className="flex flex-col gap-2.5">
          {assinatura && <Link href="/assinatura" className="btn btn-primary">Assinar por R$ 19,90/mês</Link>}
          <Link href="/jornada" className="btn btn-ghost">Voltar para a jornada</Link>
        </div>
      </main>
    </>
  );
}
