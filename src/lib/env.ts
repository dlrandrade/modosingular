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

/** URL do Supabase, preferindo o valor de runtime. */
export function supabaseUrl(): string | undefined {
  return runtime("NEXT_PUBLIC_SUPABASE_URL") ?? limpar(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/** Chave anônima/publishable do Supabase. */
export function supabaseAnonKey(): string | undefined {
  return runtime("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? limpar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
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

  if (!url) problemas.push("NEXT_PUBLIC_SUPABASE_URL não está definida.");
  else if (!urlValida(url)) {
    problemas.push(
      chaveValida(url)
        ? "NEXT_PUBLIC_SUPABASE_URL contém uma CHAVE, não uma URL. Os dois campos foram trocados."
        : "NEXT_PUBLIC_SUPABASE_URL não é uma URL https:// válida.",
    );
  }

  if (!anon) problemas.push("NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida.");
  else if (!chaveValida(anon)) {
    problemas.push(
      urlValida(anon)
        ? "NEXT_PUBLIC_SUPABASE_ANON_KEY contém uma URL, não uma chave. Os dois campos foram trocados."
        : "NEXT_PUBLIC_SUPABASE_ANON_KEY não parece uma chave do Supabase.",
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
