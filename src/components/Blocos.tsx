import type { Block, CalloutKind, Ilustracao } from "@/content/types";
import { Diagrama } from "./Diagramas";
import { Grafico } from "./Graficos";

const CALLOUT: Record<CalloutKind, { rotulo: string; cor: string; fundo: string }> = {
  tese:    { rotulo: "A tese",     cor: "var(--accent)", fundo: "var(--accent-dim)" },
  insight: { rotulo: "Insight",    cor: "var(--info)",   fundo: "color-mix(in srgb, var(--info) 12%, transparent)" },
  alerta:  { rotulo: "Cuidado",    cor: "var(--neg)",    fundo: "color-mix(in srgb, var(--neg) 12%, transparent)" },
  pratica: { rotulo: "Na prática", cor: "var(--pos)",    fundo: "color-mix(in srgb, var(--pos) 12%, transparent)" },
  citacao: { rotulo: "Do dossiê",  cor: "var(--ink-2)",  fundo: "var(--surface-2)" },
};

function Bloco({ b }: { b: Block }) {
  switch (b.t) {
    case "p":
      return <p>{b.text}</p>;

    case "lead":
      return (
        <p className="font-serif text-xl leading-relaxed my-5" style={{ color: "var(--ink)" }}>
          {b.text}
        </p>
      );

    case "h":
      return (
        <h3 className="font-serif text-[1.4rem] mt-9 mb-3 leading-snug" style={{ color: "var(--ink)" }}>
          {b.text}
        </h3>
      );

    case "quote":
      return (
        <blockquote className="my-7 pl-5 border-l-2" style={{ borderColor: "var(--accent)" }}>
          <p className="font-serif text-lg leading-relaxed italic" style={{ color: "var(--ink)" }}>
            “{b.text}”
          </p>
          {b.fonte && (
            <cite className="block mt-2 text-xs not-italic" style={{ color: "var(--ink-3)" }}>
              — {b.fonte}
            </cite>
          )}
        </blockquote>
      );

    case "callout": {
      const s = CALLOUT[b.kind];
      return (
        <aside className="my-7 rounded-xl p-4 border-l-[3px]"
               style={{ background: s.fundo, borderColor: s.cor }}>
          <div className="text-[10.5px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: s.cor }}>
            {s.rotulo}
          </div>
          <div className="text-[15px] font-semibold mb-1" style={{ color: "var(--ink)" }}>{b.titulo}</div>
          <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{b.texto}</p>
        </aside>
      );
    }

    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className="my-5 space-y-2.5">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              <span className="shrink-0 mt-[7px] tabular-nums text-[11px] font-bold"
                    style={{ color: "var(--accent)", minWidth: b.ordered ? "1.1rem" : "auto" }}>
                {b.ordered ? `${i + 1}.` : "—"}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </Tag>
      );
    }

    case "checklist":
      return (
        <div className="card my-7 p-4">
          {b.titulo && (
            <div className="text-[11px] font-bold uppercase tracking-[.09em] mb-3" style={{ color: "var(--ink-3)" }}>
              {b.titulo}
            </div>
          )}
          <ul className="space-y-2.5">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-3 items-start text-[14.5px]" style={{ color: "var(--ink-2)" }}>
                <span className="shrink-0 w-4 h-4 mt-[3px] rounded border grid place-items-center text-[9px]"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>✓</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "steps":
      return (
        <ol className="my-7 space-y-0">
          {b.items.map((s, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center shrink-0">
                <span className="w-8 h-8 rounded-full grid place-items-center text-[13px] font-bold border"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-dim)" }}>
                  {i + 1}
                </span>
                {i < b.items.length - 1 && <span className="w-px flex-1 my-1" style={{ background: "var(--line)" }} />}
              </div>
              <div className="pb-6">
                <div className="text-[15px] font-semibold mb-1" style={{ color: "var(--ink)" }}>{s.titulo}</div>
                <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{s.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    case "def":
      return (
        <div className="my-7 rounded-xl border p-4" style={{ borderColor: "var(--line)", background: "var(--bg-2)" }}>
          <div className="font-serif text-lg mb-1" style={{ color: "var(--accent)" }}>{b.termo}</div>
          <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{b.texto}</p>
        </div>
      );

    case "table":
      return (
        <figure className="card my-7 overflow-hidden">
          {b.caption && (
            <figcaption className="px-4 py-2.5 border-b hair text-[11px] font-semibold uppercase tracking-[.09em]"
                        style={{ color: "var(--ink-3)" }}>{b.caption}</figcaption>
          )}
          <div className="scroll-x">
            <table className="w-full text-[14px] border-collapse min-w-[440px]">
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {b.head.map((h, i) => (
                    <th key={i} className="text-left px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wide"
                        style={{ color: "var(--ink-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
                    {r.map((c, j) => (
                      <td key={j} className="px-3.5 py-3 align-top leading-snug"
                          style={{ color: j === 0 ? "var(--ink)" : "var(--ink-2)",
                                   fontWeight: j === 0 ? 600 : 400 }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );

    case "compare":
      return (
        <div className="my-7 grid gap-3 sm:grid-cols-2">
          {[b.esquerda, b.direita].map((l, i) => {
            const cor = l.tom === "pos" ? "var(--pos)" : "var(--neg)";
            return (
              <div key={i} className="rounded-xl border p-4"
                   style={{ borderColor: cor, background: `color-mix(in srgb, ${cor} 8%, transparent)` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm" style={{ color: cor }}>{l.tom === "pos" ? "✓" : "✕"}</span>
                  <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color: cor }}>{l.titulo}</span>
                </div>
                <ul className="space-y-2">
                  {l.items.map((it, j) => (
                    <li key={j} className="text-[13.5px] leading-snug" style={{ color: "var(--ink-2)" }}>{it}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      );

    case "stats":
      return (
        <div className="my-7 grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))` }}>
          {b.items.map((s, i) => (
            <div key={i} className="card p-4">
              <div className="font-serif text-3xl leading-none mb-1.5" style={{ color: "var(--accent)" }}>{s.valor}</div>
              <div className="text-[12.5px] font-medium leading-snug" style={{ color: "var(--ink)" }}>{s.rotulo}</div>
              {s.nota && <div className="text-[11px] mt-1" style={{ color: "var(--ink-3)" }}>{s.nota}</div>}
            </div>
          ))}
        </div>
      );

    case "example":
      return (
        <div className="card my-7 overflow-hidden">
          <div className="px-4 py-2.5 border-b hair text-[11px] font-bold uppercase tracking-[.09em]"
               style={{ color: "var(--ink-3)" }}>{b.titulo}</div>
          <div className="divide-y" style={{ borderColor: "var(--line-soft)" }}>
            <div className="p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--neg)" }}>
                genérico
              </div>
              <p className="text-[14.5px] leading-relaxed line-through decoration-1 opacity-70"
                 style={{ color: "var(--ink-2)" }}>{b.ruim}</p>
            </div>
            <div className="p-4" style={{ background: "color-mix(in srgb, var(--pos) 7%, transparent)" }}>
              <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pos)" }}>
                singular
              </div>
              <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink)" }}>{b.bom}</p>
            </div>
            <div className="p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-3)" }}>
                por quê
              </div>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{b.porque}</p>
            </div>
          </div>
        </div>
      );

    case "diagram": return <Diagrama d={b.diagram} />;
    case "chart":   return <Grafico c={b.chart} />;
  }
}

export function Conteudo({ blocos }: { blocos: Block[] }) {
  return (
    <div className="prosa">
      {blocos.map((b, i) => <Bloco key={i} b={b} />)}
    </div>
  );
}

/* ==================== ILUSTRAÇÃO DE ABERTURA ==================== */

const MOTIVOS: Record<Ilustracao["motivo"], React.ReactNode> = {
  espelho: (<>
    <ellipse cx="60" cy="60" rx="30" ry="40" fill="none" strokeWidth="1.5" />
    <ellipse cx="60" cy="60" rx="22" ry="32" fill="currentColor" opacity=".08" />
    <path d="M46 48 q14 -8 28 0" strokeWidth="1.2" fill="none" opacity=".5" />
    <circle cx="60" cy="62" r="7" fill="currentColor" opacity=".35" />
  </>),
  ponte: (<>
    <path d="M14 76 h92" strokeWidth="1.5" />
    <path d="M14 76 q46 -46 92 0" strokeWidth="2" fill="none" />
    {[28, 46, 60, 74, 92].map((x, i) => <line key={i} x1={x} y1="76" x2={x} y2={76 - [16, 27, 30, 27, 16][i]} strokeWidth="1" opacity=".55" />)}
  </>),
  iceberg: (<>
    <path d="M60 20 L92 62 H28 Z" fill="currentColor" opacity=".22" strokeWidth="1.5" />
    <line x1="12" y1="62" x2="108" y2="62" strokeWidth="1.2" strokeDasharray="4 4" />
    <path d="M28 62 L18 92 h84 L92 62 Z" fill="currentColor" opacity=".07" strokeWidth="1.2" />
  </>),
  megafone: (<>
    <path d="M30 50 h18 L76 32 v56 L48 70 H30 Z" fill="currentColor" opacity=".14" strokeWidth="1.5" />
    <path d="M84 44 q10 16 0 32" strokeWidth="1.4" fill="none" opacity=".7" />
    <path d="M94 36 q16 24 0 48" strokeWidth="1.2" fill="none" opacity=".4" />
  </>),
  raizes: (<>
    <line x1="60" y1="18" x2="60" y2="58" strokeWidth="2" />
    <path d="M60 34 q-16 -10 -24 -18 M60 34 q16 -10 24 -18" strokeWidth="1.2" fill="none" opacity=".6" />
    <path d="M60 58 q-20 12 -30 34 M60 58 q20 12 30 34 M60 58 v36 M60 58 q-8 18 -6 36 M60 58 q8 18 6 36"
          strokeWidth="1.2" fill="none" opacity=".55" />
  </>),
  chave: (<>
    <circle cx="42" cy="52" r="18" fill="none" strokeWidth="2" />
    <circle cx="42" cy="52" r="7" fill="currentColor" opacity=".2" />
    <path d="M55 65 L92 92 M78 78 l10 -10 M86 86 l8 -8" strokeWidth="2" fill="none" />
  </>),
  lente: (<>
    <circle cx="52" cy="50" r="26" fill="currentColor" opacity=".08" strokeWidth="2" />
    <path d="M40 50 h24 M52 38 v24" strokeWidth="1.2" opacity=".45" />
    <line x1="71" y1="69" x2="96" y2="94" strokeWidth="2.5" strokeLinecap="round" />
  </>),
  prisma: (<>
    <path d="M60 24 L92 82 H28 Z" fill="currentColor" opacity=".1" strokeWidth="1.5" />
    <line x1="8" y1="58" x2="46" y2="58" strokeWidth="1.5" />
    {[-10, -3, 4, 11].map((d, i) => (
      <line key={i} x1="74" y1={58 + d * .4} x2="112" y2={58 + d * 2.2} strokeWidth="1.3" opacity={.8 - i * .15} />
    ))}
  </>),
  semente: (<>
    <path d="M60 92 v-30" strokeWidth="2" />
    <path d="M60 66 q-22 -6 -22 -26 q22 2 22 26 Z" fill="currentColor" opacity=".16" strokeWidth="1.3" />
    <path d="M60 58 q22 -8 22 -30 q-22 4 -22 30 Z" fill="currentColor" opacity=".1" strokeWidth="1.3" />
    <path d="M40 92 h40" strokeWidth="1.5" strokeDasharray="3 4" />
  </>),
  engrenagem: (<>
    <circle cx="60" cy="56" r="20" fill="none" strokeWidth="2" />
    <circle cx="60" cy="56" r="8" fill="currentColor" opacity=".2" />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <line key={i} x1={60 + Math.cos(a) * 21} y1={56 + Math.sin(a) * 21}
                   x2={60 + Math.cos(a) * 30} y2={56 + Math.sin(a) * 30} strokeWidth="2.5" strokeLinecap="round" />;
    })}
  </>),
  mapa: (<>
    <path d="M20 30 L48 22 L74 34 L100 24 v66 L74 100 L48 88 L20 96 Z" fill="currentColor" opacity=".07" strokeWidth="1.4" />
    <line x1="48" y1="22" x2="48" y2="88" strokeWidth="1" opacity=".4" />
    <line x1="74" y1="34" x2="74" y2="100" strokeWidth="1" opacity=".4" />
    <circle cx="62" cy="58" r="5" fill="currentColor" opacity=".7" />
  </>),
  farol: (<>
    <path d="M50 88 L54 40 h12 l4 48 Z" fill="currentColor" opacity=".13" strokeWidth="1.5" />
    <rect x="52" y="28" width="16" height="13" rx="2" fill="currentColor" opacity=".3" strokeWidth="1.2" />
    <path d="M52 34 L16 20 M52 40 L16 50 M68 34 L104 20 M68 40 L104 50" strokeWidth="1.1" opacity=".45" />
    <line x1="38" y1="88" x2="82" y2="88" strokeWidth="1.8" />
  </>),
  colheita: (<>
    {[30, 47, 64, 81].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="92" x2={x} y2={54 - i * 3} strokeWidth="1.6" />
        <path d={`M${x} ${58 - i * 3} q-9 -8 -9 -18 q9 3 9 18 Z`} fill="currentColor" opacity=".16" strokeWidth="1" />
        <path d={`M${x} ${54 - i * 3} q9 -8 9 -18 q-9 3 -9 18 Z`} fill="currentColor" opacity=".16" strokeWidth="1" />
      </g>
    ))}
    <line x1="18" y1="92" x2="102" y2="92" strokeWidth="1.5" />
  </>),
  "impressao-digital": (<>
    {[13, 20, 27, 34].map((r, i) => (
      <path key={i} d={`M${60 - r} 60 a${r} ${r * 1.25} 0 0 1 ${r * 2} 0`} fill="none" strokeWidth="1.5" opacity={.9 - i * .16} />
    ))}
    {[13, 20, 27].map((r, i) => (
      <path key={`b${i}`} d={`M${60 - r} 62 a${r} ${r * 1.1} 0 0 0 ${r * 2} 0`} fill="none" strokeWidth="1.4" opacity={.7 - i * .16} />
    ))}
  </>),
  territorio: (<>
    <path d="M18 84 L34 44 L58 62 L76 26 L102 84 Z" fill="currentColor" opacity=".1" strokeWidth="1.5" />
    <path d="M76 26 v-12 l20 6 -20 8" fill="currentColor" opacity=".55" strokeWidth="1.2" />
    <line x1="12" y1="84" x2="108" y2="84" strokeWidth="1.8" />
  </>),
};

export function IlustracaoCapitulo({ ilustracao }: { ilustracao: Ilustracao }) {
  return (
    <figure className="my-8 flex flex-col items-center">
      <svg viewBox="0 0 120 110" className="w-[136px] h-[124px]"
           stroke="var(--accent)" fill="none" strokeLinecap="round" strokeLinejoin="round"
           style={{ color: "var(--accent)" }} role="img" aria-label={ilustracao.legenda}>
        {MOTIVOS[ilustracao.motivo]}
      </svg>
      <figcaption className="mt-2 text-center text-[12.5px] max-w-xs leading-snug italic"
                  style={{ color: "var(--ink-3)" }}>
        {ilustracao.legenda}
      </figcaption>
    </figure>
  );
}
