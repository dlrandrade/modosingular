# Estúdio Singular — Manual de criação

O PLAYBOOK diz *o que* o sistema é. Este manual diz *como* cada campo de cada peça é feito, um a um, com tamanho, molde, fonte no livro e exemplos. Ele existe para que o resultado dependa do método, e não de quem escreve: duas pessoas (ou dois modelos) seguindo este manual sobre a mesma pauta devem chegar a peças quase iguais.

Regra de leitura: **onde este manual dá uma regra, ela vale; onde dá um molde, use um dos moldes; onde dá um exemplo, ele é o padrão de acabamento.** Não invente fórmula nova quando houver molde que sirva.

---

## 0. A ordem de trabalho (nunca pule etapa)

1. Ler o capítulo inteiro (`apostila/texto/capNN.md`), inclusive os blocos.
2. Preencher a **ficha** (seção 1). Nada se escreve antes da ficha completa.
3. Escrever o **roteiro** a partir da ficha (seção 2).
4. Escrever o **carrossel** a partir da ficha e do roteiro (seção 3).
5. Escrever a **legenda** (seção 4).
6. Rodar o **checklist** (seção 8) e o verificador (`estudio.py lint N`).

## 0.1 Para quem você escreve: topo do funil

Quem vê o Reels e o carrossel **nunca ouviu falar de Daniel Luzz, do livro nem de nenhum termo dele.** Chegou rolando a tela. A ficha usa a linguagem do livro; tudo o que vai para o público usa a linguagem de quem está do outro lado.

Regras:
1. **O gancho e a introdução partem da vida da pessoa**, com as palavras que ela usaria para contar o problema a um colega ("posto e ninguém responde", "sei muito e pareço igual a todo mundo"). Nenhum termo do livro no gancho.
2. **Mostre, depois nomeie.** O conceito do dia (campo `conceito` da ficha) só aparece com nome depois de descrito em palavras comuns: "...o que ela sabe por ter atendido muita gente, inclusive quem fugiu do manual. Isso é repertório." No máximo um conceito com nome por dia.
3. **O livro não aparece no corpo.** Nada de "no livro", "o método", "capítulo 9", "Modo Singular" no roteiro (exceto o CTA de convite) e nos slides (exceto o CTA de convite). Na legenda, uma única menção, na última linha, explicando o que ele é.
4. **Personagem composta, em palavras comuns:** "Cena ilustrativa. [Quem] é uma personagem criada a partir de casos reais."
5. **Teste do estranho:** releia cada frase como alguém que nunca viu o perfil. Se precisar de contexto, reescreva.

**Tradução obrigatória (palavras de dentro → palavras do público):**

| Na ficha e no livro | No Reels, no carrossel e na legenda |
|---|---|
| peça | post, vídeo, carrossel |
| caderno de campo | uma nota no celular, um caderno onde você anota os casos |
| matéria-prima | o que acontece no seu dia de trabalho |
| oficina | exercício |
| pauta | assunto |
| tese | o que você defende |
| repertório, critério, a distância (e outros conceitos) | primeiro a coisa em palavras comuns; o nome, se vier, depois |
| personagem composta | personagem criada a partir de casos reais |
| capítulo N, o método, o livro | (nada; o livro só no convite e na última linha da legenda) |
| o singular / o comum | o que só você diria / o que todo mundo diz |

---

## 1. A ficha da pauta (8 decisões, nesta ordem)

A ficha é a parte editorial. Ela vai no kit (`ficha:`) e é dela que tudo sai. Cada campo tem uma fonte obrigatória no capítulo.

| # | Campo | Fonte no capítulo | Regra |
|---|---|---|---|
| 1 | `ideia` | um dos três itens do bloco `guardar` | Escolha o item que a figura da pauta explica. Reescreva em até 14 palavras, como frase que alguém repetiria. |
| 2 | `conceito` | bloco `conceito` (termo + definição) | Copie o termo. A definição em até 20 palavras, em linguagem falada. No público, o termo só aparece depois da definição (seção 0.1). |
| 3 | `cena` | a cena de abertura do capítulo, ou a cena em que a figura aparece | Quem (profissão, nunca o nome no gancho), onde, o que fez. Uma frase. |
| 4 | `detalhe` | a própria cena | O objeto, número ou frase concreta que só o livro tem (o carrinho de supermercado, as onze linhas, "isso não estava na sua lista"). Se a cena não tem detalhe concreto, troque de cena. |
| 5 | `figura` | o bloco `figura` da pauta | Diga em uma frase o que ela mostra e qual elemento é o destacado (o último, ou o marcado com `destaque`). |
| 6 | `virada` | o parágrafo logo depois da figura | O que muda na cabeça de quem lê, em até 16 palavras. É a resposta ao segundo gancho de curiosidade. |
| 7 | `aplicacao` | bloco `exemplo` (comum × singular), se houver; senão, a seção 6 | Profissão diferente da cena (tabela 6.2), situação concreta, e a forma do slide de exemplo (tabela 6.1). |
| 8 | `exercicio` | bloco `oficina` (objetivo + primeiros campos) | Três passos, cinco minutos, no papel, sem expor ninguém. Verbo no imperativo no começo de cada passo. |

E dois campos que não são escolha, são consulta:

- `cta_nivel`: o que `estudio.py proximo` disser (prática, conversa ou convite, pela cadência da semana).
- `duracao`: 60 s quando a cena precisa de contexto (quase sempre); 45 s quando a ideia é uma comparação direta.

**Exemplo de ficha (Dia 1, capítulo 9):**

```yaml
ficha:
  ideia: "Informação todo mundo tem; critério, só quem decidiu muitas vezes."
  conceito: "Repertório: o que você sabe por ter visto muitas vezes, inclusive quando a regra falhou."
  cena: "Uma fisioterapeuta lista tudo o que sabe sobre coluna; dias depois, conta um único paciente por quinze minutos."
  detalhe: "Onze linhas que um aluno do quarto período escreveria; o paciente que só fazia mercado apoiado no carrinho."
  figura: "Cinco camadas do saber; as duas de cima estão nos livros, as três de baixo só a prática dá; o destaque é o critério."
  virada: "A camada que decide a escolha do cliente é a que quase ninguém publica: o critério."
  aplicacao: "Professora de piano decide corrigir um erro numa aluna e não na outra; forma: post."
  exercicio: "Escolha uma decisão difícil recente; anote a saída descartada; escreva o motivo em uma frase, sem identificar ninguém."
```

---

## 2. O roteiro do Reels, etapa por etapa

Estrutura fixa: **Gancho → Introdução → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → CTA.**
Ritmo do teleprompter: 3 palavras por segundo.

### 2.1 Orçamento de palavras

| Etapa | Chave | 45 s | 60 s | Função |
|---|---|---|---|---|
| Gancho | `hook` | 9–12 | 10–14 | parar a rolagem (≤ 3 s para a 1ª frase) |
| Introdução | `lead` | 14–20 | 16–22 | segurar até ~10 s; hook + lead ≤ 34 |
| Desenvolvimento 1 | `body1` | 22–28 | 26–34 | mostrar o conceito em palavras comuns e só então nomeá-lo |
| Gancho de curiosidade 1 | `loop1` | 8–12 | 8–14 | prometer a parte 2 |
| Desenvolvimento 2 | `body2` | 18–24 | 20–28 | resolver o loop 1 com informação nova |
| Gancho de curiosidade 2 | `loop2` | 6–10 | 6–12 | prometer a parte 3, a mais valiosa |
| Desenvolvimento 3 | `body3` | 26–34 | 36–48 | resolver o loop 2 e fechar com a frase da ideia |
| CTA | `cta` | 18–24 | 30–40 | uma ação, consequência do que foi dito |
| **Total** | | **118–142** | **158–192** | |

### 2.2 Gancho (`hook`)

Regras: no máximo 14 palavras; a primeira frase com no máximo 9; pelo menos um substantivo concreto (objeto, número, profissão); nada de cumprimento, apresentação, "Você sabia?", "Vou te contar", "Pare de", pergunta retórica genérica.

Escolha **um** destes moldes (rodando ao longo da semana):

| Molde | Forma | Exemplo |
|---|---|---|
| G1 Cena com número | [Profissional] [fez algo]. [Resultado com número]. | "Uma fisioterapeuta listou tudo o que sabe sobre coluna. Deu onze linhas." |
| G2 Detalhe improvável | [Objeto comum] decidiu [algo sério]. | "Um carrinho de supermercado mudou um diagnóstico de hérnia." |
| G3 Frase ouvida | "[Frase dita no livro]." [Quem disse, em 3 palavras]. | "Isso aí não estava na sua lista. Foi o que a irmã disse." |
| G4 Conta que incomoda | [Número] [unidade] [fazendo algo] para [resultado pequeno]. | "Onze fins de semana editando para seis vídeos que ninguém lembrou." |
| G5 Pergunta que o espectador responde de verdade | Quantas / Qual das [coisas da rotina dele] [critério]? | "Quantos dos seus últimos dez posts um colega poderia ter assinado?" |
| G6 Erro com custo | [Profissional] perde [coisa concreta] toda vez que [hábito comum]. | "Uma psicóloga perde uma sessão inteira desfazendo um vídeo de quarenta segundos." |

Errado: "Você já parou para pensar no seu posicionamento?" (genérico, sem objeto). "Não é sobre postar mais, é sobre postar melhor." (fórmula proibida).

### 2.3 Introdução (`lead`)

Regras: continua o gancho sem explicar; termina com uma tensão aberta; hook + lead ≤ 34 palavras.

| Molde | Forma | Exemplo |
|---|---|---|
| I1 A cena anda | [Tempo depois], [o mesmo personagem] [fez o contrário]. | "Dois dias depois, ao telefone, ela falou quinze minutos sobre um único paciente." |
| I2 A aposta sobe | E é por isso que [consequência na vida do espectador]. | "E é por isso que o seu perfil parece o de qualquer colega." |
| I3 Contraste de cena | [Na lista / no perfil], [X]. [Na conversa / no consultório], [Y]. | "No perfil, onze tópicos. No consultório, catorze anos de casos." |

### 2.4 Desenvolvimento 1 (`body1`)

Função: dar nome ao que aconteceu, com o **termo do bloco `conceito`**. Estrutura em três frases: (a) o que a primeira coisa tinha; (b) o que a segunda tinha; (c) "Isso é [termo]." ou "[Termo] é [definição curta]."

Exemplo: "A lista tinha o que todo colega encontra em livro. A conversa tinha o que ela sabe por ter atendido muita gente, inclusive quem fugiu do manual. Isso é repertório."

### 2.5 Ganchos de curiosidade (`loop1`, `loop2`)

Regras: uma ou duas frases curtas; nascem da frase anterior; prometem algo que **será dito neste vídeo**; o loop 2 promete a parte mais valiosa.

| Molde | Exemplo |
|---|---|
| C1 Contagem | "Ele tem três camadas. A mais valiosa quase ninguém publica." |
| C2 A exceção | "Mas tem um caso em que isso falha, e ele é o mais comum." |
| C3 A consequência | "E isso custa uma coisa que nenhum número do aplicativo mostra." |
| C4 O que decide | "A terceira decide quem o paciente escolhe." |
| C5 O erro caro | "É aqui que quase todo especialista erra, e erra sem perceber." |

Proibido: "Mas espera, que tem mais", "Fica até o final", "E o melhor vem agora", qualquer promessa que o vídeo não cumpre.

### 2.6 Desenvolvimento 2 (`body2`)

Função: resolver o loop 1 com informação nova, tirada dos **elementos da figura** que não são o destacado. Duas frases paralelas funcionam bem ("Primeiro, …: … Depois, …: …"). Nada de reformular o body 1.

### 2.7 Desenvolvimento 3 (`body3`)

Função: entregar o elemento **destacado** da figura, aplicado ao **detalhe** da ficha, e fechar com a **ideia** (campo 1 da ficha), em forma que se repete.

Estrutura: (a) o nome do elemento e o que ele é, numa frase; (b) o detalhe da cena mostrando esse elemento; (c) a frase da ideia, em duas partes curtas.

Moldes para a frase final (escolha um; nunca "não é X, é Y"):
- "[A] todo mundo tem. [B], só quem [condição]." — "Informação todo mundo tem. Critério, só quem decidiu muitas vezes."
- "[A] se aprende em [lugar]. [B], em [outro lugar]." — "Técnica se aprende no curso. Critério, no caso que deu errado."
- "Quem [faz A] [resultado]. Quem [faz B] [resultado melhor]."

### 2.8 CTA (`cta`)

Uma ação só, a do degrau do dia. Estrutura: (a) a ação, concreta, com prazo curto; (b) por que ela vale (uma frase que liga ao conteúdo, sem citar livro nem capítulo). Só no degrau convite entra (c): o livro explicado para quem não o conhece, "Escrevi um livro sobre isso, o Modo Singular, para especialistas que sabem muito e aparecem pouco."

| Degrau | Molde da ação | Exemplo |
|---|---|---|
| Prática | "[Hoje / Antes de dormir], escreva [o exercício em uma frase]." | "Antes de dormir, escreva a última decisão difícil que você tomou na sua área, e o motivo." |
| Conversa | "Comente [uma palavra entre opções do vídeo / a sua resposta curta a uma pergunta]." | "Comente em qual das cinco camadas a sua última semana de posts ficou." |
| Convite | "[O livro em uma frase]. O link está na bio." | "Escrevi um livro sobre isso, o Modo Singular, para especialistas que sabem muito e aparecem pouco. O link está na bio." |

O pedido de "salvar" é do carrossel, não do Reels. "Siga para mais" não é CTA deste sistema.

---

## 3. O carrossel, slide a slide (9 slides)

Regras gerais:
- Um slide, uma ideia. Os limites de palavras abaixo são máximos.
- **Itálico**: no máximo uma expressão por slide, sempre a que carrega a ideia (vira Garamond dentro do título). Negrito: quase nunca.
- Nada de emoji, seta desenhada com texto, exclamação, hashtag.
- O carrossel não copia o roteiro: diz a mesma ideia por outra porta, com menos palavras.
- **Fundos pela função** (cores do Modo Singular; campo `fundo` do slide). A cor muda quando muda o papel do slide, nunca por enfeite. Padrões, que o renderizador já aplica:

| Função | Fundo | Por quê |
|---|---|---|
| capa, virada | `claro` (#faf9f6) | o papel da marca: começo limpo |
| cena, leitura da figura | `areia` (#f2f0ea) | tom de narrativa: aqui se conta |
| figura, faça agora | `branco` (#ffffff) | máxima legibilidade do desenho e dos passos |
| a ideia do dia | `escuro` (#0b0c0f) | a frase para guardar; o contraste marca o pico |
| como ficaria | `ouro-claro` (#f0e6cf) | a aplicação: o leitor reconhece o momento de copiar a estrutura |
| CTA | `ouro` (#9a7328) | o fechamento, com a cor da marca |

  Só escreva `fundo` quando o slide fugir do padrão do tipo (no slide da cena, `fundo: areia`). Nunca dois slides vizinhos escuros ou dourados.

| # | Tipo | Campos | Limites | Fonte | Regra |
|---|---|---|---|---|---|
| 1 | `capa` | `titulo`, `sub` | título 6–12 palavras; sub ≤ 9 | detalhe + ideia | O título é o detalhe concreto que provoca (G1/G2/G4 sem o verbo inicial). O sub diz do que se trata, em itálico natural. |
| 2 | `texto` (a cena) | `rotulo: "A cena"`, `fala`, `tag`, `medio: true`, `fundo: areia` | fala ≤ 26 palavras | cena | Termina na emoção ou no detalhe. `tag` fixa: "Cena ilustrativa. [Quem] é uma personagem criada a partir de casos reais." |
| 3 | `texto` (a virada) | `rotulo` (tempo ou contraste), `fala`, `apoio` | fala ≤ 12; apoio ≤ 16 | a segunda metade da cena | A frase que vira a chave da cena; o apoio é a fala de alguém ou o fato que confirma. |
| 4 | `figura` | `titulo`, `figura: "LIVRO"`, `legenda` | título ≤ 8; legenda ≤ 24 | bloco `figura` | O título diz a **conclusão** da figura, não a descrição ("O que você sabe vem em *cinco camadas*", e não "Figura das camadas"). A legenda é a do livro, encurtada se preciso. É o slide do elemento primordial: siga a seção 3.2. |
| 5 | `lista` (a leitura) | `rotulo`, `fala`, `itens` (3) | fala ≤ 8; cada item ≤ 22 | figura × cena | Cada item é um elemento da figura aplicado à cena. Os rótulos dos itens são os nomes dos elementos. |
| 6 | `texto` (a ideia do dia) | `fala`, `fundo: escuro`, `grande: true` | ≤ 12 palavras | ficha.ideia | A frase final do body 3, sem rótulo. É o slide que as pessoas fotografam. |
| 7 | `exemplo` (como ficaria) | `forma`, `titulo`, `quem`, campos da forma, `nota` | ver 6.1 | ficha.aplicacao | Mostra a aplicação numa profissão diferente, de um jeito que dê para copiar a estrutura. `nota` começa com "Exemplo ilustrativo:". |
| 8 | `figura` (faça agora) | `rotulo: "Agora, o seu"`, `titulo`, `figura: {tipo: passos, nos: [3]}`, `legenda` | título ≤ 5; rótulo do passo ≤ 7; nota ≤ 10 | ficha.exercicio | Título molde: "Faça em *cinco minutos*". A legenda diz o que o resultado é ("Esse motivo é o primeiro rascunho do seu critério."). |
| 9 | `cta` | `titulo`, `apoio`, `acao` | título ≤ 9; apoio ≤ 22; ação ≤ 6 | degrau | Título molde: "Você já tem [o que a figura revelou]. Falta [verbo]." Apoio: por que vale fazer, ligado à ideia ("Cinco minutos, no papel. É a parte do seu trabalho que ninguém encontra numa busca."); só no convite, o livro em uma frase ("Escrevi um livro sobre isso, para especialistas que sabem muito e aparecem pouco."). Ação no carrossel: prática → "Salve para fazer [quando]"; conversa → "Responda nos comentários"; convite → a de `marca.yaml`. |

Slide extra (o 10º, quando precisar): o slide de **foco** da seção 3.2.

### 3.2 O elemento primordial (proteja a forma dele)

Todo slide tem um elemento que é o cerne: a figura, a frase, o post do exemplo. Quando o slide é sobre ele, tudo o mais se afasta:

1. **Ele ocupa a maior área do slide** e fica no centro óptico (um pouco acima do meio).
2. **Ar em volta.** Nada encosta nele: entre ele e qualquer outro texto, no mínimo a altura de uma linha do título. Nenhum enfeite, nenhum segundo destaque.
3. **No máximo uma linha de texto com ele.** No slide da figura, o título (≤ 8 palavras) e, se couber, a legenda (≤ 24). Se a figura tiver 5 elementos ou mais, ou notas longas, **a legenda sai** e o que ela dizia vai para o slide seguinte (a leitura da figura).
4. **Um destaque só, dentro dele** (o elemento dourado da figura). O título não compete: o itálico do título nomeia o mesmo elemento destacado.
5. **Slide dedicado, só se precisar.** Se, mesmo sem legenda, a figura ainda disputa espaço (6 elementos ou mais, ou mais de ~85 palavras dentro dela), divida em dois: um slide `texto` com o título (a conclusão) e, logo depois, o slide da figura com `foco: true` (a figura sozinha, sem título nem legenda). Isso faz o carrossel ter 10 slides. **Nunca use `foco` por padrão:** uma figura que cabe com o título não ganha slide próprio.

O verificador mede a densidade (palavras dentro da figura + título + legenda) e avisa quando passa do ponto.

### 3.1 Como a leitura da figura muda com o tipo dela

| Tipo de figura | O que o slide 5 (leitura) mostra | O que o body 3 entrega |
|---|---|---|
| camadas | as camadas de baixo, na cena | a camada destacada (a mais funda) |
| fluxo / passos | o passo em que a cena tropeçou | o passo destacado, e o que muda ao fazê-lo |
| barras | a comparação, item a item | a barra destacada e o porquê da diferença |
| escada / funil | em que degrau a cena estava | o último degrau, e o que leva até ele |
| gap | as duas medidas na cena | a distância, e o que a encurta |
| balança | os dois pesos na cena | o que pesa mais, e por que costuma ser ignorado |
| quadrante | onde ficam as outras opções | onde mora o ponto destacado |
| espectro | onde a cena estava | o ponto de virada (marca destacada) |

---

## 4. A legenda (600 a 1.400 caracteres)

| Parágrafo | Conteúdo | Tamanho |
|---|---|---|
| 1 | A ideia como afirmação específica (aparece antes do "mais") | ≤ 110 caracteres |
| 2 | A cena em 2–3 frases, contada sem pressupor o livro ("Uma fisioterapeuta tenta listar…") | 220–320 |
| 3 | A explicação: primeiro a coisa em palavras comuns, depois o nome do conceito; os elementos da figura | 180–280 |
| 4 | Por que isso decide a escolha do cliente, e por que quase ninguém publica | 120–220 |
| 5 | O exercício em frase corrida, com a regra de não identificar ninguém | 180–260 |
| 6 | O CTA do carrossel, numa linha | ≤ 80 |
| 7 | Procedência, para quem não conhece: "[Quem] da cena é uma personagem criada a partir de casos reais. Este exercício vem do Modo Singular, um livro que escrevi para especialistas que sabem muito e aparecem pouco." (sem número de capítulo) | ≤ 220 |
| 8 | Até 3 hashtags (opcional): #posicionamento #autoridade #especialistas ou do tema | — |

---

## 5. Voz em uma página

- Fale como um colega sênior que já viu muitos casos: frase direta, detalhe de ofício, nenhum adjetivo de efeito.
- Concreto antes de abstrato: o carrinho, as onze linhas, a terça às sete da noite.
- Segunda pessoa ("você"). O "eu" de Daniel só para opinião ("o que eu defendo"), nunca para inventar história.
- Frase curta no vídeo; frase completa na legenda.
- Itálico para a palavra que carrega a ideia; nunca para enfeitar.

**Troque sempre:**

| Em vez de | Escreva |
|---|---|
| conteúdo de valor | o que você sabe / o que só você viu |
| engajamento | resposta / quem comenta |
| autoridade (sozinha) | a autoridade que o perfil mostra / a que o consultório mostra |
| jornada | caminho / trinta capítulos |
| potencializar, alavancar | aumentar, fazer render |
| insight | percepção / o que você notou |
| storytelling | contar o caso |
| dica | critério / regra / o que eu faço |
| "Gente," "Pessoal," | (nada; comece pela frase) |
| peça, caderno de campo, matéria-prima, oficina, pauta, tese | as palavras do público (tabela da seção 0.1) |

---

## 6. O slide de exemplo ("como ficaria")

### 6.1 Qual forma usar

Nunca repita a forma do dia anterior. Entre as formas permitidas, escolha pela natureza da ideia:

| Se a ideia do dia é… | Use a forma | O que ela mostra |
|---|---|---|
| um jeito de escrever ou de dizer | `post` | o post pronto, em 2–3 parágrafos, na primeira pessoa de quem posta |
| uma diferença entre o comum e o singular | `antes_depois` | a frase comum (cinza) e a singular (forte), com o porquê |
| um hábito de captura ou de anotação | `rascunho` | as linhas de um caderno ou de uma nota no celular, como foram escritas |
| uma resposta a cliente ou paciente | `conversa` | a pergunta e a resposta, em duas falas |

Campos e limites:
- `post`: `perfil` (profissão), `texto` com 2–3 parágrafos, 45–70 palavras no total; termina numa frase de critério.
- `antes_depois`: `comum` ≤ 30 palavras (correta e genérica); `singular` ≤ 30 (com padrão, sinal ou critério); `porque` ≤ 22.
- `rascunho`: 4–6 linhas de até 8 palavras, com abreviação natural de caderno.
- `conversa`: `pergunta` ≤ 18 palavras, na voz do cliente; `resposta` ≤ 35, na voz do profissional, com o critério dentro.
- Sempre `titulo` ≤ 6 palavras com uma palavra em itálico, `quem` (profissão + situação, ≤ 12 palavras) e `nota` começando por "Exemplo ilustrativo:".

### 6.2 Qual profissão usar

1. Diferente da profissão da cena do dia.
2. Diferente das profissões dos exemplos dos três dias anteriores.
3. Da lista do público (escolha pela que deixa a situação mais concreta): dentista, nutricionista, contadora, veterinária, engenheiro estrutural, professora de piano, cardiologista, fonoaudióloga, oftalmologista, advogada de família, consultora de RH, personal trainer, corretor de seguros, pediatra, farmacêutica, designer de interiores, professor de cursinho, dermatologista, mecânico de motos, confeiteira, arquiteta paisagista, psicopedagoga, marceneiro.
4. Em saúde, direito e finanças: a situação mostra critério de conduta, nunca promessa de resultado nem orientação que dependa de consulta.

---

## 7. O que nunca entra

- Qualquer expressão da lista `antivicios.proibidas` do ORQUESTRADOR e as do verificador do estúdio.
- "não é X, é Y" e todas as variações ("não se trata de", "mais do que X, é Y").
- Números que não estejam no capítulo; percentuais inventados; prazos de resultado.
- "um cliente meu", "uma paciente que atendi" (personagens são compostos).
- Promessa de seguidores, clientes, dinheiro ou viralização.
- Urgência e escassez ("últimas vagas", "só hoje").

---

## 8. Checklist final (tudo "sim" antes de entregar)

- [ ] A ficha tem os 8 campos, cada um com a fonte certa no capítulo.
- [ ] O gancho usa um dos moldes G1–G6 e tem até 14 palavras; hook + lead ≤ 34.
- [ ] O body 1 usa o termo do bloco `conceito`.
- [ ] Os dois ganchos de curiosidade são resolvidos pelo body seguinte.
- [ ] O body 2 e o body 3 trazem elementos da figura; o body 3, o destacado.
- [ ] A frase final do body 3 é a ideia da ficha e reaparece no slide 6.
- [ ] O CTA pede uma ação só, do degrau do dia; não cita capítulo, e só o convite fala do livro.
- [ ] Passa no teste do estranho (seção 0.1): nenhuma palavra de dentro, nenhum conceito com nome antes de ser mostrado.
- [ ] O elemento primordial de cada slide tem ar em volta; a figura cheia perdeu a legenda, e só ganhou slide de foco se precisava (seção 3.2).
- [ ] Carrossel com os 9 slides na ordem da seção 3, dentro dos limites.
- [ ] O exemplo usa a forma certa (6.1) e uma profissão permitida (6.2).
- [ ] A cena está identificada como ilustrativa, com personagem criada a partir de casos reais (slide 2 e legenda).
- [ ] O exercício cabe em cinco minutos e não expõe ninguém.
- [ ] A legenda segue os 7 parágrafos da seção 4.
- [ ] `estudio.py lint N` passa sem erro.
