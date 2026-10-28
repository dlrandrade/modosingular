import { supabaseUrl } from "@/lib/env";
import type { Dados } from "./slides";

/* ---------------------------------------------------------------
   Armazém do estúdio: arquivos JSON num balde PRIVADO do Supabase
   Storage do próprio PWA (mesmo projeto, chave service_role, só no
   servidor). O balde é criado no primeiro uso; não precisa de SQL.

     tarefas/<id>.json      o andamento de cada geração
     kits/dia-NNN.json      o kit salvo (gerado ou editado)
     kits/indice.json       dia → tema e data (para a lista do início)
     historico/…            a versão anterior de cada kit sobrescrito
     config/modelos.json    a escolha feita no /estudio/admin
     config/vapid.json      as chaves das notificações (geradas aqui)

   Sem SUPABASE_SERVICE_ROLE_KEY, tudo segue funcionando como antes
   (a geração só acompanha enquanto a tela está aberta).
--------------------------------------------------------------- */

const BALDE = "estudio";

function chave() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

export function armazemDisponivel(): boolean {
  return !!(chave() && supabaseUrl());
}

function base() {
  return `${supabaseUrl()!.replace(/\/$/, "")}/storage/v1`;
}

function cabecalhos(extra: Record<string, string> = {}) {
  return { apikey: chave()!, Authorization: `Bearer ${chave()}`, ...extra };
}

let balde: Promise<void> | null = null;

/** Garante que o balde privado exista (uma vez por instância). */
function garantirBalde(): Promise<void> {
  balde ??= (async () => {
    const r = await fetch(`${base()}/bucket/${BALDE}`, { headers: cabecalhos(), cache: "no-store" });
    if (r.ok) return;
    const c = await fetch(`${base()}/bucket`, {
      method: "POST", headers: cabecalhos({ "Content-Type": "application/json" }), cache: "no-store",
      body: JSON.stringify({ id: BALDE, name: BALDE, public: false }),
    });
    if (!c.ok && c.status !== 409 && !/exist/i.test(await c.text())) throw new Error(`armazém: não consegui criar o balde (${c.status})`);
  })().catch((e) => { balde = null; throw e; });
  return balde;
}

export async function salvar(caminho: string, dados: unknown): Promise<void> {
  await garantirBalde();
  const r = await fetch(`${base()}/object/${BALDE}/${caminho}`, {
    method: "POST", cache: "no-store",
    headers: cabecalhos({ "Content-Type": "application/json", "x-upsert": "true", "cache-control": "no-store" }),
    body: JSON.stringify(dados),
  });
  if (!r.ok) throw new Error(`armazém: não consegui salvar ${caminho} (${r.status})`);
}

export async function ler<T = Dados>(caminho: string): Promise<T | null> {
  await garantirBalde();
  // o parâmetro t evita qualquer cópia em cache: o andamento muda a cada poucos segundos
  const r = await fetch(`${base()}/object/authenticated/${BALDE}/${caminho}?t=${Date.now()}`, { headers: cabecalhos(), cache: "no-store" });
  if (r.status === 404 || r.status === 400) return null;
  if (!r.ok) throw new Error(`armazém: não consegui ler ${caminho} (${r.status})`);
  return (await r.json()) as T;
}

export async function apagar(caminhos: string[]): Promise<void> {
  if (!caminhos.length) return;
  await garantirBalde();
  await fetch(`${base()}/object/${BALDE}`, {
    method: "DELETE", cache: "no-store", headers: cabecalhos({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: caminhos }),
  });
}

export async function listar(pasta: string): Promise<{ nome: string; criado: string }[]> {
  await garantirBalde();
  const r = await fetch(`${base()}/object/list/${BALDE}`, {
    method: "POST", cache: "no-store", headers: cabecalhos({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix: pasta, limit: 1000, sortBy: { column: "created_at", order: "desc" } }),
  });
  if (!r.ok) return [];
  const itens = (await r.json()) as { name: string; created_at: string }[];
  return itens.filter((x) => x.name && !x.name.startsWith(".")).map((x) => ({ nome: x.name, criado: x.created_at }));
}

// ------------------------------------------------------------------ kits
export type KitSalvo = { kit: Dados; verificacao?: Dados | null; salvo: string; origem: "gerado" | "editado" };
export type Indice = Record<string, { tema: string; salvo: string; origem: string; modelo?: string }>;

const nomeKit = (dia: number) => `kits/dia-${String(dia).padStart(3, "0")}.json`;

export async function lerKit(dia: number): Promise<KitSalvo | null> {
  return ler<KitSalvo>(nomeKit(dia));
}

export async function lerIndice(): Promise<Indice> {
  return (await ler<Indice>("kits/indice.json")) || {};
}

/** Salva o kit do dia, guarda a versão anterior no histórico e atualiza o índice. */
export async function salvarKit(kit: Dados, verificacao: Dados | null, origem: KitSalvo["origem"]): Promise<KitSalvo> {
  const dia = Number(kit.dia);
  if (!Number.isInteger(dia) || dia < 1 || dia > 999) throw new Error("kit sem dia válido");
  const anterior = await lerKit(dia).catch(() => null);
  if (anterior) await salvar(`historico/dia-${String(dia).padStart(3, "0")}-${Date.parse(anterior.salvo) || Date.now()}.json`, anterior).catch(() => {});
  const salvo: KitSalvo = { kit, verificacao: verificacao ?? anterior?.verificacao ?? null, salvo: new Date().toISOString(), origem };
  await salvar(nomeKit(dia), salvo);
  const indice = await lerIndice().catch(() => ({}) as Indice);
  indice[String(dia)] = { tema: String(kit.tema || ""), salvo: salvo.salvo, origem, modelo: kit.modelo };
  await salvar("kits/indice.json", indice);
  return salvo;
}
