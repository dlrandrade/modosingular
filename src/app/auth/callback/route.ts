import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tipo = searchParams.get("tipo");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${tipo === "recovery" ? "/perfil?redefinir=1" : "/jornada"}`);
    }
  }
  return NextResponse.redirect(`${origin}/entrar?erro=link_invalido`);
}
