import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { carregarJornada } from "@/lib/dados";
import { Cabecalho } from "@/components/Cabecalho";
import { Navegacao } from "@/components/Navegacao";
import { BancoMateriaPrima } from "./Banco";

export const metadata: Metadata = { title: "Matéria-prima" };
export const dynamic = "force-dynamic";

export default async function MateriaPrima() {
  const j = await carregarJornada();
  if (!j) redirect("/entrar");

  const supabase = await createClient();
  const { data } = await supabase
    .from("raw_material").select("*")
    .eq("user_id", j.perfil.id).order("created_at", { ascending: false }).limit(300);

  return (
    <>
      <Cabecalho />
      <main className="max-w-2xl mx-auto px-page pt-6 pb-28">
        <h1 className="font-serif text-2xl mb-1.5">Banco de matéria-prima</h1>
        <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: "var(--ink-3)" }}>
          Capture sem julgar. Não decida agora se serve — julgar durante a captura é o que a encarece.
          O filtro vem depois, em outro momento, com outra cabeça.
        </p>
        <BancoMateriaPrima itens={data ?? []} />
      </main>
      <Navegacao admin={j.perfil.role === "admin"} />
    </>
  );
}
