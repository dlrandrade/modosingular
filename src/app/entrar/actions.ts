"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type EstadoAuth = { erro?: string; aviso?: string };

function textoErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar. Verifique a caixa de entrada.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem conta. Entre com sua senha ou use 'esqueci minha senha'.";
  if (m.includes("password") && m.includes("6")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde um minuto.";
  return "Não foi possível concluir. Tente novamente em instantes.";
}

export async function entrar(_prev: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: textoErro(error.message) };

  redirect(String(form.get("proximo") || "/jornada"));
}

export async function criarConta(_prev: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");

  if (nome.length < 2) return { erro: "Escreva seu nome." };
  if (!email.includes("@")) return { erro: "E-mail inválido." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const supabase = await createClient();
  const origem = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome }, emailRedirectTo: `${origem}/auth/callback` },
  });
  if (error) return { erro: textoErro(error.message) };

  if (data.session) redirect("/jornada");
  return { aviso: "Conta criada. Confirme o e-mail que enviamos para começar o Dia 1." };
}

export async function recuperarSenha(_prev: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { erro: "E-mail inválido." };

  const supabase = await createClient();
  const origem = (await headers()).get("origin") ?? "";
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origem}/auth/callback?tipo=recovery` });
  // Resposta idêntica exista ou não a conta — não revela quem é assinante.
  return { aviso: "Se existir uma conta com esse e-mail, o link de redefinição chegou agora." };
}

/**
 * Define a nova senha depois do link de recuperação.
 * Roda no servidor: a sessão veio do exchangeCodeForSession no callback,
 * então não é preciso expor nenhuma chave ao navegador.
 */
export async function definirNovaSenha(_prev: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const senha = String(form.get("senha") ?? "");
  const repetir = String(form.get("repetir") ?? "");

  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (senha !== repetir) return { erro: "As duas senhas não são iguais." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { erro: "O link expirou. Peça um novo em 'esqueci minha senha'." };

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { erro: textoErro(error.message) };

  return { aviso: "Senha atualizada. Ela já vale para os próximos acessos." };
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
