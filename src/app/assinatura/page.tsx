import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { carregarJornada } from "@/lib/dados";
import { Cabecalho } from "@/components/Cabecalho";
import { CAPITULOS_GRATIS, TOTAL_CAPITULOS } from "@/lib/ritmo";

export const metadata: Metadata = { title: "Assinatura" };
export const dynamic = "force-dynamic";

export default async function Assinatura() {
  const j = await carregarJornada();
  if (!j) redirect("/entrar");

  const supabase = await createClient();
  const { data: cfg } = await supabase
    .from("app_settings").select("key,value").in("key", ["checkout_url", "preco"]);

  const checkout = (cfg?.find((c) => c.key === "checkout_url")?.value as { url?: string })?.url ?? "";
  const preco = (cfg?.find((c) => c.key === "preco")?.value as { label?: string })?.label ?? "R$ 19,90";

  return (
    <>
      <Cabecalho direita={
        <Link href="/jornada" className="text-[13px]" style={{ color: "var(--ink-3)" }}>Jornada</Link>
      } />

      <main className="max-w-lg mx-auto px-page pt-8 pb-16">
        {j.assinaturaAtiva ? (
          <>
            <h1 className="font-serif text-[1.65rem] mb-2">Assinatura ativa</h1>
            <p className="text-[14.5px] leading-relaxed mb-6" style={{ color: "var(--ink-2)" }}>
              Você tem acesso aos {TOTAL_CAPITULOS} capítulos e a tudo que produzir dentro deles.
            </p>
            <div className="card p-4 space-y-2.5">
              <Linha rotulo="Status" valor={j.statusAssinatura} destaque />
              <Linha rotulo="Valor" valor={`${preco}/mês`} />
              <Linha rotulo="E-mail" valor={j.perfil.email ?? "—"} />
            </div>
            <p className="text-[13px] leading-relaxed mt-5" style={{ color: "var(--ink-3)" }}>
              Cancelamento, troca de cartão e notas fiscais são gerenciados pela Kiwify, no e-mail de compra.
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-7">
              <span className="chip mb-3">Capítulo {CAPITULOS_GRATIS + 1} em diante</span>
              <h1 className="font-serif text-[2.05rem] leading-tight mb-3">
                Você já viu como o método funciona.
              </h1>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                Os três primeiros capítulos são o diagnóstico. Os outros 27 são o trabalho —
                descobrir a sua linguagem, montar o sistema e transformar presença em ativo.
              </p>
            </div>

            <div className="card overflow-hidden mb-5" style={{ borderColor: "var(--accent)" }}>
              <div className="p-5 text-center border-b hair">
                <div className="font-serif text-[2.35rem] leading-none mb-1" style={{ color: "var(--accent)" }}>
                  {preco}
                </div>
                <div className="text-[13px]" style={{ color: "var(--ink-3)" }}>por mês · cancele quando quiser</div>
              </div>
              <ul className="p-5 space-y-2.5">
                {[
                  `Os ${TOTAL_CAPITULOS} capítulos, com quiz, teste e tarefa em cada um`,
                  "O Teste da Linguagem Criativa e o seu manual de voz",
                  "Banco de matéria-prima ilimitado, sincronizado entre dispositivos",
                  "Diretrizes de produção e esqueletos prontos por capítulo",
                  "Seu progresso salvo — comece no celular, continue no computador",
                  "Acesso a todo conteúdo novo enquanto a assinatura estiver ativa",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-snug" style={{ color: "var(--ink-2)" }}>
                    <span className="shrink-0 mt-0.5" style={{ color: "var(--accent)" }}>✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            {checkout ? (
              <a href={checkout} target="_blank" rel="noopener noreferrer"
                 className="btn btn-primary w-full mb-3">
                Assinar por {preco}/mês
              </a>
            ) : (
              <div className="card p-4 text-center mb-3">
                <p className="text-[13.5px]" style={{ color: "var(--ink-3)" }}>
                  O link de checkout ainda não foi configurado no painel de gestão.
                </p>
              </div>
            )}

            <p className="text-[12.5px] text-center leading-relaxed" style={{ color: "var(--ink-3)" }}>
              Use o mesmo e-mail desta conta ({j.perfil.email}) no checkout —
              é assim que o acesso é liberado automaticamente.
            </p>

            <Link href="/jornada" className="btn btn-ghost w-full mt-6">Voltar</Link>
          </>
        )}
      </main>
    </>
  );
}

function Linha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3 text-[13.5px]">
      <span style={{ color: "var(--ink-3)" }}>{rotulo}</span>
      <span style={{ color: destaque ? "var(--pos)" : "var(--ink)", fontWeight: 600 }}>{valor}</span>
    </div>
  );
}
