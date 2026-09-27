/* ---------------------------------------------------------------
   ROTEIROS DE FALA — um por capítulo.

   São para LER EM VOZ ALTA gravando, não para decorar. Cada um aplica
   a técnica do capítulo ao campo do próprio especialista, com lacunas
   entre chaves para ele preencher com o que é dele.

   Regra de escrita: frases curtas, ritmo de fala, nenhuma palavra que
   a pessoa não diria num consultório. No máximo duas lacunas por
   roteiro — mais que isso vira formulário e trava.
---------------------------------------------------------------- */

export const ROTEIROS: Record<number, string> = {
1: `Tem uma coisa que quem trabalha comigo sabe e quem me encontra na internet não faz ideia.

{o que você resolve que a maioria dos seus colegas não resolve}

Levei anos para conseguir fazer isso bem. E mesmo assim quase nunca falei sobre.

Então vou começar a falar. Porque enquanto eu fico quieto, quem tem esse problema continua achando que não tem solução — ou pior, aceitando a primeira resposta que aparece.

Se você convive com {o problema}, fica por aqui. Nos próximos dias eu explico o que quase ninguém explica.`,

2: `Existe uma coisa que meus pacientes chegam repetindo, e que já foi verdade, mas hoje não é mais.

{o equívoco que você mais ouve}

E olha, faz todo sentido acreditar nisso. {por que essa crença existe — dê o contexto de boa-fé}

Só que o que eu vejo na prática é outra coisa: {o que você observa hoje}

Se você for decidir sozinho, a régua é esta: {o critério que a pessoa leva para casa}

Não precisa de mim para usar. Guarda aí.`,

3: `Vou gravar isso do jeito mais simples possível, porque o que importa aqui não é a imagem.

{a afirmação direta, sem preâmbulo}

Vou te dar um detalhe que provavelmente ninguém te contou: {um detalhe específico da sua prática — um número, uma frequência, um sinal}

E tem uma exceção que muda tudo: {quando a regra falha}

Se você só levar uma coisa daqui, leva essa exceção. É ela que separa quem acerta de quem repete o manual.`,

4: `Vou explicar isso exatamente do jeito que eu explico no atendimento. Sem roteiro, sem enfeite.

{a explicação que você dá toda semana — fale, não leia de um texto formal}

É isso. É assim que eu falo quando a pessoa está na minha frente.

Se ficou claro, é porque essa explicação já foi testada em muita gente antes de você. Ela ficou desse tamanho por um motivo.`,

5: `Se você já tentou {algo que exige constância no seu campo} e não conseguiu manter, eu tenho uma leitura diferente para te oferecer.

Talvez o problema não tenha sido força de vontade.

Talvez tenha sido que o método escolhido nunca combinou com a sua rotina. E aí cada tentativa custava caro demais para sobreviver a um dia ruim.

Eu vejo isso o tempo todo: {o padrão que você observa em quem desiste}

A pergunta certa não é como me esforçar mais. É qual é a forma que cabe na vida que eu realmente tenho.`,

6: `Essa semana três pessoas diferentes me perguntaram a mesma coisa.

{a pergunta, com as palavras de quem perguntou}

Quando a mesma dúvida aparece três vezes em poucos dias, não é coincidência. É sinal de que quase ninguém está explicando isso direito.

Então vou responder: {sua resposta}

E se você também pensava assim, não é besteira. Faz sentido — {por que a dúvida é razoável}`,

7: `Vou falar sobre uma coisa que eu explico melhor falando do que escrevendo.

{o assunto que você domina e explica sem preparo}

Repara que eu não preparei isso. Não tem roteiro. É como sai quando alguém me pergunta de verdade.

E é assim que eu prefiro. Porque quando eu tento deixar bonito demais, some justamente a parte que faz entender.`,

8: `Quase todo mundo que me procura quer saber a mesma coisa: em quanto tempo resolve.

A resposta honesta é que depende de uma variável que quase ninguém menciona: {o que depende do próprio cliente, não de você}.

Eu já vi o mesmo tipo de caso levar {tempo curto} e levar {tempo longo}. A diferença quase nunca foi técnica.

Então antes de perguntar quanto tempo, pergunte outra coisa: o que exatamente vai depender de mim?`,

9: `Depois de {número} anos fazendo isso, tem um padrão que eu vejo e quase nunca ouço alguém comentar.

Em mais ou menos {X} de cada 10 casos que chegam até mim, {o padrão que só o volume ensina}.

Pode ser um viés da minha amostra, eu não vou dizer que é regra. Mas virou a primeira coisa que eu investigo.

E resolve mais do que deveria.`,

10: `Vou dizer uma coisa que provavelmente vai desagradar parte de vocês.

{a sua posição, dita direto}

Eu sei que existe um bom argumento do outro lado: {o melhor contra-argumento, dito com justiça}

Mesmo assim eu mantenho. E isso me custa cliente todo mês — tem gente que procura exatamente o que eu me recuso a fazer.

Continuo achando que é o certo. Se você discorda, tudo bem. Mas agora você sabe onde eu estou.`,

11: `Deixa eu te explicar isso com a comparação que eu sempre uso.

{o assunto} é igual {a sua analogia, aquela que você usa no atendimento e acha simples demais}

{desenvolva a comparação até o fim}

Uso essa comparação há anos porque é a única que faz a ficha cair. Já tentei explicar de um jeito mais técnico e a pessoa saía balançando a cabeça sem entender nada.`,

12: `Tem três coisas que eu defendo, e tudo que eu faço parte delas.

A primeira: {posição 1}.
A segunda: {posição 2}.
A terceira: {posição 3}.

Não é opinião solta. Depois de {tempo} de prática, foi isso que eu vi separar quem resolve de quem só remedia.

Se você discorda de alguma, vale conversar. Mas é daqui que eu parto.`,

13: `Aconteceu uma coisa há algum tempo que eu penso até hoje.

{o caso, sem nada que identifique alguém — desloque o tempo}

O que me marcou não foi o desfecho. Foi perceber uma coisa: {o padrão maior que o caso revela}

E isso acontece muito mais do que parece. Se você está passando por algo parecido, a pergunta que vale fazer é: {o critério que a pessoa leva}`,

14: `A pergunta que mais me fazem é essa: {a pergunta literal}

E eu vou te dizer uma coisa: ela é a pergunta errada.

Não porque seja boba — ela faz todo sentido. Mas porque a resposta depende de uma variável que ninguém te contou: {a variável}

A pergunta certa é {a pergunta melhor}. E essa eu consigo responder de verdade: {a resposta}`,

15: `A pessoa chegou dizendo que era {o diagnóstico óbvio}. Tudo apontava para isso.

Mas tinha um detalhe que não fechava: {o detalhe pequeno que você notou}

Foi só isso. Um detalhe que muda a direção inteira.

E a lição não é sobre mim: se um tratamento correto não está funcionando, o problema raramente é a dose. Quase sempre é o diagnóstico.`,

16: `Vou explicar isso do mesmo jeito que explico no consultório, porque é a versão que funciona.

{a explicação que você repete há anos — do começo ao fim, sem melhorar}

Pronto. É essa.

Eu já tentei explicar de forma mais elaborada e piorou. Essa versão ficou assim depois de repetir centenas de vezes e ver onde as pessoas travavam.`,

17: `Existe uma prática comum no meu meio que eu não sigo. E acho que vale explicar por quê.

A prática é {o consenso, descrito na versão mais forte dele}

E ela existe por uma razão legítima: {por que faz sentido}

O problema aparece quando {a fratura que você observa}. Nos casos que eu acompanho, {o dado da sua prática}

Se eu fosse escolher, eu faria assim: {a substituição concreta}`,

18: `Nesse ponto aqui existem dois caminhos, e os dois são defensáveis.

O primeiro custa {o custo do caminho A}. O segundo custa {o custo do caminho B}.

Ninguém te conta isso porque é mais fácil vender só o lado bom.

A minha régua é simples: eu escolho {A ou B} quando {a condição verificável}.

E já errei com isso. Foi assim que eu ajustei: {o ajuste}`,

19: `Anotei uma coisa essa semana entre um atendimento e outro, e resolvi trazer aqui.

{a observação crua que você capturou}

Não é nada elaborado. É só uma coisa que eu vi acontecer de novo, e que talvez sirva pra você.

Porque quando alguma coisa se repete na minha frente, geralmente é porque está se repetindo na vida de muita gente.`,

20: `Vou ser curto hoje, porque o dia foi cheio.

Uma ideia só: {a ideia, em uma frase}

{o detalhe da sua prática que sustenta essa ideia}

Se você levar só isso daqui, já vale.`,

21: `Estou entre dois atendimentos, mas isso aqui não pode esperar.

Acabei de {o que aconteceu agora — a conversa, o caso, a pergunta}

E me ocorreu que quase ninguém fala sobre {o ponto}

{desenvolva em duas ou três frases}

Voltando pro consultório. Mas fica a ideia.`,

22: `Vi uma coisa fora da minha área que explica bem o que eu tento dizer aqui há tempos.

{a comparação que você tirou de outro campo}

No meu trabalho é igual: {a aplicação ao seu campo}

E é por isso que {a conclusão prática}`,

23: `Uma coisa que eu não delego, e não vou delegar nunca: {o que só você decide}

Posso ter ajuda para {as partes mecânicas do seu trabalho}. Mas a decisão de {a decisão central} é minha, caso a caso.

Porque é ali que mora a diferença entre um serviço e o meu serviço.

E se um dia você perceber que isso mudou, pode me cobrar.`,

24: `Uma pergunta que eu recebo bastante: como escolher um profissional para {o serviço da sua área}.

Não vou te dizer para escolher a mim. Vou te dar a régua que eu usaria se fosse contratar alguém do meu próprio campo.

Primeiro: {critério 1}. Segundo: {critério 2}. Terceiro, e esse quase ninguém checa: {critério 3}

Se a pessoa passar nos três, provavelmente você está em boas mãos — comigo ou com qualquer outro.`,

25: `Isso aqui eu já falei antes. E vou falar de novo.

{o seu tema central}

Não é repetição por falta de assunto. É que eu vejo gente chegando todo mês com o mesmo problema que poderia ter sido evitado se essa informação tivesse chegado antes.

Então enquanto continuar chegando, eu continuo falando: {a ideia central}`,

26: `Se você sente {a experiência, com as palavras da pessoa — não o nome técnico}, presta atenção nisso.

Isso tem nome. E não é o que costumam dizer.

{o que realmente é, explicado simples}

Acontece porque {a explicação estrutural}

Não estou vendendo nada com isso. Só acho que você merece saber que tem explicação.`,

27: `Vou ser direto sobre quem eu atendo, porque isso poupa o tempo de todo mundo.

Se você tem {o perfil} e já tentou {o caminho comum} sem resultado, esse é o tipo de caso que eu pego.

Se você tem {outro perfil}, provavelmente eu não sou a pessoa certa — e eu te digo isso na primeira conversa, não depois de três meses.

Não prometo prazo. Prometo te dizer com honestidade se dá ou não dá.`,

28: `Quase todo mundo avalia {o que você faz} pelo mesmo indicador: {a métrica óbvia do seu campo}.

E ela engana. Porque {por que engana}.

O que eu olho é outra coisa: {o indicador que importa de verdade}. É menos visível e diz muito mais sobre o que vem depois.

Se você for avaliar sozinho, olhe para isso.`,

29: `Tem um momento em {o processo do seu campo} que parece que não está funcionando.

Costuma ser por volta de {período}. O esforço já é real e o resultado ainda não aparece.

Isso não é sinal de que deu errado. É a forma normal da curva — eu vejo em boa parte dos casos que acompanho.

Quem desiste ali quase sempre desiste pouco antes de começar a funcionar.`,

30: `Vou dizer o que eu defendo, sem rodeio.

{a sua posição central}

Isso me custa {o custo real: cliente, convite, concordância de colegas}. E eu mantenho, porque em {tempo} de prática foi o que eu vi funcionar.

Se é o tipo de conversa que te interessa, fica por aqui.`,
};

/* ---------------------------------------------------------------
   ESTRUTURAS DE PEÇA — o esqueleto do conteúdo que vai ao público.

   Distinção que sustenta o produto: o Modo Singular é o método, nunca o
   assunto. O capítulo ensina COMO pensar a peça; o assunto é sempre a
   área do próprio especialista.

   Por isso estas estruturas existem separadas do gabarito das diretrizes:
   parte dos gabaritos é checklist de processo interno (captura, revisão,
   delegação) e não serve como esqueleto de algo publicável.
---------------------------------------------------------------- */

export interface BlocoEstrutura { rotulo: string; texto: string }

export const ESTRUTURAS: Record<number, BlocoEstrutura[]> = {
1: [
  { rotulo: "A cena", texto: "O momento concreto que gerou o pensamento. Hora, lugar, quem falou o quê." },
  { rotulo: "A tensão", texto: "O que todo mundo acha que é o problema, versus o que você viu que era." },
  { rotulo: "O critério", texto: "A régua que você usa e que a maioria não usa." },
  { rotulo: "A frase que fica", texto: "Uma linha que a pessoa consiga repetir para outra pessoa." },
],
2: [
  { rotulo: "O que se costuma dizer", texto: "A crença errada, dita com as palavras de quem acredita nela." },
  { rotulo: "Por que ela existe", texto: "O contexto em que aquilo já fez sentido. Seja generoso." },
  { rotulo: "O que você vê hoje", texto: "A sua observação de prática, com detalhe ou número." },
  { rotulo: "A régua", texto: "Como a pessoa decide sozinha na próxima vez." },
],
3: [
  { rotulo: "A afirmação", texto: "Direta, na primeira linha. Sem saudação, sem preâmbulo." },
  { rotulo: "O detalhe", texto: "Um dado da sua prática que só quem faz teria." },
  { rotulo: "A exceção", texto: "Quando a regra falha. É ela que prova domínio." },
  { rotulo: "O fecho", texto: "Uma frase repetível. Nada de pedir seguidor." },
],
4: [
  { rotulo: "O assunto", texto: "O que você vai explicar, dito como você diria a um cliente." },
  { rotulo: "A explicação", texto: "Inteira, na ordem em que ela sai naturalmente de você." },
  { rotulo: "Onde travam", texto: "O ponto em que as pessoas costumam se perder — e o esclarecimento." },
  { rotulo: "O fecho curto", texto: "Como você encerra quando a pessoa entendeu." },
],
5: [
  { rotulo: "O objetivo", texto: "O resultado do seu campo que exige constância para acontecer." },
  { rotulo: "Por que a maioria para", texto: "O que costuma ser dito (falta de disciplina) e por que não explica." },
  { rotulo: "O ponto real de quebra", texto: "A etapa específica em que as pessoas desistem, na sua observação." },
  { rotulo: "O ajuste", texto: "O que muda o jogo quando se troca o método em vez da força." },
],
6: [
  { rotulo: "A pergunta", texto: "Literal, entre aspas, com as palavras de quem perguntou." },
  { rotulo: "A normalização", texto: "'É a que mais me fazem.' Tira a vergonha de quem tem a dúvida." },
  { rotulo: "A resposta", texto: "Com o detalhe que só quem faz sabe: o número, o percentual, a exceção." },
  { rotulo: "O critério", texto: "Como decidir sozinho na próxima vez." },
],
7: [
  { rotulo: "A explicação direta", texto: "O assunto, do jeito mais simples que você consegue dizer." },
  { rotulo: "O exemplo", texto: "Um caso concreto que torna a explicação visível." },
  { rotulo: "Onde travam", texto: "A dúvida que sempre aparece nesse ponto." },
  { rotulo: "O resumo", texto: "A ideia inteira em uma frase." },
],
8: [
  { rotulo: "A pergunta de prazo", texto: "'Em quanto tempo resolve?' — a pergunta que todo mundo faz." },
  { rotulo: "A variável oculta", texto: "O que determina o prazo e que ninguém menciona." },
  { rotulo: "Os dois extremos", texto: "O mesmo caso levando tempos muito diferentes, na sua prática." },
  { rotulo: "A pergunta certa", texto: "'O que vai depender de mim?' — e a resposta." },
],
9: [
  { rotulo: "O padrão", texto: "'Em X de cada 10 casos que eu vejo, acontece Y.' Traga o número." },
  { rotulo: "O contraste", texto: "'O que se costuma dizer é Z.' Não bate com o que você vê." },
  { rotulo: "A hipótese", texto: "Por que você acha que a diferença existe." },
  { rotulo: "O uso prático", texto: "O que a pessoa faz com isso amanhã." },
],
10: [
  { rotulo: "A posição", texto: "Dita direto, na primeira linha, sem preâmbulo." },
  { rotulo: "O custo", texto: "'Isso me custa __.' A prova de que você acredita." },
  { rotulo: "A razão", texto: "O raciocínio, com o caso ou o número que o sustenta." },
  { rotulo: "A contra-objeção", texto: "'O melhor argumento contra é __. Ainda assim, __.'" },
],
11: [
  { rotulo: "A analogia", texto: "A comparação que você usa no atendimento e sempre funciona." },
  { rotulo: "O desenvolvimento", texto: "Leve a comparação até o fim, sem encurtar." },
  { rotulo: "A tradução", texto: "O que isso significa no caso concreto de quem está lendo." },
  { rotulo: "O fecho", texto: "Curto, do jeito que você encerra quando a ficha cai." },
],
12: [
  { rotulo: "As três coisas", texto: "As posições centrais que organizam tudo que você faz." },
  { rotulo: "A evidência", texto: "O que na sua prática levou você a cada uma delas." },
  { rotulo: "Quem elas excluem", texto: "O tipo de expectativa que essas posições não atendem." },
  { rotulo: "O convite", texto: "'É daqui que eu parto.' Sem pedir nada." },
],
13: [
  { rotulo: "O caso", texto: "Deslocado no tempo e despersonalizado. 2 a 3 linhas." },
  { rotulo: "O reconhecimento", texto: "'Se você se reconheceu, não é coincidência.'" },
  { rotulo: "O padrão", texto: "'Isso acontece porque __.' A explicação estrutural." },
  { rotulo: "O critério", texto: "A ferramenta que a pessoa usa amanhã." },
],
14: [
  { rotulo: "A pergunta", texto: "Literal, entre aspas, na primeira linha." },
  { rotulo: "A normalização", texto: "Por que ela é comum e faz todo sentido." },
  { rotulo: "A virada", texto: "'Mas ela é a pergunta errada.' O reposicionamento." },
  { rotulo: "A pergunta certa", texto: "E o critério para respondê-la sozinho." },
],
15: [
  { rotulo: "A situação óbvia", texto: "Como qualquer um leria o caso. 2 linhas." },
  { rotulo: "O detalhe", texto: "O que não fechava. Bem específico — é aqui que a autoridade aparece." },
  { rotulo: "A decisão", texto: "O que você fez diferente e qual foi a régua." },
  { rotulo: "A lição", texto: "O critério generalizado, útil para quem nunca vai te procurar." },
],
16: [
  { rotulo: "A abertura", texto: "Exatamente como você abre no atendimento. Sem adaptar." },
  { rotulo: "A explicação", texto: "Inteira, na ordem em que ela sai sozinha." },
  { rotulo: "A analogia", texto: "No mesmo ponto em que aparece na sua fala real." },
  { rotulo: "O fecho", texto: "Como você encerra quando a pessoa entendeu. Normalmente curto." },
],
17: [
  { rotulo: "O consenso", texto: "Enunciado com justiça, na versão mais forte dele." },
  { rotulo: "A concessão", texto: "'Faz sentido, porque __.' Prova que você entende antes de discordar." },
  { rotulo: "A fratura", texto: "O dado da sua prática que não encaixa." },
  { rotulo: "A substituição", texto: "O que fazer no lugar. Concreto e utilizável hoje." },
],
18: [
  { rotulo: "A bifurcação", texto: "'Existem dois caminhos aqui e os dois são defensáveis.'" },
  { rotulo: "Os custos", texto: "O que cada lado cobra: tempo, risco, reversibilidade, dinheiro." },
  { rotulo: "A sua régua", texto: "'Eu escolho __ quando __.' Uma condição verificável." },
  { rotulo: "O limite", texto: "'Já errei assim.' A prova de que a régua foi usada." },
],
19: [
  { rotulo: "A observação", texto: "O que você notou essa semana, cru, sem enfeite." },
  { rotulo: "A repetição", texto: "Por que isso aparece de novo e de novo na sua frente." },
  { rotulo: "O que revela", texto: "A dificuldade maior que essa cena expõe." },
  { rotulo: "O uso", texto: "O que a pessoa faz com essa informação." },
],
20: [
  { rotulo: "A ideia", texto: "Uma só, em uma frase. Sem segunda ideia junto." },
  { rotulo: "O detalhe", texto: "O dado da sua prática que sustenta a ideia." },
  { rotulo: "O critério", texto: "A régua que a pessoa leva." },
  { rotulo: "O fecho", texto: "Curto. Termine quando a ideia acabar." },
],
21: [
  { rotulo: "O contexto", texto: "Onde você está e por que isso importa para o que vem." },
  { rotulo: "O que acabou de acontecer", texto: "A conversa, o caso ou a pergunta, ainda quente." },
  { rotulo: "O que isso mostra", texto: "O padrão que a cena revela." },
  { rotulo: "A implicação", texto: "O que muda para quem está lendo." },
],
22: [
  { rotulo: "A ideia de fora", texto: "Algo de outro campo que explica bem o seu ponto." },
  { rotulo: "A ponte", texto: "Como isso se traduz para a sua área." },
  { rotulo: "O que muda", texto: "A consequência prática dentro do seu trabalho." },
  { rotulo: "A conclusão", texto: "A régua que sobra depois da comparação." },
],
23: [
  { rotulo: "O que você não delega", texto: "A decisão que continua sendo sua, caso a caso." },
  { rotulo: "Por que não", texto: "O que se perderia se essa parte fosse padronizada." },
  { rotulo: "O que isso custa", texto: "Em tempo, em escala, em dinheiro." },
  { rotulo: "O que o cliente ganha", texto: "A diferença que isso faz no resultado dele." },
],
24: [
  { rotulo: "O primeiro critério", texto: "O que checar ao escolher um profissional da sua área." },
  { rotulo: "O segundo", texto: "Outro critério verificável por quem é leigo." },
  { rotulo: "O terceiro", texto: "O que quase ninguém checa e deveria." },
  { rotulo: "O convite honesto", texto: "'Se passar nos três, você está bem servido — comigo ou não.'" },
],
25: [
  { rotulo: "O problema que voltou", texto: "O caso recorrente que apareceu de novo essa semana." },
  { rotulo: "Por que continua", texto: "A causa estrutural que faz isso se repetir." },
  { rotulo: "O que evita", texto: "O que teria mudado o desfecho, dito de forma acionável." },
  { rotulo: "O fecho", texto: "'Enquanto continuar chegando, eu continuo falando.'" },
],
26: [
  { rotulo: "A experiência", texto: "O que a pessoa sente, nas palavras dela — não no nome técnico." },
  { rotulo: "A nomeação", texto: "'Isso tem nome, e não é o que te disseram.'" },
  { rotulo: "A explicação", texto: "Por que acontece, com o seu repertório." },
  { rotulo: "O critério", texto: "O que fazer com isso. Sem chamada para ação." },
],
27: [
  { rotulo: "Para quem serve", texto: "'Se você tem __ e já tentou __ sem resultado.'" },
  { rotulo: "Para quem não serve", texto: "'Se você tem __, não sou a pessoa certa.'" },
  { rotulo: "O processo", texto: "O que acontece na prática. Sem prazo, sem promessa." },
  { rotulo: "A porta", texto: "Como falar com você. Simples e sem urgência." },
],
28: [
  { rotulo: "O indicador comum", texto: "Aquilo pelo qual todo mundo avalia o seu tipo de trabalho." },
  { rotulo: "Por que engana", texto: "O que ele deixa de fora e por que isso importa." },
  { rotulo: "O que você olha", texto: "O indicador real, o que você acompanha de verdade." },
  { rotulo: "Como medir", texto: "Como a pessoa verifica isso sozinha." },
],
29: [
  { rotulo: "O momento difícil", texto: "A fase do seu processo em que parece não estar funcionando." },
  { rotulo: "Por que é normal", texto: "A forma da curva: esforço antes do resultado." },
  { rotulo: "O sinal", texto: "O que indica que está no caminho, mesmo sem resultado visível." },
  { rotulo: "O que fazer", texto: "A conduta para atravessar esse período." },
],
30: [
  { rotulo: "A posição", texto: "O que você defende. Primeira linha, sem preâmbulo." },
  { rotulo: "O custo", texto: "'Isso me custa __.' A prova de que é opinião, não constatação." },
  { rotulo: "A sustentação", texto: "O caso, o número ou o padrão que vem da sua prática." },
  { rotulo: "O convite", texto: "Para quem essa conversa serve. Dito uma vez, sem insistir." },
],
};

/** Prompt pronto para colar numa IA, montado com o material do capítulo. */
export function montarPrompt(cap: {
  tema: string;
  conceito: { termo: string; definicao: string };
  diretrizes: { facaAssim: string[]; eviteAssim: string[] };
}): string {
  return [
    "Você vai me ajudar a transformar uma ideia minha em conteúdo para as minhas redes.",
    "Não invente informação: use apenas o que eu te der abaixo.",
    "",
    "SOBRE O QUE É O CONTEÚDO",
    "Sou {sua profissão} e atendo {seu público}.",
    "O assunto do conteúdo é a MINHA área — o que eu faço, o que eu vejo, o que eu resolvo.",
    "",
    "TÉCNICA QUE EU VOU USAR (é o método de raciocínio, NÃO o assunto)",
    cap.conceito.termo + ": " + cap.conceito.definicao,
    "Use isso apenas para dar forma ao raciocínio. O conteúdo continua sendo sobre a minha área.",
    "",
    "MINHA MATÉRIA-PRIMA (é daqui que o conteúdo tem que sair)",
    "{cole o que você escreveu na tarefa de hoje, ou grave um áudio de 2 minutos falando sobre isso e cole a transcrição}",
    "",
    "O QUE EU QUERO",
    "Um {reels de 45 segundos | carrossel de 6 slides | texto de 5 parágrafos} que:",
    ...cap.diretrizes.facaAssim.map((f) => "- " + f),
    "",
    "E QUE EVITE",
    ...cap.diretrizes.eviteAssim.map((f) => "- " + f),
    "",
    "REGRAS INEGOCIÁVEIS",
    "- NUNCA escreva sobre marketing, redes sociais, produção de conteúdo, algoritmo",
    "  ou sobre métodos de criação. O conteúdo é sobre a minha área e mais nada.",
    "- Escreva como eu falo, não como se escreve. Frases curtas.",
    "- Preserve as minhas expressões, inclusive as informais.",
    "- Nada de linguagem institucional: sem 'é fundamental', sem 'de forma consistente'.",
    "- Não invente número, caso nem resultado que eu não tenha dado.",
    "- A última frase é a minha opinião. Deixe direta, sem suavizar.",
    "",
    "Me entregue uma versão só, pronta para publicar. Sem alternativas, sem explicação.",
  ].join("\n");
}
