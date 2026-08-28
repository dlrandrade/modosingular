import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { carregarJornada } from "@/lib/dados";
import { Cabecalho } from "@/components/Cabecalho";
import { Navegacao } from "@/components/Navegacao";
import { FormPerfil } from "./FormPerfil";
import { sair } from "@/app/entrar/actions";
import Link from "next/link";
import { TOTAL_CAPITULOS } from "@/lib/ritmo";

export const metadata: Metadata = { title: "Perfil" };
export const dynamic = "force-dynamic";

const LINGUAGENS: Record<string, { nome: string; texto: string }> = {
  oral:      { nome: "Oral",      texto: "Você pensa falando. Capture sempre em áudio — escrever primeiro anula a sua vantagem." },
  escrito:   { nome: "Escrito",   texto: "Você pensa escrevendo. Escreva primeiro e grave depois, lendo do seu jeito." },
  dialogico: { nome: "Dialógico", texto: "Você pensa respondendo. Crie um interlocutor: caixinha, entrevista ou pergunta lida em voz alta." },
  narrativo: { nome: "Narrativo", texto: "Você pensa contando. Comece sempre pelo caso — a tese aparece sozinha no fim." },
};

export default async function Perfil() {
  const j = await carregarJornada();
  if (!j) redirect("/entrar");

  const supabase = await createClient();
  const [tarefas, scores, materia] = await Promise.all([
    supabase.from("task_submissions").select("chapter,state").eq("user_id", j.perfil.id),
    supabase.from("application_scores").select("score").eq("user_id", j.perfil.id),
    supabase.from("raw_material").select("id", { count: "exact", head: true }).eq("user_id", j.perfil.id),
  ]);

  const entregues = (tarefas.data ?? []).filter((t) => t.state !== "draft").length;
  const listaScores = (scores.data ?? []).map((s) => s.score);
  const media = listaScores.length
    ? Math.round(listaScores.reduce((a, b) => a + b, 0) / listaScores.length) : null;
  const ling = j.perfil.linguagem_primaria ? LINGUAGENS[j.perfil.linguagem_primaria] : null;

  return (
    <>
      <Cabecalho />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-28">
        <h1 className="font-serif text-2xl mb-6">Seu perfil</h1>

        {/* ------------------------------------------------- indicadores */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card valor={`${j.concluidos.length}/${TOTAL_CAPITULOS}`} rotulo="capítulos concluídos" />
          <Card valor={String(entregues)} rotulo="tarefas entregues" />
          <Card valor={media !== null ? String(media) : "—"} rotulo="pontuação média de aplicação" />
          <Card valor={String(materia.count ?? 0)} rotulo="itens no banco de matéria-prima" />
        </div>

        {/* ------------------------------------------ linguagem criativa */}
        <section className="card p-4 mb-6">
          <div className="text-[10.5px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-3)" }}>
            Sua linguagem criativa
          </div>
          {ling ? (
            <>
              <h2 className="font-serif text-xl mb-1.5" style={{ color: "var(--accent)" }}>
                {ling.nome}
                {j.perfil.linguagem_secundaria && (
                  <span className="text-[13px] font-sans not-italic ml-2" style={{ color: "var(--ink-3)" }}>
                    secundária: {LINGUAGENS[j.perfil.linguagem_secundaria]?.nome}
                  </span>
                )}
              </h2>
              <p className="text-[14px] leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>{ling.texto}</p>
              <div className="space-y-2">
                {Object.entries(j.perfil.linguagem_scores ?? {}).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-[11.5px] mb-1" style={{ color: "var(--ink-3)" }}>
                      <span>{LINGUAGENS[k]?.nome ?? k}</span><span className="tabular-nums">{v}/10</span>
                    </div>
                    <div className="track">
                      <i style={{ width: `${(Number(v) / 10) * 100}%`,
                                  background: k === j.perfil.linguagem_primaria ? "var(--accent)" : "var(--ink-3)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
              Ainda não definida. O teste do{" "}
              <Link href="/dia/7" className="underline" style={{ color: "var(--accent)" }}>Capítulo 7</Link>{" "}
              revela o seu modo criativo — é ele que decide onde você captura.
            </p>
          )}
        </section>

        {/* --------------------------------------------------- dados */}
        <section className="mb-6">
          <h2 className="font-serif text-lg mb-3">Seus dados</h2>
          <FormPerfil perfil={j.perfil} />
        </section>

        {/* ---------------------------------------------- assinatura */}
        <section className="card p-4 mb-6">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-[10.5px] font-bold uppercase tracking-[.1em]" style={{ color: "var(--ink-3)" }}>
              Assinatura
            </span>
            <span className="chip" style={{
              color: j.assinaturaAtiva ? "var(--pos)" : "var(--ink-3)",
              borderColor: j.assinaturaAtiva ? "var(--pos)" : "var(--line)",
            }}>
              {j.assinaturaAtiva ? "ativa" : j.statusAssinatura === "none" ? "gratuita" : j.statusAssinatura}
            </span>
          </div>
          <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>
            {j.assinaturaAtiva
              ? "Você tem acesso aos 30 capítulos."
              : "Capítulos 1 a 3 livres. R$ 19,90/mês para os 30."}
          </p>
          <Link href="/assinatura" className="btn btn-ghost w-full">Gerenciar assinatura</Link>
        </section>

        <form action={sair}>
          <button className="btn btn-quiet w-full">Sair da conta</button>
        </form>
      </main>
      <Navegacao admin={j.perfil.role === "admin"} />
    </>
  );
}

function Card({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="card p-4">
      <div className="font-serif text-2xl leading-none mb-1.5" style={{ color: "var(--accent)" }}>{valor}</div>
      <div className="text-[12px] leading-snug" style={{ color: "var(--ink-3)" }}>{rotulo}</div>
    </div>
  );
}
