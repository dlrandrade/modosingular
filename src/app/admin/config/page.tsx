import { createAdminClient } from "@/lib/supabase/admin";
import { FormConfig } from "./Form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ajustes · Gestão" };
export const dynamic = "force-dynamic";

export default async function AdminConfig() {
  const db = createAdminClient();
  const { data } = await db.from("app_settings").select("key,value");
  const cfg = Object.fromEntries((data ?? []).map((c) => [c.key, c.value]));

  return (
    <>
      <h1 className="font-serif text-2xl mb-1.5">Ajustes</h1>
      <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: "var(--ink-3)" }}>
        Preço, link de checkout e o aviso que aparece no topo da jornada.
      </p>
      <FormConfig cfg={cfg} />
    </>
  );
}
