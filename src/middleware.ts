import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configOk, supabaseUrl, supabaseAnonKey } from "@/lib/env";

const PROTEGIDAS = ["/jornada", "/dia", "/perfil", "/assinatura", "/materia-prima", "/admin"];

/**
 * O middleware roda em TODA requisição. Se ele lançar, o site inteiro
 * responde 500 (MIDDLEWARE_INVOCATION_FAILED) — inclusive a página que
 * explicaria o erro. Por isso aqui nada pode lançar: falta de
 * configuração vira redirecionamento para /configuracao, e qualquer
 * exceção inesperada deixa a requisição seguir.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Sem Supabase configurado não há autenticação possível.
  if (!configOk()) {
    if (path === "/configuracao") return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/configuracao";
    url.search = "";
    return NextResponse.redirect(url);
  }

  try {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      supabaseUrl()!,
      supabaseAnonKey()!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list: { name: string; value: string; options?: CookieOptions }[]) => {
            list.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            list.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && PROTEGIDAS.some((p) => path.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("proximo", path);
      return NextResponse.redirect(url);
    }

    if (user && (path === "/entrar" || path === "/criar-conta")) {
      const url = request.nextUrl.clone();
      url.pathname = "/jornada";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    // Rede instável, Supabase fora do ar, cookie corrompido: a página
    // decide o que fazer. Melhor uma tela do que um 500 global.
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
