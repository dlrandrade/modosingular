# Modo Singular

Dois produtos neste repositório:

- **PWA** (`src/`, `supabase/`): o curso digital. Não é alterado pelo trabalho da apostila.
- **Apostila impressa** (`apostila/`): livro de 30 capítulos derivado do PWA, em pasta própria.
  Antes de qualquer trabalho nela, leia `apostila/ORQUESTRADOR.yaml` (briefing, voz, regras,
  rubrica, plano) e rode `python3 apostila/orquestrador.py status` (estado e próxima ação).
  Dependências: `pip install weasyprint pyyaml markdown pypdfium2`.
  Faça commit e push a cada marco: o ambiente pode ser reciclado.
- **Estúdio Singular** (`estudio/`): conteúdo diário (Reels para teleprompter + carrossel + legenda) a partir das
  figuras do livro. Antes de produzir, leia `estudio/PLAYBOOK.md` e use a skill `singular-diario`
  (`python3 estudio/estudio.py proximo`). Dependências: `pip install pyyaml playwright`. Não altera `apostila/texto/`.
  A plataforma mora em `src/app/estudio/` (+ `src/estudio/`, `src/app/api/estudio/`, `public/estudio*`): é um app à parte do PWA,
  com service worker próprio (escopo `/estudio`), e guarda tarefas e kits num balde privado do Supabase Storage.
