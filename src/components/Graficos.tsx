import type { Chart } from "@/content/types";

const C = {
  ink: "var(--ink)", ink2: "var(--ink-2)", ink3: "var(--ink-3)",
  line: "var(--line)", acc: "var(--accent)", info: "var(--info)", pos: "var(--pos)",
};

/* Paleta categórica: acento primeiro, depois neutros frios. */
const SERIE = ["var(--accent)", "var(--info)", "var(--pos)", "var(--ink-3)"];

function Moldura({ titulo, unidade, children }: {
  titulo: string; unidade?: string; children: React.ReactNode;
}) {
  return (
    <figure className="card my-7 overflow-hidden">
      <figcaption className="px-4 py-2.5 border-b hair flex justify-between items-baseline gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[.09em]" style={{ color: C.ink3 }}>
          {titulo}
        </span>
        {unidade && <span className="text-[10.5px]" style={{ color: C.ink3 }}>{unidade}</span>}
      </figcaption>
      <div className="scroll-x p-4">{children}</div>
    </figure>
  );
}

/* ------------------------------- BARRAS -------------------------------- */
function Barras({ c }: { c: Extract<Chart, { kind: "barras" }> }) {
  const max = Math.max(...c.series.map((s) => s.valor), 1);
  return (
    <Moldura titulo={c.titulo} unidade={c.unidade}>
      <div className="space-y-3">
        {c.series.map((s, i) => (
          <div key={i} className="grid grid-cols-[minmax(96px,34%)_1fr_auto] gap-3 items-center">
            <div className="text-[13px] leading-tight" style={{ color: C.ink2 }}>{s.rotulo}</div>
            <div className="h-6 rounded" style={{ background: "var(--line-soft)" }}>
              <div className="h-full rounded flex items-center justify-end pr-2"
                   style={{ width: `${Math.max((s.valor / max) * 100, 3)}%`,
                            background: i === 0 ? C.acc : "var(--surface-2)",
                            border: i === 0 ? "none" : `1px solid ${C.line}` }} />
            </div>
            <div className="text-xs tabular-nums font-semibold w-9 text-right"
                 style={{ color: i === 0 ? C.acc : C.ink3 }}>{s.valor}</div>
          </div>
        ))}
      </div>
      {c.series.some((s) => s.nota) && (
        <ul className="mt-4 pt-3 border-t hair space-y-1">
          {c.series.filter((s) => s.nota).map((s, i) => (
            <li key={i} className="text-[11.5px]" style={{ color: C.ink3 }}>
              <b style={{ color: C.ink2 }}>{s.rotulo}:</b> {s.nota}
            </li>
          ))}
        </ul>
      )}
    </Moldura>
  );
}

/* -------------------------------- LINHA -------------------------------- */
function Linha({ c }: { c: Extract<Chart, { kind: "linha" }> }) {
  const W = 460, H = 190, P = { t: 14, r: 14, b: 30, l: 34 };
  const todos = c.series.flatMap((s) => s.pontos);
  const max = Math.max(...todos, 1), min = Math.min(...todos, 0);
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const X = (i: number) => P.l + (i / Math.max(c.labels.length - 1, 1)) * iw;
  const Y = (v: number) => P.t + ih - ((v - min) / Math.max(max - min, 1)) * ih;

  return (
    <Moldura titulo={c.titulo} unidade={c.unidade}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 340 }} role="img" aria-label={c.titulo}>
        {[0, .25, .5, .75, 1].map((f) => {
          const y = P.t + ih * f;
          return <line key={f} x1={P.l} y1={y} x2={W - P.r} y2={y} stroke={C.line}
                       strokeDasharray={f === 1 ? "0" : "2 5"} />;
        })}
        {c.labels.map((l, i) =>
          (i === 0 || i === c.labels.length - 1 || c.labels.length <= 7) ? (
            <text key={i} x={X(i)} y={H - 10} fontSize="10" fill={C.ink3}
                  textAnchor={i === 0 ? "start" : i === c.labels.length - 1 ? "end" : "middle"}>{l}</text>
          ) : null)}
        <text x={P.l - 6} y={P.t + 4} fontSize="9.5" fill={C.ink3} textAnchor="end">{max}</text>
        <text x={P.l - 6} y={P.t + ih} fontSize="9.5" fill={C.ink3} textAnchor="end">{min}</text>

        {c.series.map((s, si) => {
          const cor = s.destaque ? C.acc : SERIE[(si + 1) % SERIE.length];
          const d = s.pontos.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
          return (
            <g key={si}>
              {s.destaque && (
                <path d={`${d} L${X(s.pontos.length - 1)},${P.t + ih} L${X(0)},${P.t + ih} Z`}
                      fill={cor} opacity=".10" />
              )}
              <path d={d} fill="none" stroke={cor} strokeWidth={s.destaque ? 2.5 : 1.6}
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={s.destaque ? "0" : "5 4"} />
              {s.destaque && s.pontos.map((v, i) => (
                <circle key={i} cx={X(i)} cy={Y(v)} r="3" fill="var(--bg)" stroke={cor} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t hair">
        {c.series.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: C.ink2 }}>
            <span className="w-3.5 h-[2.5px] rounded"
                  style={{ background: s.destaque ? C.acc : SERIE[(i + 1) % SERIE.length] }} />
            {s.nome}
          </span>
        ))}
      </div>
    </Moldura>
  );
}

/* -------------------------- ÁREA ACUMULADA ----------------------------- */
function AreaAcumulada({ c }: { c: Extract<Chart, { kind: "area-acumulada" }> }) {
  const W = 460, H = 170, P = { t: 12, r: 12, b: 26, l: 12 };
  let soma = 0;
  const acc = c.pontos.map((v) => (soma += v));
  const max = Math.max(...acc, 1);
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const X = (i: number) => P.l + (i / Math.max(acc.length - 1, 1)) * iw;
  const Y = (v: number) => P.t + ih - (v / max) * ih;
  const d = acc.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");

  return (
    <Moldura titulo={c.titulo}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }} role="img" aria-label={c.titulo}>
        <defs>
          <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity=".38" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={P.l} y1={P.t + ih} x2={W - P.r} y2={P.t + ih} stroke={C.line} />
        <path d={`${d} L${X(acc.length - 1)},${P.t + ih} L${X(0)},${P.t + ih} Z`} fill="url(#ga)" />
        <path d={d} fill="none" stroke={C.acc} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={X(acc.length - 1)} cy={Y(acc[acc.length - 1])} r="4" fill={C.acc} />
        {c.labels.map((l, i) =>
          (i === 0 || i === c.labels.length - 1) ? (
            <text key={i} x={X(i)} y={H - 8} fontSize="10" fill={C.ink3}
                  textAnchor={i === 0 ? "start" : "end"}>{l}</text>
          ) : null)}
      </svg>
      {c.nota && <p className="text-[11.5px] mt-2" style={{ color: C.ink3 }}>{c.nota}</p>}
    </Moldura>
  );
}

/* -------------------------------- RADAR -------------------------------- */
function Radar({ c }: { c: Extract<Chart, { kind: "radar" }> }) {
  const S = 260, cx = S / 2, cy = S / 2, R = 88;
  const n = c.eixos.length;
  const pt = (i: number, v: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = (v / 100) * R;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  return (
    <Moldura titulo={c.titulo}>
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full" style={{ maxWidth: 320, margin: "0 auto", display: "block" }}
           role="img" aria-label={c.titulo}>
        {[.25, .5, .75, 1].map((f) => (
          <polygon key={f} fill="none" stroke={C.line} strokeDasharray={f === 1 ? "0" : "2 4"}
                   points={c.eixos.map((_, i) => pt(i, f * 100).join(",")).join(" ")} />
        ))}
        {c.eixos.map((_, i) => {
          const [x, y] = pt(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} />;
        })}
        {c.series.map((s, si) => {
          const cor = SERIE[si % SERIE.length];
          return (
            <polygon key={si} points={s.valores.map((v, i) => pt(i, v).join(",")).join(" ")}
                     fill={cor} fillOpacity={si === 0 ? ".18" : ".08"} stroke={cor} strokeWidth="2" />
          );
        })}
        {c.eixos.map((e, i) => {
          const [x, y] = pt(i, 128);
          return <text key={i} x={x} y={y} fontSize="9.5" fill={C.ink2} textAnchor="middle" dominantBaseline="middle">{e}</text>;
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {c.series.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: C.ink2 }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SERIE[i % SERIE.length] }} />
            {s.nome}
          </span>
        ))}
      </div>
    </Moldura>
  );
}

export function Grafico({ c }: { c: Chart }) {
  switch (c.kind) {
    case "barras":         return <Barras c={c} />;
    case "linha":          return <Linha c={c} />;
    case "area-acumulada": return <AreaAcumulada c={c} />;
    case "radar":          return <Radar c={c} />;
  }
}
