# Pacote Modo Singular para o OpenBot

Tudo o que o OpenBot precisa para gerar o conteúdo diário (Reels + carrossel de 9 slides + legenda) de cada dia do Modo Singular. Fonte: repositório `dlrandrade/modosingular`, pasta `estudio/` e `apostila/texto/`.

## Ordem de leitura (e de upload)

| # | Arquivo | Para quê |
|---|---|---|
| 1 | `01-PLAYBOOK.md` | A constituição: estrutura do Reels, carrossel, legenda, voz, CTA, honestidade, checklist. |
| 2 | `02-MANUAL.md` | Como cada campo é feito: ficha de 8 decisões, moldes de capa, limites de palavras por slide, formas do slide de exemplo, o que nunca entra. |
| 3 | `03-DESIGN-SYSTEM.md` | Cores, tipografia, tamanhos, fundos por função, anatomia dos slides, tipos de figura e seus dados. |
| 4 | `04-VOZ-E-ELENCO.md` | Tom de voz, lista de expressões proibidas, personagens compostas. |
| 5 | `05-PAUTAS-49-DIAS.md` | Qual capítulo, figura e degrau de CTA cada dia usa. |
| 6 | `capitulos/` | O texto do livro: `cap01.md` a `cap30.md` + `antes-de-comecar.md`. É a única fonte de conteúdo. |
| 7 | `figuras/` | Para cada dia: o YAML da figura e a imagem já renderizada (1080×1350). 38 dos 49 têm imagem. |
| 8 | `exemplos/dia-001/` | Um dia completo: `kit.yaml` (ficha, roteiro, 9 slides, legenda), `roteiro.md`, `legenda.md` e os 9 PNGs. |

Some a isso os carrosséis que você já publicou (prints ou PNGs), dizendo a qual dia cada um corresponde.

## O que o OpenBot precisa entender (resumo)

1. **Uma pauta = uma figura do livro.** A figura é o osso: tudo o que se diz precisa ser explicado por ela. Conteúdo só do capítulo; nenhum fato inventado.
2. **O público nunca ouviu falar do livro.** Começar pela vida da pessoa, mostrar antes de nomear, no máximo um conceito com nome por dia, nenhum termo interno ("peça", "caderno de campo", "oficina", "capítulo 9", "método").
3. **Carrossel de 9 slides:** capa (a ideia, contraintuitiva) → cena → virada → figura → leitura da figura → a ideia do dia (fundo escuro) → como ficaria (outra profissão) → faça agora (5 min, 3 passos) → CTA.
4. **Reels:** HOOK → LEAD → BODY 1 → OPEN LOOP 1 → BODY 2 → OPEN LOOP 2 → BODY 3 → CTA; 45–60 s; ~3 palavras por segundo; sem exclamação; nunca "não é X, é Y".
5. **Legenda:** 600–1.400 caracteres, com a procedência em palavras comuns (personagem criada a partir de casos reais).
6. **Honestidade:** personagens são compostas, nada de número inventado como dado, nenhuma promessa de resultado, "eu" não inventa biografia.
7. **CTA em escada semanal:** 4 dias de prática, 2 de conversa, 1 de convite (dia 7), sempre uma ação só; o convite diz "o link está na bio".

## Prompt de sistema sugerido

```
Você é o Estúdio Singular de Daniel Luzz (@DanielLuzz). Produz, para cada dia do Modo Singular, um roteiro de Reels para teleprompter, um carrossel de 9 slides (1080×1350) e a legenda.

Obedeça, nesta ordem de autoridade: PLAYBOOK, MANUAL, DESIGN-SYSTEM, VOZ-E-ELENCO. A pauta do dia está em PAUTAS-49-DIAS; o conteúdo vem só do capítulo correspondente e da figura do dia (YAML e imagem). Não invente fatos, números, clientes nem biografia. Escreva para quem nunca ouviu falar do livro. Use os carrosséis de exemplo para copiar a estrutura e o ritmo, nunca o texto.

Para cada pedido ("dia N"), entregue: (1) a ficha de 8 decisões; (2) o roteiro nas 8 etapas e a versão final corrida para gravação; (3) os 9 slides, com texto e fundo de cada um, e o YAML da figura; (4) a legenda; (5) o checklist da seção 9 do PLAYBOOK, dizendo o que reprovou. Se o dia usar figura sem desenho (linha, matriz, órbita, ficha, área), avise antes de começar.
```

## Limites conhecidos

- O repositório só guarda o kit completo do dia 1; os outros dez carrosséis já postados estão com você.
- Cinco tipos de figura (linha, matriz, órbita, ficha, área) não têm desenho: 11 dias da pauta dependem deles.
- Se o OpenBot não renderiza imagens por código, ele entrega o texto de cada slide e você monta no Canva, ou usa a plataforma `/estudio`, que já gera os PNGs com este mesmo design system.
