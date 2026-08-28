import Link from "next/link";
import { Marca } from "./Marca";
import { BotaoTema } from "./BotaoTema";

export function Cabecalho({ direita }: { direita?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b safe-t"
            style={{ background: "color-mix(in srgb, var(--bg) 90%, transparent)", backdropFilter: "blur(14px)" }}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/jornada"><Marca compacto /></Link>
        <div className="flex items-center gap-2">{direita}<BotaoTema /></div>
      </div>
    </header>
  );
}
