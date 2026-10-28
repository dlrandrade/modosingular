# Estúdio Singular — Playbook

Este documento é a constituição do sistema. Quem produz o conteúdo do dia (você, o Claude, um assistente) lê isto primeiro e obedece a isto sempre. O **MANUAL.md** é o par dele: diz como cada campo de cada peça é feito, com ficha, moldes, limites e fontes no livro. Os dois juntos servem como conhecimento de um Projeto no Claude, como base da skill `singular-diario` e como o prompt da plataforma `/estudio`.

## 1. O que é

Um conhecimento do livro **Modo Singular** por dia, entregue em três peças que se explicam mutuamente:

1. **Roteiro de Reels** para teleprompter, na estrutura de retenção progressiva (seção 3).
2. **Carrossel** de 9 slides, com a figura do livro redesenhada para o celular como peça central e um slide que mostra a aplicação na prática (seção 4).
3. **Legenda** do carrossel (seção 5).

Um destino único: quem vê a peça quer **aplicar a singularidade à sua própria presença** e, na hora certa, conhecer o **Modo Singular** (seção 7).

Nome: tudo se chama **Modo Singular**: o livro, a apostila e o que se oferece. Nas peças, "o livro" é a fonte da cena e da figura; "o Modo Singular" é o caminho completo, os trinta capítulos. Nunca "Método Singular".

## 2. A pauta do dia

Uma pauta é **uma figura do livro** (49 no total, em `banco.yaml`). A figura é o osso da peça: tudo o que se diz precisa ser explicado por ela. Antes de escrever, responda por escrito:

- **A ideia do dia, numa frase.** Se não cabe numa frase, a pauta está grande demais: corte.
- **O que a figura mostra que a fala sozinha não mostra.** Se a figura só repete a fala, escolha outra pauta.
- **O detalhe que só o livro tem** (a cena, o caso, a conta). É ele que impede a peça de parecer genérica.

Fonte única: o capítulo em `apostila/texto/capNN.md`. Não se inventa conteúdo fora dele. Se a peça precisa de um fato que o capítulo não traz, o fato não entra.

## 3. Roteiro de Reels

Estrutura obrigatória: **Gancho → Introdução → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → CTA** (em inglês de roteirista: HOOK → LEAD → BODY 1 → OPEN LOOP 1 → BODY 2 → OPEN LOOP 2 → BODY 3 → CTA).

Por que ela funciona, nas palavras da própria referência:
- o gancho quebra o padrão e faz a pessoa parar de rolar;
- a introdução mantém a atenção até a marca dos **10 segundos**: quem chega até ali tem menos chance de abandonar;
- o primeiro desenvolvimento entrega a primeira informação de valor;
- o gancho de curiosidade ("Mas essa nem é a parte mais impressionante…") obriga a continuar, e a sequência entrega-valor-e-abre-curiosidade se repete mais uma vez;
- o CTA recompensa a atenção e conduz ao próximo passo do funil.

| Etapa | Função | Regra prática |
|---|---|---|
| HOOK (gancho) | Quebrar o padrão de rolagem | A primeira frase cai em ~3 segundos; no máximo 14 palavras. Cena, número ou afirmação específica. Nada de cumprimento, apresentação, nem "Você sabia?". |
| LEAD (introdução) | Segurar a atenção até ~10 s | Hook + lead somam no máximo 34 palavras. Mostra por que vale ficar, cria expectativa, não entrega a resposta. |
| BODY 1 | Primeira entrega de valor | Algo que a pessoa já sai sabendo. Específico, direto. |
| OPEN LOOP 1 (gancho de curiosidade) | Primeira lacuna | Uma frase. Nasce do que acabou de ser dito; promete algo que será resolvido. |
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

## 4. Carrossel (9 slides)

Receita padrão. Um slide, uma ideia; até ~40 palavras por slide.

| # | Slide | Função |
|---|---|---|
| 1 | **Capa** | O gancho do carrossel. Não repete o hook do Reels: é a mesma ideia por outra porta. |
| 2 | **Cena** | A situação que abre o assunto, contada para quem nunca leu o livro. |
| 3 | **Virada** | O detalhe que não fechava; a tensão. |
| 4 | **Figura** | O elemento gráfico, com título que diz a conclusão e legenda curta. É o centro do carrossel, e por isso tem ar em volta: se ficar cheia, perde a legenda; se ainda assim sufocar, ganha um slide só dela (MANUAL, 3.2). |
| 5 | **Leitura da figura** | Aplica a figura ao caso da cena (lista de 3 itens, no máximo). |
| 6 | **A ideia do dia** | Uma frase só, fundo escuro. A que a pessoa vai citar. |
| 7 | **Como ficaria** | A aplicação na prática, numa profissão diferente da cena, para quem lê pensar "entendi como fazer no meu". Muda de forma a cada dia: post, antes e depois, rascunho de caderno ou conversa (MANUAL, seção 6). |
| 8 | **Faça agora** | Exercício de 5 minutos, em passos. Vem da oficina do capítulo. |
| 9 | **CTA** | Uma ação, mais a assinatura do Modo Singular. |

**A figura é sempre a que explica o que está sendo dito.** Os dados YAML vêm do bloco `figura` do capítulo e são redesenhados para 1080×1350 por `src/estudio/slides.ts`, o mesmo arquivo usado pela plataforma `/estudio` e pelo gerador de PNG (o desenho do livro foi feito para a coluna impressa e não sobrevive no celular). Tipos prontos: camadas, fluxo/passos, barras, balança, escada, funil, gap, quadrante, espectro. Faltam: linha, matriz, órbita, ficha, área (criar o desenho antes do dia chegar, ou escolher outra pauta).

**Linguagem visual.** Casamento de fontes: os títulos na grotesca **Inter Tight** (da família da Inter do PWA), forte e apertada; o itálico dentro dos títulos e todo o texto de apoio, notas e rótulos na **EB Garamond**. As cores são as do Modo Singular: papel `#faf9f6`, tinta `#16181d`, ouro `#9a7328`; nos slides escuros, `#0b0c0f` com ouro fosco `#d8b26a`. Muito espaço, um itálico por slide, nada de enfeite: só o cerne.

Figura com valores inventados leva o selo "esquema ilustrativo" (herdado do livro). Nunca se apresenta valor ilustrativo como dado.

## 5. Legenda do carrossel

Estrutura, de 600 a 1.400 caracteres (limite duro: 2.200):

1. **Primeira linha**: a ideia do dia como afirmação específica. É o que aparece antes do "mais".
2. **A cena** em duas ou três frases, sem pressupor o livro.
3. **A explicação**: o que a cena mostra, em linguagem de colega para colega.
4. **O exercício**, em uma frase corrida e concreta.
5. **O CTA** (uma ação) e, por último, a procedência em palavras comuns: que a personagem foi criada a partir de casos reais e, numa frase, o que é o Modo Singular (nunca o número do capítulo).
6. Até 5 hashtags, no fim. Pode não ter nenhuma.

## 6. Voz

**Para quem a peça é escrita: quem nunca ouviu falar de você nem do livro.** O Reels e o carrossel são topo de funil. A pessoa chegou rolando a tela, não sabe quem é Daniel Luzz, não sabe que existe um livro, não conhece nenhum termo dele. Três consequências:

- **Comece pela vida dela, não pelo livro.** O gancho e a introdução falam da situação que ela vive (posta e ninguém responde, sabe muito e parece igual a todo mundo, trava antes de escrever), com as palavras que ela usaria para contar isso a um colega.
- **Mostre antes de nomear.** Um conceito do livro (repertório, critério, a distância) só ganha nome depois de aparecer em palavras comuns, e nunca no gancho. No máximo um conceito com nome por dia.
- **Palavras de dentro ficam dentro.** "Peça", "caderno de campo", "matéria-prima", "oficina", "pauta", "tese", "personagem composta", "capítulo 9", "o método": nada disso aparece para o público. A tabela de tradução está no MANUAL, seção 0.1, e o verificador barra as principais.

Teste do estranho: leia cada frase como alguém que nunca viu o perfil. Se ela precisar de contexto para fazer sentido, reescreva.


A voz é a do livro: um mentor sênior, direto e respeitoso, que fala com um colega inteligente. Calor contido, humor seco e raro. Português do Brasil culto e conversado. O livro é a referência: `apostila/ORQUESTRADOR.yaml`, seções `voz` e `antivicios`. O verificador lê essa lista de expressões proibidas e aplica a todas as peças. Em resumo:

- Cena e detalhe de ofício antes de adjetivo. "Um carrinho de supermercado" vale mais do que "um detalhe importante".
- Profissões específicas, nunca "um profissional" genérico.
- Sem jargão de coach ou de marketing (mindset, storytelling, insight, branding, "conteúdo de valor", "virar a chave", "próximo nível").
- Sem anglicismo desnecessário, sem gerundismo, sem "jornada".
- Segunda pessoa ("você"). O "eu" é para opinião, nunca para fabricar biografia.

## 7. CTA: levar ao Modo Singular sem vender barato

**Princípio.** O CTA é a consequência do que foi dito, não um anúncio colado no fim. A pessoa acabou de aprender algo e de sentir que podia aplicar. O CTA a ajuda a dar o próximo passo, e o próximo passo mais honesto é *fazer o exercício*. O Modo Singular entra como a continuação natural dele, explicado para quem nunca ouviu falar ("estou escrevendo um livro sobre isso, para especialistas que sabem muito e aparecem pouco"), e só no dia do convite; nunca como a razão pela qual a peça existe, e nunca pelo número do capítulo.

**Uma ação por peça.** O Reels e o carrossel de um mesmo dia podem pedir ações diferentes, mas cada um pede uma só. A assinatura ("Modo Singular, em breve") não conta como pedido.

**Escada de três degraus**, em cadência semanal (configurável em `marca.yaml`):

| Degrau | O que pede | Quando | Exemplo |
|---|---|---|---|
| **Prática** | Fazer o exercício, no papel, sem postar nada | 4 dos 7 dias | "Antes de dormir, escreva a última decisão difícil que você tomou na sua área, e o motivo." |
| **Conversa** | Responder com uma palavra ou uma frase curta | 2 dos 7 dias | "Comente a camada em que a sua semana mais se concentra: informação, padrão, exceção ou critério." |
| **Convite** | Conhecer o Modo Singular | 1 dia (o 7º) | "Estou escrevendo um livro sobre isso, o Modo Singular, para especialistas que sabem muito e aparecem pouco. Quem quiser ser avisado quando sair, o link está na bio." |

**O que o CTA de convite nunca faz:** urgência falsa, escassez inventada, "últimas vagas", promessa de resultado, comparação com quem "ainda está perdido", "você está deixando dinheiro na mesa". O argumento é só este: *você acabou de fazer, em cinco minutos, o começo do que o Modo Singular faz em trinta capítulos.*

**Enquanto o método estiver "em breve"** (`marca.yaml › oferta.estado`), o degrau Convite leva à lista de espera, e as peças dos outros dias terminam com a assinatura. Quando abrir, troque o estado e a ação; os kits antigos não precisam mudar.

## 8. Honestidade e proteção

Estas regras valem mais do que o gancho. Se a peça ficar melhor quebrando uma delas, a peça fica pior.

1. **Personagens são compostos.** Renata, Otávio, Lúcia e Caio não são clientes reais. Em toda peça que usa um caso do livro, o leitor precisa poder saber disso (na tela e na legenda), em palavras comuns: "cena ilustrativa", "personagem criada a partir de casos reais". Nunca "um cliente meu", "uma paciente que atendi", "uma aluna minha".
2. **O "eu" não inventa biografia.** Daniel Luzz pode opinar ("eu acho", "a posição do livro é"), nunca contar um episódio da própria vida que o livro não traz.
3. **Nenhum número inventado como dado.** Percentuais, ganhos, prazos de resultado só entram se vierem do capítulo, e como o capítulo os apresenta (ilustrativo, hipotético, conta do leitor).
4. **Nenhuma promessa de resultado.** Nada de "mais clientes", "viralizar", "faturar". O que se promete é clareza e método.
5. **Sigilo.** Os exercícios que pedem casos reais mandam omitir nome e dado que identifique. Profissões regulamentadas (saúde, direito, psicologia) têm código de publicidade: não se estimula o público a expor atendimento.
6. **O dossiê não é citado.** Ele não existe no repositório; não se inventam falas dele.
7. **Cada peça diz de onde vem**, na legenda: o Modo Singular, explicado numa frase para quem não o conhece. Número de capítulo nunca vai para o público.

## 9. Checklist antes de publicar

- [ ] A ideia do dia cabe numa frase, e a figura a explica.
- [ ] O hook funciona sem contexto, em até 3 segundos.
- [ ] Os dois loops são resolvidos, e o BODY 2 e o BODY 3 trazem informação nova.
- [ ] Nenhum "não é X, é Y", nenhum "Você sabia?", nenhuma exclamação.
- [ ] A cena está identificada como ilustrativa (personagem criada a partir de casos reais).
- [ ] Passa no teste do estranho: nenhuma frase pressupõe o livro, o método ou um termo dele.
- [ ] O CTA pede uma ação só e decorre do que foi dito.
- [ ] O exercício (slide 7) pode ser feito em 5 minutos, sem expor ninguém.
- [ ] Os slides estão legíveis no celular (texto mínimo ~29 px em 1080).
- [ ] `estudio.py lint N` passa sem erros.

## 10. Como o Claude trabalha com este playbook

**Na plataforma (o jeito do dia a dia).** Em `modosingular.vercel.app/estudio`, com a senha, você pede o dia num campo ("dia 3", um tema, ou só enter para o próximo) ou clica no próximo. A plataforma escolhe a pauta, manda ao modelo de IA o playbook, o manual, o capítulo e a figura, confere o resultado com o mesmo verificador e apresenta o carrossel, a figura separada (com a versão 9:16 para o Reels), o roteiro (com teleprompter), a legenda e a ficha.

- **A geração roda no servidor.** Pode bloquear a tela ou trocar de app: ela continua, e o resultado aparece quando você volta. "Avise-me quando terminar" liga uma notificação neste aparelho (no iPhone, só com o estúdio instalado na tela de início).
- **Os dias ficam guardados no servidor** (balde privado `estudio` no Supabase Storage do PWA) e aparecem em qualquer aparelho. Cada versão sobrescrita vai para o histórico.
- **Edição no próprio carrossel.** Amplie um slide e dê dois cliques (no celular, dois toques) em qualquer texto: ele fica editável ali, com negrito, itálico, troca entre a grotesca e a Garamond, tamanho, largura do bloco e as cores da marca; no alto, o fundo do slide. A edição vira `ajustes` no próprio slide, então o PNG sai igual à tela. Se um texto passar da área segura, a lupa avisa. "Original" desfaz.
- **A figura para o Reels**: 1080 × 1920, fundo transparente, a figura num cartão (claro ou escuro) no alto do quadro, para ficar acima da cabeça de quem grava em modo selfie. Põe-se por cima do vídeo no editor (CapCut, Instagram).
- **Instale como app** (no celular, "Adicionar à tela de início"; no computador, o ícone de instalar na barra do navegador). O estúdio tem ícone e janela próprios, separados do app do curso, atalhos para "Próximo dia" e "Modelos", recebe textos compartilhados de outros apps como pedido, e mantém a tela acesa durante o teleprompter.
- **Admin** (`/estudio/admin`): escolha do modelo principal, preços vivos do OpenRouter, saldo, estado de cada peça e as últimas gerações com o custo de cada uma.

Para versionar um dia no repositório, baixe o kit (.json) e peça ao Claude Code para incorporá-lo.

**No repositório (modo completo).** O Claude Code lê este playbook e o manual, roda `python3 estudio/estudio.py proximo`, lê o capítulo, preenche a ficha, escreve o kit em `estudio/kits/dia-NNN/kit.yaml`, roda `lint`, corrige e roda `render`. Saem o `roteiro.md`, a `legenda.md`, os slides e as figuras em PNG, e os dados da plataforma são atualizados. A skill `singular-diario` automatiza esse roteiro de trabalho.

**Num Projeto do Claude (modo texto, pelo celular).** Suba este arquivo e o texto dos capítulos como conhecimento do projeto. Para pedir o dia, use este prompt:

```
Siga o PLAYBOOK e o MANUAL. Pauta do dia: capítulo [N], figura "[TÍTULO DA FIGURA]".
Duração do Reels: [45 | 60] s. Degrau do CTA: [prática | conversa | convite].
Comece pela ficha (MANUAL, seção 1). Entregue: (1) roteiro nas 8 etapas e a versão final para gravação; (2) o carrossel de 9 slides,
slide a slide, com o YAML da figura; (3) a legenda. Rode o checklist da seção 9 e diga o que reprovou.
```

Nesse modo não há renderizador: o carrossel sai como texto e você monta as imagens no Canva ou volta ao repositório para gerar os PNGs.

## 11. Decisões em aberto (preencher em `marca.yaml`)

- `handle`: o @ do perfil, que aparece no rodapé dos slides.
- `oferta.acao_metodo`: o que de fato existe quando o CTA de convite aparece (lista de espera? página? mensagem?).
- Na Vercel: `OPENROUTER_API_KEY` (o provedor da plataforma), `ANTHROPIC_API_KEY` (opcional: o Claude direto entra como último recurso) e, se quiser trocar a senha padrão, `ESTUDIO_SENHA`. A geração no servidor e as notificações usam a `SUPABASE_SERVICE_ROLE_KEY` que o PWA já tem; as chaves das notificações nascem sozinhas no armazém (ou vêm de `ESTUDIO_VAPID_PUBLICA` e `ESTUDIO_VAPID_PRIVADA`, se existirem).
- **Quem escreve**: escolha em `/estudio/admin`. O padrão é o **Claude Haiku 5.5** pelo OpenRouter (US$ 0,10 e US$ 0,50 por milhão de tokens de entrada e saída; menos de um centavo de dólar por dia), com os gratuitos e o Claude direto de reserva. Alternativas no admin: DeepSeek V4 Pro (barato, escrita um pouco menos fluida), GLM 5.3 (a melhor escrita criativa entre os abertos) e Claude Sonnet 5.5 (o máximo de acabamento, ~US$ 0,15 por dia). Sem crédito no OpenRouter, o pago responde "sem créditos" e a cadeia passa aos gratuitos. Sem escolha salva, vale `ESTUDIO_MODELOS` (ex.: `openrouter:qwen/qwen3.8-27b:free,anthropic:claude-opus-5-5`), e sem ela o padrão. Os gratuitos do OpenRouter mudam com frequência; um ID que sai do catálogo é pulado automaticamente.
- Privacidade: vários provedores gratuitos podem usar o que recebem para treinar modelos, e cada pedido leva o texto de um capítulo do livro. Se isso importa, mantenha nas configurações de privacidade do OpenRouter só provedores que não treinam com os dados, ou ponha o Claude primeiro em `ESTUDIO_MODELOS`.
- Quando a oferta abrir: mudar `oferta.estado` para `aberto` e ajustar a ação.
