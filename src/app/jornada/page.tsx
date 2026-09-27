import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { carregarJornada } from "@/lib/dados";
import { CAPITULOS, FASES } from "@/content";
import { tetoDoDia, textoBloqueio, TOTAL_CAPITULOS, CAPITULOS_GRATIS } from "@/lib/ritmo";
import { Cabecalho } from "@/components/Cabecalho";
import { Navegacao } from "@/components/Navegacao";

export const metadata: Metadata = { title: "Sua jornada" };
export const dynamic = "force-dynamic";

export default async function Jornada() {
  const j = await carregarJornada();
  if (!j) redirect("/entrar");

  const saldo = Math.max(0, j.teto - j.concluidos.length);
  const capAtual = CAPITULOS.find((c) => c.n === j.proximo);
  const faseAtual = FASES.find((f) => capAtual && capAtual.fase === f.n);

  return (
    <>
      <Cabecalho direita={
        <span className="chip" title="Dias desde o início">Dia {j.dia}</span>
      } />

      <main className="max-w-2xl mx-auto px-page pt-6 pb-28">
        {/* ---------------------------------------------------- resumo */}
        <section className="rise">
          <p className="text-[13px] mb-1" style={{ color: "var(--ink-3)" }}>
            {j.perfil.nome ? `Olá, ${j.perfil.nome.split(" ")[0]}.` : "Olá."}
          </p>
          <h1 className="font-serif text-[1.85rem] leading-tight mb-4">
            {j.concluidos.length === 0
              ? "Comece pelo Dia 1."
              : j.concluidos.length === TOTAL_CAPITULOS
              ? "Você concluiu os 30 capítulos."
              : `Você está no capítulo ${j.proximo}.`}
          </h1>

          <div className="card p-4 mb-3">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[13px]" style={{ color: "var(--ink-2)" }}>
                {j.concluidos.length} de {TOTAL_CAPITULOS} concluídos
              </span>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--accent)" }}>
                {j.progressoPct}%
              </span>
            </div>
            <div className="track"><i style={{ width: `${j.progressoPct}%` }} /></div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t hair">
              <Metrica valor={String(j.streak)} rotulo="dias seguidos" />
              <Metrica valor={String(saldo)} rotulo={saldo === 1 ? "liberado hoje" : "liberados hoje"} />
              <Metrica valor={`${TOTAL_CAPITULOS - j.concluidos.length}`} rotulo="restantes" />
            </div>
          </div>

          {/* regra do ritmo, explicada */}
          <div className="card p-3.5 mb-6 flex gap-3 items-start">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--accent)"
                 strokeWidth="1.6" className="shrink-0 mt-0.5">
              <circle cx="10" cy="10" r="7.5" /><path d="M10 6v4.5l3 1.8" strokeLinecap="round" />
            </svg>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
              <b style={{ color: "var(--ink-2)" }}>Um capítulo por dia é o ritmo sugerido.</b>{" "}
              Você pode adiantar — hoje até o capítulo {tetoDoDia(j.dia)} — mas a jornada não termina
              em menos de 7 dias. Presença se constrói com repetição, não com maratona.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------- destaque */}
        {capAtual && (
          <Link href={`/dia/${capAtual.n}`} className="block mb-8 rise">
            <article className="card overflow-hidden transition hover:border-[var(--accent)]"
                     style={{ borderColor: "var(--accent)" }}>
              <div className="px-4 py-2 flex items-center justify-between"
                   style={{ background: "var(--accent-dim)" }}>
                <span className="text-[10.5px] font-bold uppercase tracking-[.1em]" style={{ color: "var(--accent)" }}>
                  Capítulo de hoje
                </span>
                <span className="text-[10.5px]" style={{ color: "var(--accent)" }}>
                  {capAtual.leituraMin} min
                </span>
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-3)" }}>
                  Dia {capAtual.n} · {faseAtual?.nome}
                </div>
                <h2 className="font-serif text-[1.4rem] leading-tight mb-2">{capAtual.tema}</h2>
                <p className="text-[14px] leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>
                  {capAtual.subtitulo}
                </p>
                <p className="font-serif italic text-[1.06rem] leading-snug pl-3 border-l-2"
                   style={{ color: "var(--accent-2)", borderColor: "var(--accent)" }}>
                  “{capAtual.frase}”
                </p>
              </div>
            </article>
          </Link>
        )}

        {/* ------------------------------------------------ as 5 fases */}
        {FASES.map((fase) => {
          const caps = CAPITULOS.filter((c) => c.fase === fase.n);
          const feitos = caps.filter((c) => j.concluidos.includes(c.n)).length;
          return (
            <section key={fase.n} className="mb-8">
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="font-serif text-[1.65rem] leading-none" style={{ color: "var(--accent)" }}>
                  {fase.n}
                </span>
                <h3 className="font-serif text-[1.28rem]">{fase.nome}</h3>
                <span className="ml-auto text-[11.5px] tabular-nums" style={{ color: "var(--ink-3)" }}>
                  {feitos}/{caps.length}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed mb-3.5 pl-[30px]" style={{ color: "var(--ink-3)" }}>
                {fase.promessa}
              </p>

              <ul className="space-y-2">
                {caps.map((cap) => {
                  const g = j.gating.find((x) => x.n === cap.n)!;
                  return <ItemCapitulo key={cap.n} cap={cap} estado={g} dia={j.dia} />;
                })}
              </ul>
            </section>
          );
        })}

        {!j.assinaturaAtiva && (
          <Link href="/assinatura" className="block card p-4 text-center mt-2"
                style={{ borderColor: "var(--accent)" }}>
            <p className="text-[14px] font-semibold mb-1">
              Capítulos 1 a {CAPITULOS_GRATIS} são livres.
            </p>
            <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
              A partir do Dia {CAPITULOS_GRATIS + 1}, assine por R$ 19,90/mês →
            </p>
          </Link>
        )}
      </main>

      <Navegacao admin={j.perfil.role === "admin"} />
    </>
  );
}

function Metrica({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div>
      <div className="font-serif text-[1.65rem] leading-none" style={{ color: "var(--accent)" }}>{valor}</div>
      <div className="text-[11px] mt-1" style={{ color: "var(--ink-3)" }}>{rotulo}</div>
    </div>
  );
}

function ItemCapitulo({ cap, estado, dia }: {
  cap: (typeof CAPITULOS)[number];
  estado: { liberado: boolean; concluido: boolean; motivo: string | null };
  dia: number;
}) {
  const conteudo = (
    <div className="flex gap-3 items-start p-3 rounded-xl border transition"
         style={{
           borderColor: estado.concluido ? "var(--line-soft)" : estado.liberado ? "var(--line)" : "var(--line-soft)",
           background: estado.liberado && !estado.concluido ? "var(--surface)" : "transparent",
           opacity: estado.liberado ? 1 : 0.45,
         }}>
      <span className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[11.5px] font-bold border"
            style={{
              borderColor: estado.concluido ? "var(--pos)" : estado.liberado ? "var(--accent)" : "var(--line)",
              color: estado.concluido ? "var(--pos)" : estado.liberado ? "var(--accent)" : "var(--ink-3)",
              background: estado.liberado && !estado.concluido ? "var(--accent-dim)" : "transparent",
            }}>
        {estado.concluido ? "✓" : estado.liberado ? cap.n : "🔒"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-medium leading-snug"
             style={{ color: estado.concluido ? "var(--ink-2)" : "var(--ink)" }}>
          {cap.tema}
        </div>
        <div className="text-[12px] mt-0.5 leading-snug" style={{ color: "var(--ink-3)" }}>
          {estado.liberado ? cap.subtitulo : textoBloqueio(estado.motivo as never, dia)}
        </div>
      </div>
      {estado.liberado && (
        <span className="shrink-0 text-[11px] tabular-nums mt-1" style={{ color: "var(--ink-3)" }}>
          {cap.leituraMin}′
        </span>
      )}
    </div>
  );

  return <li>{estado.liberado ? <Link href={`/dia/${cap.n}`}>{conteudo}</Link> : conteudo}</li>;
}
