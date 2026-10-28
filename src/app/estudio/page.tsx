import publico from "@/estudio/dados/publico.json";
import { dentro } from "@/estudio/sessao";
import Entrar from "./ui/Entrar";
import Estudio, { type Publico } from "./ui/Estudio";

export const dynamic = "force-dynamic";

type Busca = Promise<Record<string, string | string[] | undefined>>;
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

/* ?tarefa=  → aberto pela notificação: mostra a geração (ou o resultado)
   ?pedido= / ?titulo= / ?link= → algo compartilhado com o app (Web Share Target) vira o pedido
   ?gerar=proximo → o atalho "Próximo dia" do ícone */
export default async function PaginaEstudio({ searchParams }: { searchParams: Busca }) {
  if (!(await dentro())) return <Entrar />;
  const q = await searchParams;
  const tarefa = um(q.tarefa);
  const pedido = [um(q.titulo), um(q.pedido), um(q.link)].filter(Boolean).join(" ").trim().slice(0, 600);
  return (
    <Estudio publico={publico as unknown as Publico} pedidoInicial={pedido}
      tarefaInicial={/^[0-9a-f-]{36}$/.test(tarefa) ? tarefa : ""} gerarAoAbrir={um(q.gerar) === "proximo"} />
  );
}
