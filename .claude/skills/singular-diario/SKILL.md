---
name: singular-diario
description: Produz o conteúdo do dia do Modo Singular a partir de uma figura do livro: roteiro de Reels para teleprompter (HOOK, LEAD, BODY 1, OPEN LOOP 1, BODY 2, OPEN LOOP 2, BODY 3, CTA), carrossel de 9 slides com a figura redesenhada e um slide de aplicação, e legenda, com CTA que leva ao Modo Singular. Use quando o usuário pedir "o post de hoje", "o conteúdo do dia", "o próximo dia do estúdio", "roteiro e carrossel" do Singular, ou citar um dia/capítulo/figura do livro para virar peça.
---

# Singular diário

Gera o kit do dia: `roteiro.md` (teleprompter), `legenda.md` e `slides/slide-NN.png` (carrossel 1080×1350).
Tudo mora em `estudio/`. As regras estão em `estudio/PLAYBOOK.md` (o que o sistema é) e `estudio/MANUAL.md` (como cada campo é feito, com moldes, limites e a fonte de cada campo no capítulo): **leia os dois inteiros antes de escrever uma palavra**.
Os dados de marca e oferta estão em `estudio/marca.yaml`.

## Passo a passo

1. **Ler o playbook, o manual e a marca** (`estudio/PLAYBOOK.md`, `estudio/MANUAL.md`, `estudio/marca.yaml`).
2. **Escolher a pauta.**
   - Sem pedido específico: `python3 estudio/estudio.py proximo`. Ele mostra a pauta, o nível de CTA da semana, os dados YAML da figura e os conceitos do capítulo.
   - Com pedido específico (um dia, um capítulo, um tema): ache a pauta em `estudio/banco.yaml`. Se o usuário pedir algo fora das figuras do livro, diga que o sistema parte de uma figura e proponha a mais próxima.
   - Se `template: false`, o carrossel ainda não desenha esse tipo de figura: crie o template em `estudio/carrossel.py` (siga os existentes: função `f_tipo(d)` que recebe os mesmos dados do bloco ```figura``` e registre em `FIGURAS`) ou escolha outra pauta e avise.
3. **Ler o capítulo inteiro** (`apostila/texto/capNN.md`) e **preencher a ficha** (MANUAL, seção 1): ideia, conceito, cena, detalhe, figura, virada, aplicação e exercício, cada um tirado do bloco indicado. Só entra no conteúdo o que está no capítulo.
4. **Escrever o kit** em `estudio/kits/dia-NNN/kit.yaml`, copiando a estrutura de `estudio/kits/dia-001/kit.yaml`:
   - `roteiro` com as 8 etapas (`hook, lead, body1, loop1, body2, loop2, body3, cta`), nos moldes e orçamentos da seção 2 do manual;
   - `ficha` com os 8 campos;
   - `carrossel` de 9 slides (capa, cena, virada, figura, leitura da figura, ideia do dia, como ficaria, faça agora, cta), dentro dos limites da seção 3 do manual;
   - `legenda`;
   - `duracao` (45 ou 60), `cta_nivel` (o do `proximo`).
   Os dados da figura vêm do bloco ```figura``` do capítulo, sem inventar valor.
5. **Conferir**: `python3 estudio/estudio.py lint NN`. Corrija todos os ERROS. Leia os AVISOS e decida.
6. **Renderizar**: `python3 estudio/estudio.py render NN`. Abra os PNGs (pelo menos o slide da figura e o CTA) e confira legibilidade e overflow. Se aparecer "AVISO slide N: conteúdo encosta...", corte texto ou simplifique a figura.
7. **Reler como o leitor**, com o checklist da seção 9 do playbook, e corrigir. Em especial: dois loops resolvidos? O BODY 2 e o BODY 3 trazem informação nova? A personagem está identificada como ilustrativa (criada a partir de casos reais)? O CTA pede uma só ação? A abertura (gancho, capa, slides 2 e 3) passou nos três testes do MANUAL, seção 0.2 (entende sozinha, reconhece o próprio mundo, sente coceira, nota 8 ou mais em cada)? Escreva, para cada tela, "Quem chega frio entende: ___"; se não sai, reescreva. Passa no teste do estranho (MANUAL, 0.1): alguém que nunca viu o perfil entende cada frase, sem "peça", "capítulo N", "o livro" ou conceito com nome antes de ser mostrado? O elemento primordial de cada slide tem ar em volta (MANUAL, 3.2)?
8. **Entregar** ao usuário: o roteiro (etapas + versão final), os caminhos dos slides e a legenda. Diga o nível de CTA usado. Não publique nada.
9. **Commit e push** a cada dia pronto. Só marque `publicado` (`estudio.py publicado NN`) quando o usuário disser que publicou.

## Regras que não se negociam

- Estrutura de Reels fixa (Gancho → Introdução → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → CTA); a introdução termina por volta dos 10 s (hook + lead ≤ 34 palavras, o `lint` barra); loops legítimos, resolvidos no mesmo vídeo.
- Nenhum "não é X, é Y", nenhum "Você sabia?", nenhuma exclamação (o `lint` barra).
- Personagens do livro (Renata, Otávio, Lúcia, Caio) são compostos: nunca "um cliente meu", e sempre identificados para o público como personagem criada a partir de casos reais.
- O "eu" de Daniel Luzz opina; não inventa episódio de vida.
- Nenhum número inventado como dado; nenhuma promessa de resultado.
- CTA: uma ação por peça; Modo Singular como continuação natural do exercício, nunca urgência falsa.
- O PWA (`src/`) e o texto do livro (`apostila/texto/`) não se alteram a partir daqui. Se achar erro no livro, anote e avise o usuário.
- O que `estudio/marca.yaml` traz como pendente (handle, ação do método) não se inventa: pergunte ao usuário.
