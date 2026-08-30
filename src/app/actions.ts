"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCapitulo } from "@/content";
import { calcularGating, diaDaJornada } from "@/lib/ritmo";

const ATIVAS = ["active", "trialing"];

async function exigirUsuario() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

/** Revalida o acesso a um capítulo no servidor — o gating do cliente é só UI. */
async function podeAcessar(userId: string, n: number) {
  const supabase = await createClient();
  const [j, prog, sub] = await Promise.all([
    supabase.from("journeys").select("started_at").eq("user_id", userId).single(),
    supabase.from("chapter_progress").select("chapter,state").eq("user_id", userId),
    supabase.from("subscriptions").select("status,current_period_end").eq("user_id", userId).maybeSingle(),
  ]);
  const concluidos = (prog.data ?? [])
    .filter((p: { state: string }) => p.state === "completed")
    .map((p: { chapter: number }) => p.chapter);
  const status = sub.data?.status ?? "none";
  const fim = sub.data?.current_period_end;
  const ativa = ATIVAS.includes(status) && (!fim || new Date(fim) > new Date());
  const dia = diaDaJornada(j.data?.started_at ?? new Date().toISOString());
  const estado = calcularGating({ dia, concluidos, assinaturaAtiva: ativa }).find((g) => g.n === n);
  return { permitido: !!estado?.liberado, motivo: estado?.motivo ?? null, dia };
}

/* --------------------------------------------------------------- abrir */
export async function abrirCapitulo(n: number) {
  const { supabase, user } = await exigirUsuario();

  // Marcar leitura NUNCA pode rebaixar um capítulo concluído: reabrir para
  // reler apagava o progresso. O gating já foi aplicado na renderização da
  // página; aqui só registramos a visita, sem revalidar nada.
  const { data: atual } = await supabase
    .from("chapter_progress").select("state")
    .eq("user_id", user.id).eq("chapter", n).maybeSingle();

  if (!atual) {
    await supabase.from("chapter_progress").insert({
      user_id: user.id, chapter: n, state: "reading",
      opened_at: new Date().toISOString(),
    });
  } else if (atual.state !== "completed") {
    await supabase.from("chapter_progress")
      .update({ state: "reading", opened_at: new Date().toISOString() })
      .eq("user_id", user.id).eq("chapter", n);
  }

  return { ok: true as const };
}

/* ----------------------------------------------------------- concluir */
export async function concluirCapitulo(n: number) {
  const { supabase, user } = await exigirUsuario();
  const { permitido } = await podeAcessar(user.id, n);
  if (!permitido) return { ok: false as const, erro: "bloqueado" };

  // Exige o quiz aprovado antes de liberar o próximo.
  const cap = getCapitulo(n);
  if (cap && cap.quiz.length > 0) {
    const { data } = await supabase
      .from("quiz_attempts").select("passou")
      .eq("user_id", user.id).eq("chapter", n).eq("passou", true).limit(1);
    if (!data || data.length === 0) return { ok: false as const, erro: "quiz_pendente" };
  }

  await supabase.from("chapter_progress").upsert(
    { user_id: user.id, chapter: n, state: "completed", completed_at: new Date().toISOString() },
    { onConflict: "user_id,chapter" },
  );
  await atualizarStreak(user.id);
  await supabase.from("activity_log").insert({ user_id: user.id, acao: "concluiu_capitulo", chapter: n });

  revalidatePath("/jornada");
  return { ok: true as const };
}

async function atualizarStreak(userId: string) {
  const supabase = await createClient();
  const { data: j } = await supabase
    .from("journeys").select("last_active_at,streak_atual,streak_recorde")
    .eq("user_id", userId).single();
  if (!j) return;

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const ultimo = new Date(j.last_active_at); ultimo.setHours(0, 0, 0, 0);
  const dif = Math.round((hoje.getTime() - ultimo.getTime()) / 86_400_000);

  let streak = j.streak_atual ?? 0;
  if (dif === 1) streak += 1;
  else if (dif > 1) streak = 1;
  else if (streak === 0) streak = 1;

  await supabase.from("journeys").update({
    last_active_at: new Date().toISOString(),
    streak_atual: streak,
    streak_recorde: Math.max(streak, j.streak_recorde ?? 0),
  }).eq("user_id", userId);
}

/* --------------------------------------------------------------- quiz */
export async function enviarQuiz(n: number, respostas: number[]) {
  const { supabase, user } = await exigirUsuario();
  const cap = getCapitulo(n);
  if (!cap) return { ok: false as const, erro: "capitulo_invalido" };

  // Correção acontece SEMPRE no servidor — o cliente nunca vê o gabarito.
  const detalhes = cap.quiz.map((q, i) => ({
    id: q.id,
    marcada: respostas[i] ?? -1,
    correta: q.correta,
    acertou: respostas[i] === q.correta,
    explicacao: q.explicacao,
  }));
  const acertos = detalhes.filter((d) => d.acertou).length;
  const total = cap.quiz.length;
  const passou = acertos / total >= 0.7;

  const { count } = await supabase
    .from("quiz_attempts").select("*", { count: "exact", head: true })
    .eq("user_id", user.id).eq("chapter", n);

  await supabase.from("quiz_attempts").insert({
    user_id: user.id, chapter: n, attempt_no: (count ?? 0) + 1,
    answers: detalhes, acertos, total, passou,
  });

  return { ok: true as const, acertos, total, passou, detalhes };
}

/* ------------------------------------------------------------- tarefa */
export async function salvarTarefa(
  n: number,
  campos: Record<string, string>,
  publicar: boolean,
  extra?: { formato?: string; link?: string },
) {
  const { supabase, user } = await exigirUsuario();
  const corpo = Object.entries(campos).map(([k, v]) => `## ${k}\n${v}`).join("\n\n");

  await supabase.from("task_submissions").upsert({
    user_id: user.id,
    chapter: n,
    campos,
    corpo,
    formato: extra?.formato ?? null,
    link_publicacao: extra?.link ?? null,
    state: publicar ? "submitted" : "draft",
    publicado_em: publicar ? new Date().toISOString() : null,
  }, { onConflict: "user_id,chapter" });

  return { ok: true as const };
}

/* ------------------------------------------- pontuação de aplicação */
export async function salvarPontuacao(n: number, criterios: Record<string, number>) {
  const { supabase, user } = await exigirUsuario();
  const cap = getCapitulo(n);
  if (!cap) return { ok: false as const };

  const pesoTotal = cap.criterios.reduce((s, c) => s + c.peso, 0);
  const obtido = cap.criterios.reduce((s, c) => s + ((criterios[c.id] ?? 0) / 5) * c.peso, 0);
  const score = Math.round((obtido / pesoTotal) * 100);

  await supabase.from("application_scores").upsert(
    { user_id: user.id, chapter: n, criterios, score },
    { onConflict: "user_id,chapter" },
  );
  return { ok: true as const, score };
}

/* -------------------------------------------------------------- teste */
export async function salvarTeste(slug: string, n: number, respostas: Record<string, number>) {
  const { supabase, user } = await exigirUsuario();
  const cap = getCapitulo(n);
  const teste = cap?.teste;
  if (!teste) return { ok: false as const };

  const soma = teste.itens.reduce((s, item) => {
    const v = respostas[item.id] ?? 0;
    return s + (item.invertido ? teste.escala.length + 1 - v : v);
  }, 0);
  const faixa = teste.faixas.find((f) => soma >= f.min && soma <= f.max) ?? teste.faixas[teste.faixas.length - 1];

  await supabase.from("assessments").insert({
    user_id: user.id, slug, respostas, resultado: { soma, faixa },
  });

  // O teste do capítulo 7 define a linguagem criativa do perfil.
  if (n === 7) {
    const eixos = { oral: 0, escrito: 0, dialogico: 0, narrativo: 0 };
    eixos.oral = (respostas.o1 ?? 0) + (respostas.o2 ?? 0);
    eixos.escrito = (respostas.e1 ?? 0) + (respostas.e2 ?? 0);
    eixos.dialogico = (respostas.d1 ?? 0) + (respostas.d2 ?? 0);
    eixos.narrativo = (respostas.n1 ?? 0) + (respostas.n2 ?? 0);
    const ordenado = Object.entries(eixos).sort((a, b) => b[1] - a[1]);
    await supabase.from("profiles").update({
      linguagem_primaria: ordenado[0][0],
      linguagem_secundaria: ordenado[1][0],
      linguagem_scores: eixos,
    }).eq("id", user.id);
    revalidatePath("/perfil");
  }

  return { ok: true as const, soma, faixa };
}

/* ----------------------------------------------------------- anotação */
export async function salvarNota(n: number, corpo: string) {
  const { supabase, user } = await exigirUsuario();
  await supabase.from("notes").upsert(
    { user_id: user.id, chapter: n, corpo, updated_at: new Date().toISOString() },
    { onConflict: "user_id,chapter" },
  );
  return { ok: true as const };
}

/* ------------------------------------------------- matéria-prima */
export async function adicionarMateriaPrima(input: {
  tipo: string; texto: string; contexto?: string; origem_capitulo?: number;
}) {
  const { supabase, user } = await exigirUsuario();
  await supabase.from("raw_material").insert({ user_id: user.id, ...input });
  revalidatePath("/materia-prima");
  return { ok: true as const };
}

export async function removerMateriaPrima(id: string) {
  const { supabase, user } = await exigirUsuario();
  await supabase.from("raw_material").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/materia-prima");
  return { ok: true as const };
}

/* -------------------------------------------------------------- perfil */
export async function salvarPerfil(dados: {
  nome?: string; profissao?: string; especialidade?: string;
  bio?: string; instagram?: string; cidade?: string; timezone?: string;
}) {
  const { supabase, user } = await exigirUsuario();
  await supabase.from("profiles").update({ ...dados, onboarding_done: true }).eq("id", user.id);
  revalidatePath("/perfil");
  revalidatePath("/jornada");
  return { ok: true as const };
}
