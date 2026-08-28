"use client";
import { createBrowserClient } from "@supabase/ssr";

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
