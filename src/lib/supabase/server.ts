import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey, configOk } from "@/lib/env";

export class ConfiguracaoAusente extends Error {
  constructor() {
    super("Supabase não configurado neste ambiente");
    this.name = "ConfiguracaoAusente";
  }
}

export async function createClient() {
  if (!configOk()) throw new ConfiguracaoAusente();

  const cookieStore = await cookies();
  return createServerClient(supabaseUrl()!, supabaseAnonKey()!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: { name: string; value: string; options?: CookieOptions }[]) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* chamado de um Server Component: o middleware renova a sessão */
        }
      },
    },
  });
}
