import { createClient } from "@/lib/supabase/server";
import { calcularGating, diaDaJornada, tetoDoDia, TOTAL_CAPITULOS } from "@/lib/ritmo";
import type { EstadoCapitulo } from "@/lib/ritmo";

export interface Perfil {
  id: string;
  email: string | null;
  nome: string | null;
  profissao: string | null;
  especialidade: string | null;
  bio: string | null;
  instagram: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  timezone: string;
  onboarding_done: boolean;
  linguagem_primaria: string | null;
  linguagem_secundaria: string | null;
  linguagem_scores: Record<string, number>;
  ritmo_minutos_dia: number | null;
}

export interface EstadoJornada {
  perfil: Perfil;
  dia: number;
  teto: number;
  concluidos: number[];
  gating: EstadoCapitulo[];
  assinaturaAtiva: boolean;
  statusAssinatura: string;
  proximo: number;
  progressoPct: number;
  streak: number;
  iniciadaEm: string;
}

const ATIVAS = ["active", "trialing"];

/** Carrega tudo que a jornada precisa numa ida só ao banco. */
export async function carregarJornada(): Promise<EstadoJornada | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [perfilRes, journeyRes, progressoRes, subRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("journeys").select("*").eq("user_id", user.id).single(),
    supabase.from("chapter_progress").select("chapter,state").eq("user_id", user.id),
    supabase.from("subscriptions").select("status,current_period_end").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!perfilRes.data) return null;
  const perfil = perfilRes.data as Perfil;
  const tz = perfil.timezone || "America/Sao_Paulo";
  const iniciadaEm: string = journeyRes.data?.started_at ?? new Date().toISOString();

  const concluidos = (progressoRes.data ?? [])
    .filter((p: { state: string }) => p.state === "completed")
    .map((p: { chapter: number }) => p.chapter);

  const status = subRes.data?.status ?? "none";
  const fimPeriodo = subRes.data?.current_period_end;
  const assinaturaAtiva =
    ATIVAS.includes(status) && (!fimPeriodo || new Date(fimPeriodo) > new Date());

  const dia = diaDaJornada(iniciadaEm, tz);
  const gating = calcularGating({ dia, concluidos, assinaturaAtiva });
  const proximo = gating.find((g) => g.liberado && !g.concluido)?.n
    ?? Math.min(TOTAL_CAPITULOS, concluidos.length + 1);

  return {
    perfil,
    dia,
    teto: tetoDoDia(dia),
    concluidos,
    gating,
    assinaturaAtiva,
    statusAssinatura: status,
    proximo,
    progressoPct: Math.round((concluidos.length / TOTAL_CAPITULOS) * 100),
    streak: journeyRes.data?.streak_atual ?? 0,
    iniciadaEm,
  };
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin";
}
