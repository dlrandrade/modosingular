import { Marca } from "@/components/Marca";
import { checarConfig, urlValida, chaveValida, nomeUsado, NOMES_URL, NOMES_CHAVE, supabaseUrl, supabaseAnonKey } from "@/lib/env";

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

  const runtimeUrl = supabaseUrl();
  const runtimeAnon = supabaseAnonKey();
  const viaUrl = nomeUsado(NOMES_URL);
  const viaChave = nomeUsado(NOMES_CHAVE);

  const variaveis = [
    { nome: viaUrl ?? "SUPABASE_URL", alternativas: NOMES_URL as readonly string[],
      valor: runtimeUrl, publico: true, essencial: true,
      valida: urlValida(runtimeUrl), esperado: "https://….supabase.co" },
    { nome: viaChave ?? "SUPABASE_ANON_KEY", alternativas: NOMES_CHAVE as readonly string[],
      valor: runtimeAnon, publico: false, essencial: true,
      valida: chaveValida(runtimeAnon), esperado: "sb_publishable_… ou JWT" },
    { nome: "SUPABASE_SERVICE_ROLE_KEY", alternativas: undefined, valor: noRuntime("SUPABASE_SERVICE_ROLE_KEY"),
      publico: false, essencial: true,
      valida: chaveValida(noRuntime("SUPABASE_SERVICE_ROLE_KEY")), esperado: "JWT (só servidor)" },
    { nome: "NEXT_PUBLIC_SITE_URL", alternativas: undefined, valor: noRuntime("NEXT_PUBLIC_SITE_URL"), publico: true, essencial: false,
      valida: urlValida(noRuntime("NEXT_PUBLIC_SITE_URL")), esperado: "https://seu-dominio" },
    { nome: "KIWIFY_WEBHOOK_TOKEN", alternativas: undefined, valor: noRuntime("KIWIFY_WEBHOOK_TOKEN"),
      publico: false, essencial: false,
      valida: Boolean(noRuntime("KIWIFY_WEBHOOK_TOKEN")), esperado: "token do webhook" },
  ];

  const faltaNaVercel = !runtimeUrl || !runtimeAnon;

  return (
    <main className="min-h-dvh px-page py-10 safe-t safe-b">
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
              <p className="text-[14px] leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>
                Em <b>Settings → Environment Variables</b>, cadastre estas duas marcando{" "}
                <b>Production</b>:
              </p>
              <div className="rounded-lg p-3 mb-3" style={{ background: "var(--bg-2)" }}>
                <code className="block text-[12.5px] mb-1">SUPABASE_URL</code>
                <code className="block text-[12.5px]">SUPABASE_ANON_KEY</code>
              </div>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
                Sem o prefixo <code>NEXT_PUBLIC_</code> — assim a Vercel não exibe o aviso de
                exposição pública. O app só acessa o Supabase pelo servidor, então o prefixo é
                dispensável. Os nomes com prefixo continuam funcionando, se preferir.
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
                        {v.alternativas && (
                          <> · aceita: {v.alternativas.join(" ou ")}</>
                        )}
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
              Prefira os nomes sem <code>NEXT_PUBLIC_</code>. O app acessa o Supabase apenas
              pelo servidor, então nada precisa ir para o navegador.
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
