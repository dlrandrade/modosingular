import { createAdminClient } from "@/lib/supabase/admin";
import { CAPITULOS, FASES } from "@/content";
import { EditorCapitulos } from "./Editor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Capítulos · Gestão" };
export const dynamic = "force-dynamic";

export default async function AdminCapitulos() {
  const db = createAdminClient();
  const { data } = await db.from("chapter_settings").select("*").order("chapter");

  const cfg = Object.fromEntries((data ?? []).map((c) => [c.chapter, c]));
  const lista = CAPITULOS.map((c) => ({
    n: c.n,
    tema: c.tema,
    fase: FASES.find((f) => f.n === c.fase)!.nome,
    video_url: cfg[c.n]?.video_url ?? "",
    video_provider: cfg[c.n]?.video_provider ?? "",
    nota_admin: cfg[c.n]?.nota_admin ?? "",
    publicado: cfg[c.n]?.publicado ?? true,
  }));

  return (
    <>
      <h1 className="font-serif text-2xl mb-1.5">Capítulos</h1>
      <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: "var(--ink-3)" }}>
        O texto, os diagramas, o quiz e as tarefas vivem no código — versionados e estáveis.
        Aqui você gerencia o que muda: o vídeo de cada dia e recados pontuais.
      </p>
      <EditorCapitulos capitulos={lista} />
    </>
  );
}
