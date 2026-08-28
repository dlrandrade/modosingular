import { createAdminClient } from "@/lib/supabase/admin";
import { TabelaAssinantes } from "./Tabela";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Assinantes · Gestão" };
export const dynamic = "force-dynamic";

export default async function AdminAssinantes() {
  const db = createAdminClient();
  const { data } = await db
    .from("admin_subscribers").select("*")
    .order("cadastrado_em", { ascending: false }).limit(500);

  return (
    <>
      <h1 className="font-serif text-2xl mb-1.5">Assinantes</h1>
      <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: "var(--ink-3)" }}>
        Reenvio de senha, liberação manual de acesso, reinício de jornada e promoção a administrador.
      </p>
      <TabelaAssinantes linhas={data ?? []} />
    </>
  );
}
