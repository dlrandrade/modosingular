import { createAdminClient } from "@/lib/supabase/admin";
import { TOTAL_CAPITULOS } from "@/lib/ritmo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gestão" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = createAdminClient();

  const [usuarios, ativos, concluidos, tarefas, eventos, capsComVideo] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
    db.from("chapter_progress").select("id", { count: "exact", head: true }).eq("state", "completed"),
    db.from("task_submissions").select("id", { count: "exact", head: true }).neq("state", "draft"),
    db.from("kiwify_events").select("*").order("created_at", { ascending: false }).limit(8),
    db.from("chapter_settings").select("chapter", { count: "exact", head: true }).not("video_url", "is", null),
  ]);

  const totalUsuarios = usuarios.count ?? 0;
  const totalAtivos = ativos.count ?? 0;
  const mrr = (totalAtivos * 19.9).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <h1 className="font-serif text-[1.65rem] mb-5">Visão geral</h1>

      <div className="grid gap-3 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
        <Kpi valor={String(totalUsuarios)} rotulo="cadastrados" />
        <Kpi valor={String(totalAtivos)} rotulo="assinantes ativos" destaque />
        <Kpi valor={mrr} rotulo="receita recorrente" destaque />
        <Kpi valor={String(concluidos.count ?? 0)} rotulo="capítulos concluídos" />
        <Kpi valor={String(tarefas.count ?? 0)} rotulo="tarefas entregues" />
        <Kpi valor={`${capsComVideo.count ?? 0}/${TOTAL_CAPITULOS}`} rotulo="capítulos com vídeo" />
      </div>

      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-serif text-[1.28rem]">Últimos eventos da Kiwify</h2>
          <Link href="/admin/assinantes" className="text-[13px]" style={{ color: "var(--accent)" }}>
            ver assinantes →
          </Link>
        </div>
        {(eventos.data ?? []).length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-[14px] mb-1" style={{ color: "var(--ink-2)" }}>Nenhum evento recebido ainda.</p>
            <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
              Configure o webhook na Kiwify apontando para <code>/api/kiwify/webhook</code>.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden scroll-x">
            <table className="w-full text-[13px] min-w-[560px]">
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Quando", "Evento", "E-mail", "Assinatura", "Status"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold uppercase tracking-wide"
                        style={{ color: "var(--ink-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventos.data!.map((e) => (
                  <tr key={e.id} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
                    <td className="px-3 py-2.5" style={{ color: "var(--ink-3)" }}>
                      {new Date(e.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-2.5">{e.event_type ?? "—"}</td>
                    <td className="px-3 py-2.5" style={{ color: "var(--ink-2)" }}>{e.email ?? "—"}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: "var(--ink-3)" }}>
                      {e.subscription_id?.slice(0, 12) ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span style={{ color: e.signature_ok ? "var(--pos)" : "var(--neg)" }}>
                        {e.signature_ok ? (e.error ? "erro" : "ok") : "assinatura inválida"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Kpi({ valor, rotulo, destaque }: { valor: string; rotulo: string; destaque?: boolean }) {
  return (
    <div className="card p-4">
      <div className="font-serif text-[1.65rem] leading-none mb-1.5"
           style={{ color: destaque ? "var(--accent)" : "var(--ink)" }}>{valor}</div>
      <div className="text-[11.5px] leading-snug" style={{ color: "var(--ink-3)" }}>{rotulo}</div>
    </div>
  );
}
