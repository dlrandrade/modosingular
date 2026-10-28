import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configOk, supabaseUrl, supabaseAnonKey } from "@/lib/env";

const PROTEGIDAS = ["/jornada", "/dia", "/perfil", "/assinatura", "/materia-prima", "/admin"];

/** Tempo máximo esperando o Supabase no middleware (a Vercel derruba aos 25 s). */
const LIMITE_AUTH_MS = 4000;

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

    // A chamada ao Supabase não tem timeout próprio: se ele demorar, o
    // middleware inteiro estoura os 25 s da Vercel (504
    // MIDDLEWARE_INVOCATION_TIMEOUT) e o catch abaixo nunca roda. Por isso
    // a espera é limitada. Estourou o prazo: a requisição segue sem decisão
    // do middleware; toda página protegida confere a sessão por conta
    // própria (carregarJornada / isAdmin) e redireciona para /entrar.
    const resposta = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), LIMITE_AUTH_MS)),
    ]);
    if (resposta === null) return NextResponse.next();
    const user = resposta.data.user;

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
  // /estudio e /api/estudio têm senha própria e não usam o Supabase: ficam fora do middleware.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|estudio|studio|api/estudio|.*\\.(?:svg|png|jpg|jpeg|webp|ico|woff2)$).*)"],
};
