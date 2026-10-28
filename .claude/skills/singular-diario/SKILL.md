---
name: singular-diario
description: Produz o conteúdo do dia do Modo Singular a partir de uma figura do livro: roteiro de Reels para teleprompter (HOOK, LEAD, BODY 1, OPEN LOOP 1, BODY 2, OPEN LOOP 2, BODY 3, CTA), carrossel de 8 slides com a figura redesenhada e legenda, com CTA que leva ao Modo Singular. Use quando o usuário pedir "o post de hoje", "o conteúdo do dia", "o próximo dia do estúdio", "roteiro e carrossel" do Singular, ou citar um dia/capítulo/figura do livro para virar peça.
---

# Singular diário

Gera o kit do dia: `roteiro.md` (teleprompter), `legenda.md` e `slides/slide-NN.png` (carrossel 1080×1350).
Tudo mora em `estudio/`. A regra de ouro está em `estudio/PLAYBOOK.md`: **leia-o inteiro antes de escrever uma palavra**.
Os dados de marca e oferta estão em `estudio/marca.yaml`.

## Passo a passo

1. **Ler o playbook** (`estudio/PLAYBOOK.md`) e a marca (`estudio/marca.yaml`).
2. **Escolher a pauta.**
   - Sem pedido específico: `python3 estudio/estudio.py proximo`. Ele mostra a pauta, o nível de CTA da semana, os dados YAML da figura e os conceitos do capítulo.
   - Com pedido específico (um dia, um capítulo, um tema): ache a pauta em `estudio/banco.yaml`. Se o usuário pedir algo fora das figuras do livro, diga que o sistema parte de uma figura e proponha a mais próxima.
   - Se `template: false`, o carrossel ainda não desenha esse tipo de figura: crie o template em `estudio/carrossel.py` (siga os existentes: função `f_tipo(d)` que recebe os mesmos dados do bloco ```figura``` e registre em `FIGURAS`) ou escolha outra pauta e avise.
3. **Ler o capítulo inteiro** (`apostila/texto/capNN.md`). Só entra no conteúdo o que está nele. Anote a ideia do dia em uma frase, o que a figura mostra que a fala não mostra, e o detalhe que só o livro tem.
4. **Escrever o kit** em `estudio/kits/dia-NNN/kit.yaml`, copiando a estrutura de `estudio/kits/dia-001/kit.yaml`:
   - `roteiro` com as 8 etapas (`hook, lead, body1, loop1, body2, loop2, body3, cta`);
   - `carrossel` de 8 slides (capa, cena, virada, figura, leitura da figura, ideia do dia, faça agora, cta);
   - `legenda`;
   - `duracao` (45 ou 60), `cta_nivel` (o do `proximo`).
   Os dados da figura vêm do bloco ```figura``` do capítulo, sem inventar valor.
5. **Conferir**: `python3 estudio/estudio.py lint NN`. Corrija todos os ERROS. Leia os AVISOS e decida.
6. **Renderizar**: `python3 estudio/estudio.py render NN`. Abra os PNGs (pelo menos o slide da figura e o CTA) e confira legibilidade e overflow. Se aparecer "AVISO slide N: conteúdo encosta...", corte texto ou simplifique a figura.
7. **Reler como o leitor**, com o checklist da seção 9 do playbook, e corrigir. Em especial: dois loops resolvidos? O BODY 2 e o BODY 3 trazem informação nova? A personagem do livro está identificada como composta? O CTA pede uma só ação?
8. **Entregar** ao usuário: o roteiro (etapas + versão final), os caminhos dos slides e a legenda. Diga o nível de CTA usado. Não publique nada.
9. **Commit e push** a cada dia pronto. Só marque `publicado` (`estudio.py publicado NN`) quando o usuário disser que publicou.

## Regras que não se negociam

- Estrutura de Reels fixa (Gancho → Introdução → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → Gancho de curiosidade → Desenvolvimento → CTA); a introdução termina por volta dos 10 s (hook + lead ≤ 34 palavras, o `lint` barra); loops legítimos, resolvidos no mesmo vídeo.
- Nenhum "não é X, é Y", nenhum "Você sabia?", nenhuma exclamação (o `lint` barra).
- Personagens do livro (Renata, Otávio, Lúcia, Caio) são compostos: nunca "um cliente meu", e sempre identificáveis como personagem do livro.
- O "eu" de Daniel Luzz opina; não inventa episódio de vida.
- Nenhum número inventado como dado; nenhuma promessa de resultado.
- CTA: uma ação por peça; Modo Singular como continuação natural do exercício, nunca urgência falsa.
- O PWA (`src/`) e o texto do livro (`apostila/texto/`) não se alteram a partir daqui. Se achar erro no livro, anote e avise o usuário.
- O que `estudio/marca.yaml` traz como pendente (handle, ação do método) não se inventa: pergunte ao usuário.
