"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/jornada",       rotulo: "Jornada",  icone: "M3 5h14M3 10h14M3 15h9" },
  { href: "/materia-prima", rotulo: "Matéria",  icone: "M10 3v14M3 10h14" },
  { href: "/perfil",        rotulo: "Perfil",   icone: "M10 10a3.2 3.2 0 100-6.4A3.2 3.2 0 0010 10zm0 1.6c-3 0-5.6 1.7-5.6 3.8V17h11.2v-1.6c0-2.1-2.6-3.8-5.6-3.8z" },
];

export function Navegacao({ admin }: { admin?: boolean }) {
  const path = usePathname();
  const itens = admin ? [...ITENS, { href: "/admin", rotulo: "Gestão", icone: "M10 3l6 3.5v7L10 17l-6-3.5v-7L10 3z" }] : ITENS;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t safe-b"
         style={{ background: "color-mix(in srgb, var(--bg) 92%, transparent)", backdropFilter: "blur(14px)" }}>
      <div className="max-w-2xl mx-auto grid" style={{ gridTemplateColumns: `repeat(${itens.length},1fr)` }}>
        {itens.map((i) => {
          const ativo = path === i.href || path.startsWith(i.href + "/");
          return (
            <Link key={i.href} href={i.href}
                  className="flex flex-col items-center gap-1 py-2.5 transition"
                  style={{ color: ativo ? "var(--accent)" : "var(--ink-3)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                   stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={i.icone} />
              </svg>
              <span className="text-[10.5px] font-semibold">{i.rotulo}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
