/* ---------------------------------------------------------------
   Leitura segura das variáveis de ambiente.

   Detalhe importante do Next.js: `process.env.NEXT_PUBLIC_X` é
   substituído pelo valor literal em tempo de BUILD. Se o build rodou
   antes da variável existir (ou reaproveitou cache), o código sai com
   `undefined` embutido — mesmo que a variável exista na Vercel agora.

   Por isso lemos de duas formas:
   - inline:  process.env.NEXT_PUBLIC_X       → o que foi embutido no build
   - runtime: process.env[chave]              → o valor real do ambiente
                                                (acesso dinâmico não é
                                                 substituído no build)

   A divergência entre as duas diz exatamente qual é o problema.
---------------------------------------------------------------- */

function runtime(chave: string): string | undefined {
  const v = process.env[chave];
  return v && v.trim() ? v.trim() : undefined;
}

/* ---------------------------------------------------------------
   Nomes aceitos.

   O app acessa o Supabase apenas no servidor (middleware, server
   components e server actions) — nunca no navegador. Por isso o prefixo
   NEXT_PUBLIC_ é opcional aqui: aceitamos também os nomes sem prefixo,
   que a Vercel salva sem exibir o aviso de exposição pública.
---------------------------------------------------------------- */

export const NOMES_URL = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"] as const;
export const NOMES_CHAVE = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
] as const;

function primeiro(nomes: readonly string[]): string | undefined {
  for (const n of nomes) {
    const v = runtime(n);
    if (v) return v;
  }
  return undefined;
}

/** Qual nome de variável forneceu o valor — usado no diagnóstico. */
export function nomeUsado(nomes: readonly string[]): string | undefined {
  return nomes.find((n) => runtime(n));
}

/** URL do Supabase. Aceita NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL. */
export function supabaseUrl(): string | undefined {
  return primeiro(NOMES_URL) ?? limpar(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/** Chave publishable/anon. Aceita a versão com ou sem prefixo. */
export function supabaseAnonKey(): string | undefined {
  return primeiro(NOMES_CHAVE) ?? limpar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function limpar(v: string | undefined): string | undefined {
  return v && v.trim() ? v.trim() : undefined;
}

/** Uma URL de projeto Supabase válida — evita o caso de colar a chave no campo da URL. */
export function urlValida(v: string | undefined): boolean {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname.length > 0;
  } catch {
    return false;
  }
}

/** A chave é um JWT (três partes separadas por ponto) ou uma publishable key `sb_...`. */
export function chaveValida(v: string | undefined): boolean {
  if (!v) return false;
  return v.startsWith("sb_") || v.split(".").length === 3;
}

export interface EstadoConfig {
  ok: boolean;
  url?: string;
  anon?: string;
  problemas: string[];
}

/** Diagnóstico completo — usado pelo middleware e pela página /configuracao. */
export function checarConfig(): EstadoConfig {
  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  const problemas: string[] = [];

  if (!url) problemas.push("A URL do Supabase não está definida (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL).");
  else if (!urlValida(url)) {
    problemas.push(
      chaveValida(url)
        ? "A variável da URL contém uma CHAVE. Os dois campos foram trocados."
        : "A URL do Supabase não é um endereço https:// válido.",
    );
  }

  if (!anon) problemas.push("A chave do Supabase não está definida (NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_ANON_KEY).");
  else if (!chaveValida(anon)) {
    problemas.push(
      urlValida(anon)
        ? "A variável da chave contém uma URL. Os dois campos foram trocados."
        : "O valor informado não parece uma chave do Supabase.",
    );
  }

  return { ok: problemas.length === 0, url, anon, problemas };
}

/** Atalho barato para o middleware, que roda em toda requisição. */
export function configOk(): boolean {
  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  return urlValida(url) && chaveValida(anon);
}
