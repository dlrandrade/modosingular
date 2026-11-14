# Design system do carrossel Modo Singular

Fonte da verdade: `src/estudio/slides.ts` (o mesmo código desenha a plataforma /estudio e os PNGs). Se o OpenBot desenhar por outro caminho (Canva, HTML próprio), deve reproduzir exatamente o que está aqui.

## 1. Formato

- Slide: **1080 × 1350 px** (4:5, feed do Instagram). Carrossel de **9 slides** (10 só quando a figura pede slide próprio).
- Margens: 112 px nas laterais, 112 px no topo, 150 px embaixo (o rodapé fica a 64 px da borda). Nada de texto a menos de ~118 px da borda inferior nem a 60 px da direita.
- Texto mínimo legível no celular: ~29 px em 1080.
- Figura para o Reels: 1080 × 1920, fundo transparente, figura num cartão no alto (y ≈ 236), para ficar acima da cabeça de quem grava.

## 2. Cores

| Token | Valor | Uso |
|---|---|---|
| papel | `#faf9f6` | fundo padrão (capa, virada) |
| tinta | `#16181d` | texto principal |
| t2 | `#4e5460` | texto de apoio |
| t3 | `#878e9c` | rótulos, rodapé, notas |
| fio | `#e0dcd2` | linhas finas |
| acento (ouro) | `#9a7328` | o único destaque de cada figura/slide |
| acento-bg | `#f0e6cf` | avatar, realces claros |
| cartão | `#ffffff` | cartões dentro do slide |

Fundos, escolhidos **pela função do slide**, nunca por enfeite:

| Função | Fundo | Variáveis |
|---|---|---|
| Capa, virada | claro | papel `#faf9f6` |
| Cena, leitura da figura | areia | papel `#f2f0ea`, fio `#dcd7cb` |
| Figura, faça agora | branco | papel `#ffffff`, fio `#e6e2d8`, cartão `#faf9f6` |
| A ideia do dia | escuro | papel `#0b0c0f`, tinta `#eceef3`, t2 `#a8afbd`, t3 `#6b7383`, fio `#262b36`, **acento `#d8b26a`** (ouro fosco), cartão `#15181f` |
| Como ficaria | ouro-claro | papel `#f0e6cf`, fio `#dfd0a9`, t3 `#8a7a55`, acento `#7a5a1e`, cartão `#fffdf8` |
| CTA | ouro | papel `#9a7328`, tinta `#fbf8f1`, t2 `#f1e6cd`, t3 `#dcc799`, acento `#16181d` |

Regra: nunca dois slides vizinhos escuros ou dourados.

## 3. Tipografia

Casamento de duas famílias (arquivos .woff2 em `public/estudio/fontes/`; ambas open source, Google Fonts):

- **Inter Tight** (grotesca): títulos, rótulos de figura, números. Peso 650, `letter-spacing: -.035em`, feature `ss01`. Negrito dentro do título: 800.
- **EB Garamond** (serifada): todo texto de apoio, falas, legendas, notas, rodapé e **o itálico dentro dos títulos**. Itálico dentro de título: peso 520, `font-size: 1.12em`, `letter-spacing: -.012em`.
- Regra do itálico: **no máximo uma expressão em itálico por slide**, a que carrega a ideia. Marca-se com `*asteriscos*` no texto. Negrito quase nunca (`**dois**`).

Tamanhos (px, em 1080 de largura):

| Elemento | Fonte | Tamanho / entrelinha |
|---|---|---|
| Título da capa | Inter Tight 650 | 140 / .94 |
| Subtítulo da capa | Garamond itálico, cor t2 | 44 / 1.26, largura máx. 780 |
| Fala (slide de texto) | Inter Tight 650 | 86 / .98 (médio: 68 / 1.02; grande, para "a ideia do dia": 112 / .94) |
| Apoio | Garamond, t2 | 42 / 1.34, largura máx. 820 |
| Tag ("Cena ilustrativa…") | Garamond itálico, t3 | 28 / 1.35 |
| Rótulo do slide ("A cena") | Garamond itálico, t3 (ou acento) | 30 / 1.1 |
| Título da figura | Inter Tight 650 | 70 / 1.0 |
| Legenda da figura | Garamond itálico, t2 | 30 / 1.38, largura máx. 820 |
| Item de lista: rótulo | Inter Tight 650, acento | 38 / 1.05 |
| Item de lista: texto | Garamond, t2 | 34 / 1.34 |
| Título do CTA | Inter Tight 650 | 96 / .98 |
| Rodapé: "Modo Singular" | Garamond itálico, t3 | 26 |
| Rodapé: @handle | Inter Tight 500, `letter-spacing .08em` | 19 |
| Selo "esquema ilustrativo" | Inter Tight 500 caixa-alta, `.14em` | 17 |

Dentro das figuras: rótulos em Inter Tight 600–650 (34–38 px), notas em Garamond (27–29 px, itálico nas barras/gap/funil), numeração em Garamond itálico (54–66 px).

## 4. Marca

- Símbolo: círculo fino com três arcos concêntricos e um ponto central (SVG 32×32; círculo r=14,5 stroke .8 opacidade .45; arcos de raio 11, 8 e 5; ponto r=1,6). Cor = a do texto de apoio do slide.
- Assinatura: "Modo Singular" + `@DanielLuzz`.
- Nome do produto: sempre **Modo Singular**. Nunca "Método Singular".

## 5. Anatomia dos slides

1. **Capa**: topo com rótulo do dia ("Dia 01", Garamond itálico t3) à esquerda e o símbolo à direita; título em Inter Tight 140 px com uma expressão em itálico; subtítulo itálico; indicador "DESLIZA" (caixa-alta pequena + traço de 160 px); rodapé com "Modo Singular" e o @.
2. **Texto**: rótulo pequeno em cima (opcional), fala grande, apoio e/ou tag. Conteúdo centralizado verticalmente.
3. **Lista**: rótulo + fala curta + 3 itens em grade de duas colunas (rótulo dourado à esquerda, texto à direita), separados por fio de 1,5 px.
4. **Figura**: título (conclusão, não descrição) no alto, a figura no centro com ar em volta, legenda curta embaixo. Um único elemento destacado em ouro. Quando a figura inventa valores: selo "esquema ilustrativo".
5. **Exemplo (como ficaria)**: título, "quem" em itálico, e o artefato em cartão branco com borda fina: `post` (cabeçalho com avatar redondo + nome/profissão + 2–3 parágrafos em 38 px), `antes_depois`, `rascunho` ou `conversa`; nota final "Exemplo ilustrativo: …".
6. **CTA**: fundo ouro, título 96 px, apoio, a ação, e a assinatura (símbolo 48 px + "Modo Singular" + @).

Princípios: muito espaço; um slide, uma ideia (até ~40 palavras); um itálico por slide; nada de emoji, seta feita de texto, exclamação, hashtag dentro do slide; só o cerne, sem enfeite; a figura é o elemento primordial e ganha ar (MANUAL, 3.2).

## 6. Figuras: tipos e dados YAML

A figura de cada dia vem do bloco `figura` do capítulo. Tipos com desenho pronto: camadas, fluxo/passos, barras, balança, escada, funil, gap, quadrante, espectro. Sem desenho ainda: linha, matriz, órbita, ficha, área. O elemento com `destaque` (ou o último) fica em ouro; o resto, em t3/tinta.

Um exemplo de dados por tipo (os 49 estão em `figuras/dia-DD-figura.yaml`; as imagens renderizadas, em `figuras/dia-DD-figura.png`):

### camadas (exemplo: dia 1)

```yaml
tipo: camadas
titulo: Do que todos encontram ao que só você tem
camadas:
  - {rotulo: "Informação", nota: "O que a sua área sabe. Está nos livros e numa busca rápida."}
  - {rotulo: "Aplicação", nota: "Como se faz na prática. Está nos cursos e nos protocolos."}
  - {rotulo: "Padrão", nota: "O que costuma acontecer, e em que ordem. Só o volume ensina."}
  - {rotulo: "Exceção", nota: "Quando a regra falha, e por quais sinais. Só os casos difíceis ensinam."}
  - {rotulo: "Critério", nota: "Como você decide entre duas saídas defensáveis. É o que há de mais seu."}
divisao: 2
grupos: ["NOS LIVROS E NOS CURSOS", "O QUE SÓ A PRÁTICA DÁ"]
legenda: As duas camadas de cima são iguais em todo mundo que estudou. A diferença entre especialistas está nas três de baixo.
```

### gap (exemplo: dia 2)

```yaml
tipo: gap
titulo: A distância que não aparece na agenda
ilustrativo: true
a: {rotulo: "Autoridade real", valor: 92, nota: "O que sabe quem já passou por você. Construída em anos de casos, erros e acertos."}
b: {rotulo: "Autoridade percebida", valor: 24, nota: "O que sabe quem só viu o seu perfil. Construída por escolhas que você nunca fez de propósito."}
rotulo_distancia: a assimetria
legenda: Os tamanhos são ilustrativos. O autodiagnóstico deste capítulo dá uma estimativa da sua.
```

### balanca (exemplo: dia 3)

```yaml
tipo: balanca
titulo: O que pesa de verdade na decisão
ilustrativo: true
esquerda: {rotulo: "O desconforto de aparecer", peso: 40}
direita: {rotulo: "Outro explicar no seu lugar", peso: 78}
legenda: O desconforto é real e é seu. O custo de ceder a conversa recai sobre o seu público, e se renova a cada dúvida respondida por outra pessoa.
```

### barras (exemplo: dia 5)

```yaml
tipo: barras
titulo: O formato errado cobra antes de você começar
ilustrativo: true
unidade: quanto menor a barra, mais fácil sustentar
series:
  - {rotulo: "Formato que combina com você", valor: 18, nota: "Vira extensão do trabalho, porque você já pensava assim."}
  - {rotulo: "Formato neutro", valor: 44, nota: "Funciona, mas exige preparo consciente a cada vez."}
  - {rotulo: "Formato incompatível", valor: 87, nota: "Exige virar outra pessoa antes de começar. É aqui que a sequência quebra."}
legenda: Os valores são ilustrativos. O seu quadro de atrito, na oficina, mostra onde está o custo no seu caso.
```

### quadrante (exemplo: dia 6)

```yaml
tipo: quadrante
titulo: Onde mora a sua opinião
ilustrativo: true
eixoX: ["Todo mundo concorda", "Muita gente discorda"]
eixoY: ["Abandona quando custa", "Sustenta mesmo pagando"]
pontos:
  - {x: 12, y: 14, rotulo: "Frase segura"}
  - {x: 20, y: 36, rotulo: "Dica prática"}
  - {x: 56, y: 36, rotulo: "Opinião morna"}
  - {x: 94, y: 12, rotulo: "Polêmica gratuita"}
  - {x: 80, y: 80, rotulo: "A sua posição", destaque: true}
legenda: A divergência sozinha leva à polêmica gratuita, que chama atenção e se esgota. A posição que vale diverge e continua de pé quando cobra o preço.
```

### fluxo (exemplo: dia 7)

```yaml
tipo: fluxo
titulo: A terceirização na ordem certa
ciclico: true
nos:
  - {rotulo: "Você descobre a sua linguagem", nota: "As fases II e III deste livro. Não delegável."}
  - {rotulo: "Você produz a matéria-prima", nota: "Áudio de três minutos, nota de voz, rascunho torto."}
  - {rotulo: "O terceiro organiza e formata", nota: "Corta, diagrama, legenda, agenda."}
  - {rotulo: "Você revisa contra a sua voz", nota: "Eu falaria assim? É a única pergunta."}
```

### escada (exemplo: dia 8)

```yaml
tipo: escada
titulo: Os quatro tempos do caso-prova
degraus:
  - {rotulo: "A situação que parecia óbvia", nota: "Como qualquer um leria o caso. Alinha o leitor com o erro comum."}
  - {rotulo: "O detalhe que não fechava", nota: "A coisa pequena que você notou. É aqui que a autoridade aparece."}
  - {rotulo: "A decisão e o porquê", nota: "O que você fez de diferente. O porquê é o conteúdo; o quê é só o enredo."}
  - {rotulo: "O que ensina a quem não é você", nota: "O critério que a pessoa leva, mesmo sem nunca procurar você."}
```

### funil (exemplo: dia 10)

```yaml
tipo: funil
titulo: O que acontece quando o critério é público
etapas:
  - {rotulo: "A pessoa lê o seu critério", nota: "Sem conhecer você, sem indicação."}
  - {rotulo: "Reconhece um bom raciocínio", nota: "Avalia o raciocínio."}
  - {rotulo: "Reconhece-se ou se afasta", nota: "Os dois resultados são bons: o filtro acontece antes da primeira conversa."}
  - {rotulo: "Chega concordando com a régua", nota: "A objeção já foi respondida."}
  - {rotulo: "Aceita a condução do trabalho", nota: "Escolheu você pela régua."}
```

### espectro (exemplo: dia 16)

```yaml
tipo: espectro
titulo: Ter o que dizer rende mais do que qualquer edição
ilustrativo: true
esquerda: Rende pouco
direita: Rende muito
marcas:
  - {pos: 8, rotulo: "Identidade visual"}
  - {pos: 28, rotulo: "Edição elaborada"}
  - {pos: 58, rotulo: "Áudio limpo"}
  - {pos: 90, rotulo: "Ter o que dizer"}
legenda: As posições são ilustrativas; a ordem é a tese deste capítulo.
```

### linha (exemplo: dia 18)

```yaml
tipo: linha
titulo: Por que a sequência quebra num dia comum
ilustrativo: true
labels: ["D1", "D5", "D10", "D15", "D20", "D23", "D30"]
x: [1, 5, 10, 15, 20, 23, 30]
series:
  - {nome: "Energia disponível", pontos: [95, 85, 76, 68, 60, 54, 46], destaque: true}
  - {nome: "Custo do formato incompatível", pontos: [38, 40, 43, 46, 50, 54, 60]}
  - {nome: "Custo do formato compatível", pontos: [18, 17, 16, 15, 15, 14, 14]}
marcas:
  - {em: 23, rotulo: "as linhas se cruzam"}
legenda: Esquema ilustrativo, com o eixo proporcional aos dias.
```

### orbita (exemplo: dia 20)

```yaml
tipo: orbita
titulo: A rotina como fonte permanente
centro: A sua prática
satelites: ["Perguntas", "Objeções", "Casos", "Erros comuns", "Decisões", "Opiniões", "Observações"]
legenda: As fontes não se esgotam, porque a prática não para. O que se esgota é a atenção de quem não anota.
```

### area (exemplo: dia 21)

```yaml
tipo: area
titulo: O que vinte segundos por dia acumulam
ilustrativo: true
labels: ["Semana 1", "Semana 4", "Semana 8", "Semana 12"]
pontos: [14, 32, 55, 78]
unidade: anotações acumuladas no caderno
legenda: Esquema ilustrativo de um estoque que cresce com vinte segundos de cada vez. Com algumas semanas de caderno, o problema pode deixar de ser falta de ideia.
```

### matriz (exemplo: dia 22)

```yaml
tipo: matriz
titulo: Afinidade entre modo e formato
colunas: ["Vídeo falado", "Carrossel", "Texto longo", "Respostas", "Conversa gravada", "Vídeo de caso"]
linhas:
  - {rotulo: "Oral", celulas: [2, 0, 0, 1, 2, 2]}
  - {rotulo: "Escrito", celulas: [0, 2, 2, 1, 0, 1]}
  - {rotulo: "Dialógico", celulas: [1, 1, 1, 2, 2, 0]}
  - {rotulo: "Narrativo", celulas: [2, 1, 2, 0, 1, 2]}
ilustrativo: true
legenda: Na coluna Respostas, respostas escritas ou gravadas a perguntas do público. Uma leitura aproximada, para orientar os primeiros testes. O seu caderno de campo vai confirmar ou corrigir a sua linha.
```

### ficha (exemplo: dia 25)

```yaml
tipo: ficha
titulo: A ficha de léxico do Caio
nome: "Léxico de Caio Tavares, arquiteto"
linhas:
  - {rotulo: "Palavras-âncora", valor: "Mentira, história, honesto. Aplicadas a coisas, como se paredes e pisos tivessem caráter."}
  - {rotulo: "Comparações", valor: "Vêm de gente: a parede que mente, o piso que aguenta calado, o prédio que envelhece bem."}
  - {rotulo: "Estrutura", valor: "Frases curtas, com pausa depois da afirmação. Nunca mais de uma ideia por frase."}
  - {rotulo: "Ponto de entrada", valor: "Quando explica, começa por uma obra: “Teve uma obra…”. A conclusão vem no fim."}
  - {rotulo: "Nunca diz (e escrevia)", valor: "“É fundamental”, “aquisição”, “solução”, “ambiente clean”: nenhuma aparece nos áudios; todas apareciam nas legendas."}
legenda: A ficha do Caio foi montada a partir de três áudios reais que ele mandou a clientes, transcritos sem nenhuma correção. A sua sai do mesmo jeito, na oficina, a partir de três explicações reais no seu modo.
```
