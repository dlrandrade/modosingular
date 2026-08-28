import { Marca } from "@/components/Marca";
import { checarConfig, urlValida, chaveValida } from "@/lib/env";

export const metadata = { title: "Configuração pendente" };
export const dynamic = "force-dynamic";

/** Lê o ambiente REAL (acesso dinâmico não é substituído no build). */
function noRuntime(chave: string): string | undefined {
  const v = process.env[chave];
  return v && v.trim() ? v.trim() : undefined;
}

/** Mostra só o suficiente para reconhecer o valor, nunca o segredo inteiro. */
function amostra(v: string | undefined, publico: boolean): string {
  if (!v) return "—";
  if (publico) return v.length > 46 ? `${v.slice(0, 40)}…` : v;
  return `${v.slice(0, 6)}…  (${v.length} caracteres)`;
}

export default function Configuracao() {
  const estado = checarConfig();

  const runtimeUrl = noRuntime("NEXT_PUBLIC_SUPABASE_URL");
  const runtimeAnon = noRuntime("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const variaveis = [
    { nome: "NEXT_PUBLIC_SUPABASE_URL", valor: runtimeUrl, publico: true, essencial: true,
      valida: urlValida(runtimeUrl), esperado: "https://….supabase.co" },
    { nome: "NEXT_PUBLIC_SUPABASE_ANON_KEY", valor: runtimeAnon, publico: false, essencial: true,
      valida: chaveValida(runtimeAnon), esperado: "sb_publishable_… ou JWT" },
    { nome: "SUPABASE_SERVICE_ROLE_KEY", valor: noRuntime("SUPABASE_SERVICE_ROLE_KEY"),
      publico: false, essencial: true,
      valida: chaveValida(noRuntime("SUPABASE_SERVICE_ROLE_KEY")), esperado: "JWT (só servidor)" },
    { nome: "NEXT_PUBLIC_SITE_URL", valor: noRuntime("NEXT_PUBLIC_SITE_URL"), publico: true, essencial: false,
      valida: urlValida(noRuntime("NEXT_PUBLIC_SITE_URL")), esperado: "https://seu-dominio" },
    { nome: "KIWIFY_WEBHOOK_TOKEN", valor: noRuntime("KIWIFY_WEBHOOK_TOKEN"),
      publico: false, essencial: false,
      valida: Boolean(noRuntime("KIWIFY_WEBHOOK_TOKEN")), esperado: "token do webhook" },
  ];

  const faltaNaVercel = !runtimeUrl || !runtimeAnon;

  return (
    <main className="min-h-dvh px-5 py-10 safe-t safe-b">
      <div className="max-w-xl mx-auto">
        <Marca className="mb-7" />

        <span className="chip mb-3" style={{ color: "var(--neg)", borderColor: "var(--neg)" }}>
          configuração pendente
        </span>
        <h1 className="font-serif text-[1.8rem] leading-tight mb-3">
          O app está no ar, mas ainda não conversa com o banco.
        </h1>
        <p className="text-[15px] leading-relaxed mb-7" style={{ color: "var(--ink-2)" }}>
          Esta página existe para não devolver um erro 500 quando falta configuração.
          Abaixo está o estado real do ambiente — nenhum segredo é exibido por inteiro.
        </p>

        {/* ------------------------------------------------ o veredito */}
        <div className="card p-4 mb-6" style={{ borderColor: "var(--accent)" }}>
          <div className="text-[10.5px] font-bold uppercase tracking-[.1em] mb-2"
               style={{ color: "var(--accent)" }}>
            Diagnóstico
          </div>
          {faltaNaVercel ? (
            <>
              <p className="text-[15px] font-semibold mb-1.5">
                As variáveis não existem neste ambiente.
              </p>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                Em <b>Settings → Environment Variables</b>, cadastre as duas primeiras da tabela
                marcando <b>Production</b>. Se você já cadastrou, confira se marcou o ambiente
                Production (e não só Preview) e se não sobrou espaço ou aspas no valor.
              </p>
            </>
          ) : estado.ok ? (
            <>
              <p className="text-[15px] font-semibold mb-1.5" style={{ color: "var(--pos)" }}>
                Configuração completa.
              </p>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                Se você ainda vê esta página, recarregue sem cache. O app deve abrir normalmente.
              </p>
            </>
          ) : (
            <ul className="space-y-1.5">
              {estado.problemas.map((p, i) => (
                <li key={i} className="text-[14px] leading-relaxed flex gap-2"
                    style={{ color: "var(--ink-2)" }}>
                  <span style={{ color: "var(--neg)" }}>·</span>{p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --------------------------------------------- estado atual */}
        <div className="card overflow-hidden mb-6">
          <div className="px-4 py-2.5 border-b hair text-[10.5px] font-bold uppercase tracking-[.09em]"
               style={{ color: "var(--ink-3)" }}>
            Variáveis neste ambiente
          </div>
          <div className="divide-y" style={{ borderColor: "var(--line-soft)" }}>
            {variaveis.map((v) => (
              <div key={v.nome} className="p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5 text-[13px]"
                        style={{ color: v.valida ? "var(--pos)" : "var(--neg)" }}>
                    {v.valida ? "✓" : "✕"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <code className="text-[12.5px] font-semibold break-all">{v.nome}</code>
                    <div className="text-[12px] mt-1 break-all" style={{ color: "var(--ink-2)" }}>
                      {amostra(v.valor, v.publico)}
                    </div>
                    {!v.valida && (
                      <div className="text-[11.5px] mt-1" style={{ color: "var(--ink-3)" }}>
                        esperado: {v.esperado}
                      </div>
                    )}
                    {!v.valor && !v.essencial && (
                      <div className="text-[11.5px] mt-1" style={{ color: "var(--ink-3)" }}>
                        opcional para abrir o app
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-[10.5px] font-bold uppercase tracking-[.09em] mb-2.5"
               style={{ color: "var(--ink-3)" }}>
            Lembretes
          </div>
          <ul className="space-y-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            <li>
              O aviso da Vercel sobre <code>NEXT_PUBLIC_</code> expor valores é esperado:
              essas duas variáveis são públicas por design. A proteção vem do RLS.
            </li>
            <li>
              <code>SUPABASE_SERVICE_ROLE_KEY</code> e as chaves da Kiwify
              <b> nunca</b> levam o prefixo <code>NEXT_PUBLIC_</code>.
            </li>
            <li>
              Toda mudança de variável exige um novo deploy para valer.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
