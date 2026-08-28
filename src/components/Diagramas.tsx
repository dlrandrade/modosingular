import type { Diagram } from "@/content/types";

/* Paleta usada dentro dos SVGs — segue as variáveis do tema. */
const C = {
  ink: "var(--ink)", ink2: "var(--ink-2)", ink3: "var(--ink-3)",
  line: "var(--line)", surf: "var(--surface-2)",
  acc: "var(--accent)", pos: "var(--pos)", neg: "var(--neg)", info: "var(--info)",
};

function Moldura({ titulo, children, alturaMin }: {
  titulo: string; children: React.ReactNode; alturaMin?: number;
}) {
  return (
    <figure className="card my-7 overflow-hidden">
      <figcaption className="px-4 py-2.5 border-b hair text-[11px] font-semibold uppercase tracking-[.09em]"
                  style={{ color: C.ink3 }}>
        {titulo}
      </figcaption>
      <div className="scroll-x p-4" style={{ minHeight: alturaMin }}>{children}</div>
    </figure>
  );
}

/* ---------------------------- GAP (autoridade real x percebida) --------- */
function Gap({ d }: { d: Extract<Diagram, { kind: "gap" }> }) {
  const max = Math.max(d.a.valor, d.b.valor, 1);
  const linhas = [d.a, d.b];
  return (
    <Moldura titulo={d.titulo}>
      <div className="space-y-4">
        {linhas.map((l, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-sm font-medium" style={{ color: C.ink }}>{l.rotulo}</span>
              <span className="text-xs tabular-nums" style={{ color: C.ink3 }}>{l.valor}%</span>
            </div>
            <div className="h-2.5 rounded-full" style={{ background: "var(--line-soft)" }}>
              <div className="h-full rounded-full transition-all"
                   style={{ width: `${(l.valor / max) * 100}%`, background: i === 0 ? C.acc : C.ink3 }} />
            </div>
            {l.nota && <p className="text-xs mt-1.5" style={{ color: C.ink3 }}>{l.nota}</p>}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 border-t border-dashed" />
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded"
                style={{ color: C.acc, background: "var(--accent-dim)" }}>
            a distância = {Math.abs(d.a.valor - d.b.valor)} pontos
          </span>
          <div className="flex-1 border-t border-dashed" />
        </div>
        {d.legenda && <p className="text-xs text-center" style={{ color: C.ink3 }}>{d.legenda}</p>}
      </div>
    </Moldura>
  );
}

/* ------------------------------- FUNIL --------------------------------- */
function Funil({ d }: { d: Extract<Diagram, { kind: "funil" }> }) {
  const n = d.etapas.length;
  return (
    <Moldura titulo={d.titulo}>
      <div className="space-y-1.5">
        {d.etapas.map((e, i) => {
          const w = 100 - (i * 55) / Math.max(n - 1, 1);
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="text-[11px] tabular-nums w-4 shrink-0" style={{ color: C.ink3 }}>{i + 1}</div>
              <div className="rounded-md px-3 py-2.5 border transition-all"
                   style={{ width: `${w}%`, minWidth: 130,
                            background: i === n - 1 ? "var(--accent-dim)" : C.surf,
                            borderColor: i === n - 1 ? C.acc : C.line }}>
                <div className="text-sm font-medium truncate" style={{ color: C.ink }}>{e.rotulo}</div>
                {e.nota && <div className="text-[11px] mt-0.5" style={{ color: C.ink3 }}>{e.nota}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Moldura>
  );
}

/* ----------------------------- QUADRANTE ------------------------------- */
function Quadrante({ d }: { d: Extract<Diagram, { kind: "quadrante" }> }) {
  const S = 300, P = 34;
  const px = (v: number) => P + (v / 100) * (S - P * 2);
  const py = (v: number) => S - P - (v / 100) * (S - P * 2);
  return (
    <Moldura titulo={d.titulo}>
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full" style={{ maxWidth: 380, margin: "0 auto", display: "block" }}
           role="img" aria-label={d.titulo}>
        <rect x={P} y={P} width={S - P * 2} height={S - P * 2} fill="var(--bg-2)" stroke={C.line} rx="4" />
        <line x1={S / 2} y1={P} x2={S / 2} y2={S - P} stroke={C.line} strokeDasharray="3 4" />
        <line x1={P} y1={S / 2} x2={S - P} y2={S / 2} stroke={C.line} strokeDasharray="3 4" />
        <text x={S / 2} y={S - 10} textAnchor="middle" fontSize="10" fill={C.ink3}>{d.eixoX[1]}</text>
        <text x={S / 2} y={20} textAnchor="middle" fontSize="10" fill={C.ink3}>{d.eixoY[1]}</text>
        <text x={10} y={S / 2} fontSize="10" fill={C.ink3} transform={`rotate(-90 10 ${S / 2})`} textAnchor="middle">{d.eixoY[0]}</text>
        <text x={P} y={S - 10} fontSize="10" fill={C.ink3}>{d.eixoX[0]}</text>
        {d.pontos.map((p, i) => (
          <g key={i}>
            <circle cx={px(p.x)} cy={py(p.y)} r={p.destaque ? 7 : 4.5}
                    fill={p.destaque ? C.acc : C.ink3}
                    stroke={p.destaque ? "var(--bg)" : "none"} strokeWidth="2" />
            <text x={px(p.x)} y={py(p.y) - (p.destaque ? 13 : 10)} textAnchor="middle"
                  fontSize="10.5" fontWeight={p.destaque ? 700 : 400}
                  fill={p.destaque ? C.acc : C.ink2}>{p.rotulo}</text>
          </g>
        ))}
      </svg>
    </Moldura>
  );
}

/* ------------------------------- FLUXO --------------------------------- */
function Fluxo({ d }: { d: Extract<Diagram, { kind: "fluxo" }> }) {
  return (
    <Moldura titulo={d.titulo}>
      <div className="flex flex-col gap-0">
        {d.nos.map((no, i) => (
          <div key={i}>
            <div className="flex gap-3 items-start">
              <div className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold border"
                   style={{ borderColor: C.acc, color: C.acc, background: "var(--accent-dim)" }}>
                {i + 1}
              </div>
              <div className="pb-1">
                <div className="text-sm font-medium" style={{ color: C.ink }}>{no.rotulo}</div>
                {no.nota && <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{no.nota}</div>}
              </div>
            </div>
            {i < d.nos.length - 1 && (
              <div className="ml-[13px] h-5 w-px" style={{ background: C.line }} />
            )}
          </div>
        ))}
        {d.ciclico && (
          <div className="ml-[13px] mt-1 pl-4 border-l border-dashed text-[11px] italic py-1"
               style={{ color: C.acc }}>
            ↺ e recomeça — o ciclo é o produto, não o post
          </div>
        )}
      </div>
    </Moldura>
  );
}

/* ------------------------------ CAMADAS -------------------------------- */
function Camadas({ d }: { d: Extract<Diagram, { kind: "camadas" }> }) {
  const n = d.camadas.length;
  return (
    <Moldura titulo={d.titulo}>
      <div className="space-y-1">
        {d.camadas.map((c, i) => {
          const base = i === n - 1;
          return (
            <div key={i} className="rounded-md px-3.5 py-3 border"
                 style={{
                   marginInline: `${i * 6}px`,
                   background: base ? "var(--accent-dim)" : C.surf,
                   borderColor: base ? C.acc : C.line,
                 }}>
              <div className="text-sm font-medium" style={{ color: base ? C.acc : C.ink }}>{c.rotulo}</div>
              {c.nota && <div className="text-xs mt-0.5" style={{ color: C.ink3 }}>{c.nota}</div>}
            </div>
          );
        })}
        <p className="text-[11px] pt-1.5" style={{ color: C.ink3 }}>
          A base sustenta tudo que está acima. Inverter a ordem é o erro mais comum.
        </p>
      </div>
    </Moldura>
  );
}

/* ------------------------------ ESPECTRO ------------------------------- */
function Espectro({ d }: { d: Extract<Diagram, { kind: "espectro" }> }) {
  return (
    <Moldura titulo={d.titulo}>
      <div className="pt-8 pb-2 px-2">
        <div className="relative h-1.5 rounded-full"
             style={{ background: `linear-gradient(90deg, ${C.neg}, ${C.line}, ${C.pos})` }}>
          {d.marcas.map((m, i) => (
            <div key={i} className="absolute -top-1 flex flex-col items-center"
                 style={{ left: `${m.pos}%`, transform: "translateX(-50%)" }}>
              <div className="w-3.5 h-3.5 rounded-full border-2"
                   style={{ background: "var(--bg)", borderColor: C.acc }} />
              <span className="absolute -top-6 whitespace-nowrap text-[10.5px] font-medium"
                    style={{ color: C.ink2 }}>{m.rotulo}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[11px]" style={{ color: C.ink3 }}>
          <span>{d.esquerda}</span><span>{d.direita}</span>
        </div>
      </div>
    </Moldura>
  );
}

/* ------------------------------- BALANÇA ------------------------------- */
function Balanca({ d }: { d: Extract<Diagram, { kind: "balanca" }> }) {
  const total = d.esquerda.peso + d.direita.peso || 1;
  const incl = ((d.direita.peso - d.esquerda.peso) / total) * 9;
  return (
    <Moldura titulo={d.titulo}>
      <svg viewBox="0 0 320 150" className="w-full" style={{ maxWidth: 360, margin: "0 auto", display: "block" }}
           role="img" aria-label={d.titulo}>
        <line x1="160" y1="42" x2="160" y2="126" stroke={C.line} strokeWidth="2.5" />
        <path d="M132 128 h56" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
        <g transform={`rotate(${incl} 160 42)`}>
          <line x1="42" y1="42" x2="278" y2="42" stroke={C.ink3} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="160" cy="42" r="4.5" fill={C.acc} />
          <g>
            <line x1="70" y1="42" x2="70" y2="66" stroke={C.line} />
            <rect x="26" y="66" width="88" height="30" rx="6" fill={C.surf} stroke={C.line} />
            <text x="70" y="85" textAnchor="middle" fontSize="10.5" fill={C.ink2}>{d.esquerda.rotulo}</text>
          </g>
          <g>
            <line x1="250" y1="42" x2="250" y2="66" stroke={C.line} />
            <rect x="206" y="66" width="88" height="30" rx="6" fill="var(--accent-dim)" stroke={C.acc} />
            <text x="250" y="85" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.acc}>{d.direita.rotulo}</text>
          </g>
        </g>
      </svg>
    </Moldura>
  );
}

/* ------------------------------- MATRIZ -------------------------------- */
function Matriz({ d }: { d: Extract<Diagram, { kind: "matriz" }> }) {
  const marca = ["·", "◐", "●"];
  const cor = [C.ink3, C.info, C.acc];
  return (
    <Moldura titulo={d.titulo}>
      <table className="w-full text-sm border-collapse min-w-[420px]">
        <thead>
          <tr>
            <th />
            {d.colunas.map((c) => (
              <th key={c} className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-center"
                  style={{ color: C.ink3 }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.linhas.map((l) => (
            <tr key={l.rotulo} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
              <td className="py-2.5 pr-3 text-[13px]" style={{ color: C.ink }}>{l.rotulo}</td>
              {l.celulas.map((v, i) => (
                <td key={i} className="text-center text-lg" style={{ color: cor[v] }}>{marca[v]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] mt-3" style={{ color: C.ink3 }}>● alta afinidade · ◐ possível · · desgastante</p>
    </Moldura>
  );
}

/* ------------------------------- ÓRBITA -------------------------------- */
function Orbita({ d }: { d: Extract<Diagram, { kind: "orbita" }> }) {
  const S = 260, R = 92, cx = S / 2, cy = S / 2;
  return (
    <Moldura titulo={d.titulo}>
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full" style={{ maxWidth: 330, margin: "0 auto", display: "block" }}
           role="img" aria-label={d.titulo}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeDasharray="3 5" />
        {d.satelites.map((s, i) => {
          const a = (i / d.satelites.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={C.ink3} />
              <text x={x} y={y + (Math.sin(a) > .2 ? 17 : -11)} textAnchor="middle"
                    fontSize="10" fill={C.ink2}>{s}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="36" fill="var(--accent-dim)" stroke={C.acc} strokeWidth="1.5" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.acc}>{d.centro}</text>
      </svg>
    </Moldura>
  );
}

export function Diagrama({ d }: { d: Diagram }) {
  switch (d.kind) {
    case "gap":       return <Gap d={d} />;
    case "funil":     return <Funil d={d} />;
    case "quadrante": return <Quadrante d={d} />;
    case "fluxo":     return <Fluxo d={d} />;
    case "camadas":   return <Camadas d={d} />;
    case "espectro":  return <Espectro d={d} />;
    case "balanca":   return <Balanca d={d} />;
    case "matriz":    return <Matriz d={d} />;
    case "orbita":    return <Orbita d={d} />;
  }
}
