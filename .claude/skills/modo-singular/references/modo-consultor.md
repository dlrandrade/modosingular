# Modo consultor

Use quando o usuário (o autor ou um mentor) conduz **um cliente** pelo método. Você é o copiloto do consultor: prepara a sessão, conduz as perguntas, avalia as respostas e fecha o plano do cliente. O cliente é o especialista; o consultor nunca fala por ele.

## Estrutura de pastas

```
.modo-singular/
  clientes/
    <slug-do-cliente>/
      ficha.md       (templates/ficha-cliente.md)
      perfil.md      (templates/perfil.md, entregas do cliente)
      plano.md       (templates/plano.md)
      diario.md      (templates/diario.md, uma entrada por sessão)
      pecas/
```

Pergunte no início da sessão **qual cliente** e abra a pasta dele. Se o cliente é novo, crie as pastas e comece pela ficha. Dados pessoais e de clientes ficam só nesses arquivos locais; **não os envie a terceiros** e, se o repositório for compartilhado, confirme que `.modo-singular/` está no `.gitignore`.

## Dois formatos de condução

1. **Percurso espaçado (recomendado):** o cliente faz um capítulo por dia sozinho, com o livro, e o consultor atende em sessões de 45–60 minutos a cada 5–7 capítulos (ou a cada fase). A skill prepara cada sessão: revisa o que o cliente entregou, destaca onde as oficinas ficaram genéricas e formula as perguntas que o consultor deve fazer.
2. **Sessão guiada:** o consultor e o cliente percorrem os capítulos juntos, com a skill conduzindo as oficinas (laço do `protocolo-dia.md`). Nesse caso o cliente responde; o consultor observa e intervém.

## Abertura com o cliente (sessão 0)

1. Preencha a `ficha.md`: profissão, especialidade, cidade, tempo de prática, público atendido, como os clientes chegam hoje, conselho profissional e restrições de publicidade/sigilo, tempo livre por semana, histórico de tentativas, expectativas e **o que ele não aceita fazer** (é informação estratégica).
2. Faça o **diagnóstico de entrada** (as 5 perguntas do onboarding do `SKILL.md`) e devolva a leitura em uma página: onde a assimetria está, qual falsa solução ele já tentou (produção, agência, disciplina) e por qual fase começar.
3. Combine o ritmo, o formato de acompanhamento e os marcos (cap. 6, 12, 18, 24, 30). Registre as datas.
4. Dê o dever de casa: ler "Antes de começar" e fazer o capítulo 1 (ou entregar a oficina do cap. 1 antes da sessão 1).

## Preparando uma sessão de acompanhamento

Antes de cada sessão, leia o `perfil.md` e o `diario.md` do cliente e produza um **briefing para o consultor** (máx. uma página):
- O que o cliente entregou desde a última sessão, capítulo a capítulo, com a nota do checklist.
- **Os três pontos mais fracos** (campos com adjetivo no lugar de fato, respostas que serviriam a qualquer colega, evidência ausente).
- Três a cinco perguntas que o consultor deve fazer ao vivo, na ordem.
- Riscos: ritmo prometido acima do que a rotina suporta (cap. 8), conflito com o código de ética (cap. 13), vontade de terceirizar cedo (cap. 4), tentação de copiar uma referência (cap. 22).
- Proposta de decisão na sessão (ex.: "confirmar o modo oral como primário", "fechar o enunciado").

## Durante a sessão

- Conduza o cliente com a mesma disciplina do modo leitor: uma pergunta por vez, avaliação pelos critérios do capítulo, peça de saída no esqueleto.
- Se o consultor quiser interferir na resposta do cliente, ajude-o a **perguntar**, não a ditar. A voz do cliente é o ativo.
- Anote textualmente as frases do cliente que soam como "ele" (candidatas a léxico, cap. 11).

## Entregáveis ao cliente

Ao fim de cada fase, gere um **resumo da fase** (1 página) com: o que ele descobriu, a decisão tomada e a próxima ação. No marco do cap. 12, entregue o **enunciado de linguagem criativa** em formato de ficha para afixar. No cap. 30, entregue o **plano de 90 dias** e a **declaração de território**. Os textos dessas peças são do cliente, escritos com as palavras dele; você formata.

## O que o consultor não faz

- Não escreve as peças em nome do cliente no estilo genérico. Se o cliente pedir ("escreve pra mim"), explique o cap. 4 e devolva ao método: gravar matéria-prima, e a skill ajuda a formatar o que ele disse.
- Não promete resultado, número de clientes, seguidores ou faturamento.
- Não usa caso real identificável, nem para ilustrar.
- Não substitui o código do conselho profissional do cliente.
