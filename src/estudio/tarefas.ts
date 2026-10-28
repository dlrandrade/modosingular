import { ler, salvar } from "./armazem";

/* Uma geração em andamento (ou terminada), guardada em tarefas/<id>.json.
   É o que a tela consulta quando volta do bloqueio ou de outro app. */
export type Tarefa = {
  id: string;
  estado: "rodando" | "pronto" | "erro";
  pedido: string;
  fase: string;
  caracteres: number;
  criado: number;
  atualizado: number;
  dia?: number;
  erro?: string;
  modelo?: string;
  uso?: { entrada: number; saida: number; custo?: number };
  push?: unknown;
};

export const caminhoTarefa = (id: string) => `tarefas/${id}.json`;
export const caminhoPush = (id: string) => `tarefas/${id}-push.json`;
export const idValido = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/.test(id);

export async function lerTarefa(id: string): Promise<Tarefa | null> {
  return ler<Tarefa>(caminhoTarefa(id));
}

/** Grava o andamento em fila (nunca duas gravações ao mesmo tempo) e com folga entre as de progresso. */
export function gravador(t: Tarefa, ativo: boolean) {
  let fila: Promise<void> = Promise.resolve();
  let ultima = 0;
  return (forcar = false): Promise<void> => {
    if (!ativo) return Promise.resolve();
    if (!forcar && Date.now() - ultima < 6000) return fila;
    ultima = Date.now();
    fila = fila.then(() => {
      t.atualizado = Date.now();
      return salvar(caminhoTarefa(t.id), t).catch(() => {});
    });
    return fila;
  };
}
