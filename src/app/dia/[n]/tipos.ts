import type { Capitulo, QuizQuestion, BlocoEstrutura } from "@/content";

/**
 * O que o navegador realmente precisa receber.
 *
 * O corpo do capítulo (conteudo, insights, ilustracao) é renderizado no
 * servidor — mandar de novo em JSON dobraria o peso da página à toa.
 * E o gabarito do quiz fica fora: a correção acontece em server action,
 * então `correta` e `explicacao` nunca saem do servidor antes da resposta.
 */
export type PerguntaCliente = Pick<QuizQuestion, "id" | "pergunta" | "opcoes">;

export interface CapituloCliente {
  n: number;
  tema: Capitulo["tema"];
  conceito: Capitulo["conceito"];
  criterios: Capitulo["criterios"];
  tarefa: Capitulo["tarefa"];
  diretrizes: Capitulo["diretrizes"];
  teste?: Capitulo["teste"];
  quiz: PerguntaCliente[];
}

/** Material de publicação já montado no servidor, um capítulo por vez. */
export interface Publicar {
  roteiro: string;
  estrutura: BlocoEstrutura[];
  prompt: string;
}

export function paraCliente(cap: Capitulo): CapituloCliente {
  return {
    n: cap.n,
    tema: cap.tema,
    conceito: cap.conceito,
    criterios: cap.criterios,
    tarefa: cap.tarefa,
    diretrizes: cap.diretrizes,
    teste: cap.teste,
    quiz: cap.quiz.map((q) => ({ id: q.id, pergunta: q.pergunta, opcoes: q.opcoes })),
  };
}
