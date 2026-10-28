import { armazemDisponivel, ler, listar } from "@/estudio/armazem";
import { chavesVapid } from "@/estudio/aviso";
import { CATALOGO, CONFIG_PADRAO, MODELOS_GRATUITOS, type ConfigModelos } from "@/estudio/modelos";
import { cadeia, catalogoVivo, saldoOpenRouter, type ModeloVivo } from "@/estudio/openrouter";
import { dentro, lerConfig, NAO_AUTORIZADO, salvarConfig } from "@/estudio/sessao";
import type { Tarefa } from "@/estudio/tarefas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — tudo o que a página de admin mostra: escolha atual, preços vivos, saldo, estado e últimas gerações. */
export async function GET(req: Request) {
  if (!(await dentro())) return NAO_AUTORIZADO();
  // ?conferir=empresa/modelo — o modelo colado existe no OpenRouter? (nome e preço vivos)
  const conferir = new URL(req.url).searchParams.get("conferir");
  if (conferir) {
    const vivo = await catalogoVivo().catch(() => null);
    if (!vivo) return Response.json({ existe: null });
    const m = vivo.find((x) => x.id === conferir.trim());
    return Response.json({ existe: !!m, modelo: m ? { nome: m.nome, entrada: m.entrada, saida: m.saida } : undefined });
  }
  const servidor = armazemDisponivel();
  const [conf, vivo, saldo, vapid, recentes] = await Promise.all([
    servidor ? lerConfig() : Promise.resolve(null),
    catalogoVivo().catch(() => null as ModeloVivo[] | null),
    saldoOpenRouter(),
    servidor ? chavesVapid().catch(() => null) : Promise.resolve(null),
    servidor ? ultimas().catch(() => []) : Promise.resolve([]),
  ]);
  const usada = conf ?? (process.env.ESTUDIO_MODELOS ? null : CONFIG_PADRAO);
  const precos: Record<string, { nome: string; entrada: number; saida: number; contexto: number } | null> = {};
  for (const id of [...CATALOGO.map((o) => o.id), ...MODELOS_GRATUITOS, ...(conf?.principal ? [conf.principal] : [])]) {
    const m = vivo?.find((x) => x.id === id);
    precos[id] = m ? { nome: m.nome, entrada: m.entrada, saida: m.saida, contexto: m.contexto } : null;
  }
  return Response.json({
    config: usada, salva: !!conf, viaVariavel: !conf && !!process.env.ESTUDIO_MODELOS,
    cadeia: cadeia(conf).map((e) => `${e.provedor}:${e.modelo}`),
    catalogo: CATALOGO, gratuitos: MODELOS_GRATUITOS, precos, catalogoVivo: !!vivo,
    estado: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      anthropic: !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN),
      armazem: servidor, notificacoes: !!vapid, saldo,
    },
    recentes,
  }, { headers: { "Cache-Control": "no-store" } });
}

/** POST {principal, gratuitosDeReserva, claudeDeReserva} — salva a escolha. */
export async function POST(req: Request) {
  if (!(await dentro())) return NAO_AUTORIZADO();
  if (!armazemDisponivel()) return Response.json({ ok: false, erro: "Sem armazém no servidor (SUPABASE_SERVICE_ROLE_KEY)." }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as Partial<ConfigModelos>;
  const principal = String(b.principal ?? "").trim();
  if (principal && !/^[\w.-]+\/[\w.:-]+$/.test(principal)) return Response.json({ ok: false, erro: "ID de modelo inválido (formato: empresa/modelo)." }, { status: 400 });
  const conf: ConfigModelos = { principal, gratuitosDeReserva: b.gratuitosDeReserva !== false, claudeDeReserva: b.claudeDeReserva !== false };
  await salvarConfig(conf);
  return Response.json({ ok: true, cadeia: cadeia(conf).map((e) => `${e.provedor}:${e.modelo}`) });
}

async function ultimas() {
  const nomes = (await listar("tarefas")).filter((x) => /^[0-9a-f-]{36}\.json$/.test(x.nome)).slice(0, 12);
  const ts = await Promise.all(nomes.map((x) => ler<Tarefa>(`tarefas/${x.nome}`).catch(() => null)));
  return ts.filter(Boolean).map((t) => ({
    id: t!.id, estado: t!.estado, dia: t!.dia, modelo: t!.modelo, uso: t!.uso, erro: t!.erro,
    criado: t!.criado, segundos: Math.round((t!.atualizado - t!.criado) / 1000),
  }));
}
