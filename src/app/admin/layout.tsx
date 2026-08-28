import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/dados";
import { Cabecalho } from "@/components/Cabecalho";
import { Navegacao } from "@/components/Navegacao";

export const dynamic = "force-dynamic";

const ABAS = [
  { href: "/admin", rotulo: "Visão geral" },
  { href: "/admin/capitulos", rotulo: "Capítulos" },
  { href: "/admin/assinantes", rotulo: "Assinantes" },
  { href: "/admin/config", rotulo: "Ajustes" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/jornada");

  return (
    <>
      <Cabecalho direita={<span className="chip" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>gestão</span>} />
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <nav className="scroll-x flex gap-1.5 pb-3 border-b hair mb-5">
          {ABAS.map((a) => (
            <Link key={a.href} href={a.href}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition"
                  style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
              {a.rotulo}
            </Link>
          ))}
        </nav>
      </div>
      <main className="max-w-4xl mx-auto px-4 pb-28">{children}</main>
      <Navegacao admin />
    </>
  );
}
