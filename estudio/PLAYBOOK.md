# Estúdio Singular — Playbook

Este documento é a constituição do sistema. Quem produz o conteúdo do dia (você, o Claude, um assistente) lê isto primeiro e obedece a isto sempre. Ele funciona sozinho: serve como arquivo de conhecimento de um Projeto no Claude e como a base da skill `singular-diario`.

## 1. O que é

Um conhecimento do livro **Modo Singular** por dia, entregue em três peças que se explicam mutuamente:

1. **Roteiro de Reels** para teleprompter, na estrutura de retenção progressiva (seção 3).
2. **Carrossel** de 8 slides, com a figura do livro redesenhada para o celular como peça central (seção 4).
3. **Legenda** do carrossel (seção 5).

Um destino único: quem vê a peça quer **aplicar a singularidade à sua própria presença** e, na hora certa, conhecer o **Método Singular** (seção 7).

Nomes: *Modo Singular* é o livro/apostila; *Método Singular* é o programa que se vende. Quem lê as peças precisa ver essa distinção sem esforço: o livro é a fonte, o método é o caminho.

## 2. A pauta do dia

Uma pauta é **uma figura do livro** (49 no total, em `banco.yaml`). A figura é o osso da peça: tudo o que se diz precisa ser explicado por ela. Antes de escrever, responda por escrito:

- **A ideia do dia, numa frase.** Se não cabe numa frase, a pauta está grande demais: corte.
- **O que a figura mostra que a fala sozinha não mostra.** Se a figura só repete a fala, escolha outra pauta.
- **O detalhe que só o livro tem** (a cena, o caso, a conta). É ele que impede a peça de parecer genérica.

Fonte única: o capítulo em `apostila/texto/capNN.md`. Não se inventa conteúdo fora dele. Se a peça precisa de um fato que o capítulo não traz, o fato não entra.

## 3. Roteiro de Reels

Estrutura obrigatória: **HOOK → LEAD → BODY 1 → OPEN LOOP 1 → BODY 2 → OPEN LOOP 2 → BODY 3 → CTA.**

| Etapa | Função | Regra prática |
|---|---|---|
| HOOK | Quebrar o padrão de rolagem | 1 a 3 segundos, até 22 palavras. Cena, número ou afirmação específica. Nada de cumprimento, apresentação, nem "Você sabia?". |
| LEAD | Sustentar até ~12 s | Mostra por que vale ficar. Cria expectativa. Não entrega a resposta. |
| BODY 1 | Primeira entrega de valor | Algo que a pessoa já sai sabendo. Específico, direto. |
| OPEN LOOP 1 | Primeira lacuna | Uma frase. Nasce do que acabou de ser dito; promete algo que será resolvido. |
| BODY 2 | Segunda entrega | Resolve o loop 1. Acrescenta informação nova, não reformula a anterior. |
| OPEN LOOP 2 | Segunda lacuna | Uma frase. Contraste, consequência inesperada ou parte ainda não revelada. |
| BODY 3 | Entrega final | Resolve o loop 2. A parte mais aplicável. Termina numa frase que a pessoa repete. Nenhuma promessa fica sem resposta. |
| CTA | Próximo passo | Uma ação, consequência natural do que foi dito (seção 7). |

**Duração e tamanho.** O teleprompter corre a ~3 palavras por segundo. Alvos de palavras: 30 s → 80–100; 45 s → 118–142; 60 s → 158–195. O padrão é 45 a 60 s.

**Regras de fala** (valem para o roteiro inteiro):
1. Escreva para ser dito, não lido. Frase curta, ordem direta, uma ideia por frase.
2. O loop não é truque: tem que nascer do conteúdo e ser resolvido no mesmo vídeo.
3. Cada BODY acrescenta algo. Se o BODY 2 só reformula o 1, falta conteúdo, não falta frase.
4. Storytelling, exemplo e contraste entram quando explicam. Cena do livro antes de definição.
5. Nada de clichê, exagero ou promessa sem fundamento.
6. Proibido "não é X, é Y" e variações ("não é sobre X, é sobre Y").
7. Proibido abrir com "Você sabia?", "Vou te contar um segredo", "E o pior?", "Gente,".
8. Sem exclamação. A energia vem do que se diz, não da pontuação.

**Entrega do roteiro** (feita pelo `estudio.py render`): primeiro, o roteiro dividido nas oito etapas; depois a **versão final para gravação**, em texto corrido, sem títulos nem marcações, pronta para o teleprompter.

## 4. Carrossel (8 slides)

Receita padrão. Um slide, uma ideia; até ~40 palavras por slide.

| # | Slide | Função |
|---|---|---|
| 1 | **Capa** | O gancho do carrossel. Não repete o hook do Reels: é a mesma ideia por outra porta. |
| 2 | **Cena** | A situação do livro que abre o assunto. |
| 3 | **Virada** | O detalhe que não fechava; a tensão. |
| 4 | **Figura** | O elemento gráfico do livro, com título que diz a conclusão e legenda curta. É o centro da peça. |
| 5 | **Leitura da figura** | Aplica a figura ao caso da cena (lista de 3 itens, no máximo). |
| 6 | **A ideia do dia** | Uma frase só, fundo escuro. A que a pessoa vai citar. |
| 7 | **Faça agora** | Exercício de 5 minutos, em passos. Vem do capítulo (oficina ou rede). |
| 8 | **CTA** | Uma ação, mais a assinatura do Método Singular. |

**A figura é sempre a que explica o que está sendo dito.** Os dados YAML vêm do bloco `figura` do capítulo; o `carrossel.py` redesenha para 1080×1350 (o desenho do livro foi feito para a coluna impressa e não sobrevive no celular). Tipos prontos: camadas, fluxo/passos, barras, balança, escada, funil, gap, quadrante, espectro. Faltam: linha, matriz, órbita, ficha, área (criar o template antes do dia chegar, ou escolher outra pauta).

Figura com valores inventados leva o selo "esquema ilustrativo" (herdado do livro). Nunca se apresenta valor ilustrativo como dado.

## 5. Legenda do carrossel

Estrutura, de 600 a 1.400 caracteres (limite duro: 2.200):

1. **Primeira linha**: a ideia do dia como afirmação específica. É o que aparece antes do "mais".
2. **A cena** do livro em duas ou três frases.
3. **A explicação**: o que a cena mostra, em linguagem de colega para colega.
4. **O exercício**, em uma frase corrida e concreta.
5. **O CTA** (uma ação) e, por último, a linha de procedência: de qual capítulo do Método Singular vem a ideia e que a personagem é composta.
6. Até 5 hashtags, no fim. Pode não ter nenhuma.

## 6. Voz

A voz é a do livro: um mentor sênior, direto e respeitoso, que fala com um colega inteligente. Calor contido, humor seco e raro. Português do Brasil culto e conversado. O livro é a referência: `apostila/ORQUESTRADOR.yaml`, seções `voz` e `antivicios`. O verificador lê essa lista de expressões proibidas e aplica a todas as peças. Em resumo:

- Cena e detalhe de ofício antes de adjetivo. "Um carrinho de supermercado" vale mais do que "um detalhe importante".
- Profissões específicas, nunca "um profissional" genérico.
- Sem jargão de coach ou de marketing (mindset, storytelling, insight, branding, "conteúdo de valor", "virar a chave", "próximo nível").
- Sem anglicismo desnecessário, sem gerundismo, sem "jornada".
- Segunda pessoa ("você"). O "eu" é para opinião, nunca para fabricar biografia.

## 7. CTA: levar ao Método sem vender barato

**Princípio.** O CTA é a consequência do que foi dito, não um anúncio colado no fim. A pessoa acabou de aprender algo e de sentir que podia aplicar. O CTA a ajuda a dar o próximo passo, e o próximo passo mais honesto é *fazer o exercício*. O Método Singular entra como a continuação natural dele ("esse exercício é o capítulo 9 do Método Singular"), nunca como a razão pela qual a peça existe.

**Uma ação por peça.** O Reels e o carrossel de um mesmo dia podem pedir ações diferentes, mas cada um pede uma só. A assinatura do Método ("Método Singular, em breve") não conta como pedido.

**Escada de três degraus**, em cadência semanal (configurável em `marca.yaml`):

| Degrau | O que pede | Quando | Exemplo |
|---|---|---|---|
| **Prática** | Fazer o exercício, no papel, sem postar nada | 4 dos 7 dias | "Antes de dormir, escreva a última decisão difícil que você tomou na sua área, e o motivo." |
| **Conversa** | Responder com uma palavra ou uma frase curta | 2 dos 7 dias | "Comente a camada em que a sua semana mais se concentra: informação, padrão, exceção ou critério." |
| **Método** | Conhecer o Método Singular | 1 dia (o 7º) | "Isso é o capítulo 9 do Método Singular. Quem quiser ser avisado quando abrir, o link está na bio." |

**O que o CTA de método nunca faz:** urgência falsa, escassez inventada, "últimas vagas", promessa de resultado, comparação com quem "ainda está perdido", "você está deixando dinheiro na mesa". O argumento é só este: *você acabou de fazer, em cinco minutos, o começo do que o Método faz em trinta dias.*

**Enquanto o método estiver "em breve"** (`marca.yaml › oferta.estado`), o degrau Método convida à lista de espera, e as peças dos outros dias terminam com a assinatura. Quando abrir, troque o estado e a ação; os kits antigos não precisam mudar.

## 8. Honestidade e proteção

Estas regras valem mais do que o gancho. Se a peça ficar melhor quebrando uma delas, a peça fica pior.

1. **Personagens são compostos.** Renata, Otávio, Lúcia e Caio não são clientes reais. Em toda peça que usa um caso do livro, o leitor precisa poder saber disso (na fala, na tela ou na legenda): "cena do livro", "personagem composta". Nunca "um cliente meu", "uma paciente que atendi", "uma aluna minha".
2. **O "eu" não inventa biografia.** Daniel Luzz pode opinar ("eu acho", "a posição do livro é"), nunca contar um episódio da própria vida que o livro não traz.
3. **Nenhum número inventado como dado.** Percentuais, ganhos, prazos de resultado só entram se vierem do capítulo, e como o capítulo os apresenta (ilustrativo, hipotético, conta do leitor).
4. **Nenhuma promessa de resultado.** Nada de "mais clientes", "viralizar", "faturar". O que se promete é clareza e método.
5. **Sigilo.** Os exercícios que pedem casos reais mandam omitir nome e dado que identifique. Profissões regulamentadas (saúde, direito, psicologia) têm código de publicidade: não se estimula o público a expor atendimento.
6. **O dossiê não é citado.** Ele não existe no repositório; não se inventam falas dele.
7. **Cada peça cita a origem** (capítulo do Método Singular) em algum ponto visível.

## 9. Checklist antes de publicar

- [ ] A ideia do dia cabe numa frase, e a figura a explica.
- [ ] O hook funciona sem contexto, em até 3 segundos.
- [ ] Os dois loops são resolvidos, e o BODY 2 e o BODY 3 trazem informação nova.
- [ ] Nenhum "não é X, é Y", nenhum "Você sabia?", nenhuma exclamação.
- [ ] A cena do livro está identificada como personagem composta.
- [ ] O CTA pede uma ação só e decorre do que foi dito.
- [ ] O exercício (slide 7) pode ser feito em 5 minutos, sem expor ninguém.
- [ ] Os slides estão legíveis no celular (texto mínimo ~29 px em 1080).
- [ ] `estudio.py lint N` passa sem erros.

## 10. Como o Claude trabalha com este playbook

**No repositório (modo completo).** O Claude Code lê este playbook, roda `python3 estudio/estudio.py proximo`, lê o capítulo, escreve o kit em `estudio/kits/dia-NNN/kit.yaml`, roda `lint`, corrige e roda `render`. Saem o `roteiro.md`, a `legenda.md` e os slides em PNG. A skill `singular-diario` automatiza esse roteiro de trabalho.

**Num Projeto do Claude (modo texto, pelo celular).** Suba este arquivo e o texto dos capítulos como conhecimento do projeto. Para pedir o dia, use este prompt:

```
Siga o PLAYBOOK. Pauta do dia: capítulo [N], figura "[TÍTULO DA FIGURA]".
Duração do Reels: [45 | 60] s. Degrau do CTA: [prática | conversa | método].
Entregue: (1) roteiro nas 8 etapas e a versão final para gravação; (2) o carrossel de 8 slides,
slide a slide, com o YAML da figura; (3) a legenda. Rode o checklist da seção 9 e diga o que reprovou.
```

Nesse modo não há renderizador: o carrossel sai como texto e você monta as imagens no Canva ou volta ao repositório para gerar os PNGs.

## 11. Decisões em aberto (preencher em `marca.yaml`)

- `handle`: o @ do perfil, que aparece no rodapé dos slides.
- `oferta.acao_metodo`: o que de fato existe quando o CTA de método aparece (lista de espera? página? mensagem?).
- Quando a oferta abrir: mudar `oferta.estado` para `aberto` e ajustar a ação.
