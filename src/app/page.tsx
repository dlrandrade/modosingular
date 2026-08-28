import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Marca } from "@/components/Marca";
import { BotaoTema } from "@/components/BotaoTema";
import { FASES, CAPITULOS } from "@/content";
import { CAPITULOS_GRATIS, TOTAL_CAPITULOS } from "@/lib/ritmo";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/jornada");

  const { data } = await supabase.from("app_settings").select("key,value").eq("key", "preco").maybeSingle();
  const preco = (data?.value as { label?: string })?.label ?? "R$ 19,90";

  return (
    <>
      <header className="border-b safe-t" style={{ background: "var(--bg)" }}>
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Marca compacto />
          <div className="flex items-center gap-2">
            <BotaoTema />
            <Link href="/entrar" className="btn btn-ghost !py-2 !px-3.5 !text-[13.5px]">Entrar</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 pb-20">
        {/* ------------------------------------------------------ hero */}
        <section className="py-14 sm:py-20 rise">
          <p className="chip mb-5">30 capítulos · para especialistas</p>
          <h1 className="font-serif text-[2.4rem] sm:text-[3.2rem] leading-[1.08] mb-5">
            Você é maior fora da internet
            <br />
            <span style={{ color: "var(--accent)" }}>do que dentro dela.</span>
          </h1>
          <p className="text-[17px] leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>
            Quem convive com você sabe que você entende. Quem encontra o seu perfil,
            não percebe. Essa distância tem nome, tem custo — e tem solução.
          </p>
          <p className="text-[16px] leading-relaxed mb-8" style={{ color: "var(--ink-2)" }}>
            O Modo Singular não vai te transformar em criador de conteúdo. Vai te devolver
            a autoria da sua presença digital, respeitando o seu jeito, a sua rotina e o seu tempo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/entrar" className="btn btn-primary flex-1">
              Começar pelo Dia 1 — livre
            </Link>
            <a href="#metodo" className="btn btn-ghost flex-1">Ver o método</a>
          </div>
          <p className="text-[13px] mt-3.5" style={{ color: "var(--ink-3)" }}>
            Capítulos 1 a {CAPITULOS_GRATIS} sem pagar nada. Depois, {preco}/mês.
          </p>
        </section>

        {/* --------------------------------------------------- a tensão */}
        <section className="py-10 border-t hair">
          <h2 className="font-serif text-2xl mb-5">Talvez o problema nunca tenha sido você</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Você já tentou e parou", "Durou entre 11 e 23 dias. O mercado chamou de falta de disciplina. Quase nunca é."],
              ["Você contratou alguém", "Voltaram posts corretos, bem diagramados e que poderiam ser de qualquer colega seu."],
              ["Você adia por produção", "Falta luz, cenário, identidade visual. E como produção sempre pode melhorar, o adiamento não acaba."],
              ["Você vê gente com menos preparo ocupando o seu espaço", "E isso incomoda mais do que perder faturamento, porque mexe com reconhecimento."],
            ].map(([t, d]) => (
              <div key={t} className="card p-4">
                <h3 className="text-[15px] font-semibold mb-1.5">{t}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------- o método */}
        <section id="metodo" className="py-10 border-t hair scroll-mt-16">
          <h2 className="font-serif text-2xl mb-2">Cinco fases, {TOTAL_CAPITULOS} capítulos</h2>
          <p className="text-[14.5px] leading-relaxed mb-6" style={{ color: "var(--ink-2)" }}>
            Um capítulo por dia é o ritmo sugerido. Você pode adiantar — mas a jornada
            não termina em menos de sete dias. Presença se constrói com repetição, não com maratona.
          </p>

          <ol className="space-y-3">
            {FASES.map((f) => (
              <li key={f.n} className="card p-4">
                <div className="flex items-baseline gap-2.5 mb-1.5">
                  <span className="font-serif text-2xl leading-none" style={{ color: "var(--accent)" }}>{f.n}</span>
                  <h3 className="font-serif text-lg">{f.nome}</h3>
                  <span className="ml-auto text-[11.5px]" style={{ color: "var(--ink-3)" }}>
                    dias {f.capitulos[0]}–{f.capitulos[1]}
                  </span>
                </div>
                <p className="text-[14px] leading-relaxed mb-2.5" style={{ color: "var(--ink-2)" }}>{f.promessa}</p>
                <div className="flex flex-wrap gap-1.5">
                  {CAPITULOS.filter((c) => c.fase === f.n).map((c) => (
                    <span key={c.n} className="text-[11.5px] px-2 py-0.5 rounded"
                          style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}>
                      {c.tema}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------- o que tem dentro */}
        <section className="py-10 border-t hair">
          <h2 className="font-serif text-2xl mb-5">O que existe em cada capítulo</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Conceito e frase do dia", "Uma ideia por capítulo, nomeada e definida."],
              ["Conteúdo com diagramas", "Tabelas, gráficos, comparações e esquemas — não parede de texto."],
              ["Quiz corrigido", "70% de acerto libera o próximo. Com explicação em cada alternativa."],
              ["Teste de autodiagnóstico", "Incluindo o Teste da Linguagem Criativa, que define o seu modo."],
              ["Tarefa guiada", "Campos que te levam a produzir conteúdo de verdade, não a rascunhar."],
              ["Diretrizes de produção", "O que fazer, o que evitar e o esqueleto pronto para usar."],
              ["Pontuação de aplicação", "Mede se você aplicou, não se você leu."],
              ["Banco de matéria-prima", "Tudo que você captura fica salvo e buscável."],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3">
                <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>—</span>
                <div>
                  <h3 className="text-[14.5px] font-semibold">{t}</h3>
                  <p className="text-[13.5px] leading-snug" style={{ color: "var(--ink-3)" }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------- não é… */}
        <section className="py-10 border-t hair">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-4"
                 style={{ borderColor: "var(--neg)", background: "color-mix(in srgb, var(--neg) 7%, transparent)" }}>
              <h3 className="text-[13px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--neg)" }}>
                Não é isto
              </h3>
              <ul className="space-y-2 text-[14px] leading-snug" style={{ color: "var(--ink-2)" }}>
                <li>Virar influenciador ou criador profissional.</li>
                <li>Gravar stories da rotina o dia inteiro.</li>
                <li>Aprender a falar de um jeito que não é o seu.</li>
                <li>Montar estúdio e comprar equipamento.</li>
                <li>Simplificar o que você sabe até virar dica rasa.</li>
              </ul>
            </div>
            <div className="rounded-xl border p-4"
                 style={{ borderColor: "var(--pos)", background: "color-mix(in srgb, var(--pos) 7%, transparent)" }}>
              <h3 className="text-[13px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--pos)" }}>
                É isto
              </h3>
              <ul className="space-y-2 text-[14px] leading-snug" style={{ color: "var(--ink-2)" }}>
                <li>Tornar visível a autoridade que você já tem.</li>
                <li>Descobrir a forma de comunicar em que você é potente.</li>
                <li>Usar o que a sua rotina já produz todos os dias.</li>
                <li>Um sistema que cabe em 42 minutos por semana.</li>
                <li>Ganhar alcance sem perder profundidade.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------- fechamento */}
        <section className="py-12 border-t hair text-center">
          <blockquote className="font-serif text-xl sm:text-2xl leading-snug italic mb-7 max-w-xl mx-auto"
                      style={{ color: "var(--accent-2)" }}>
            “Talvez não seja a pessoa que não combina com conteúdo.
            Talvez seja o modelo de conteúdo que nunca combinou com a pessoa.”
          </blockquote>
          <Link href="/entrar" className="btn btn-primary w-full sm:w-auto sm:px-10">
            Começar agora — Dia 1 livre
          </Link>
          <p className="text-[13px] mt-3.5" style={{ color: "var(--ink-3)" }}>
            {preco}/mês a partir do Dia {CAPITULOS_GRATIS + 1} · cancele quando quiser
          </p>
        </section>
      </main>

      <footer className="border-t hair py-7 safe-b">
        <div className="max-w-3xl mx-auto px-5 flex items-center justify-between gap-4">
          <Marca compacto />
          <span className="text-[12px]" style={{ color: "var(--ink-3)" }}>
            © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}
