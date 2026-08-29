"use client";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente do NAVEGADOR. Hoje nenhuma tela usa: todo acesso ao Supabase
 * acontece no servidor. Se um dia for necessário, este é o único caso que
 * EXIGE as variáveis com prefixo NEXT_PUBLIC_, porque só elas são
 * embutidas no bundle do cliente.
 */

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase não configurado no build do cliente. " +
      "Verifique as variáveis na Vercel e refaça o deploy SEM cache.",
    );
  }
  return createBrowserClient(url, anon);
}
