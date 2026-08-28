# Modo Singular

Curso-aplicativo em 30 capítulos, instalável como PWA, que leva especialistas a
recuperar a autoria da própria presença digital — construído sobre a tese do
dossiê *A Verdade Central do Seu Negócio*.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind v4 · Supabase · Kiwify · Vercel

---

## Como funciona a jornada

**Ritmo.** Um capítulo por dia é o ritmo sugerido. O usuário pode adiantar, mas a
jornada não termina em menos de 7 dias:

```
teto(dia) = ceil(dia × 30 / 7)
D1→5   D2→9   D3→13   D4→18   D5→22   D6→26   D7→30
```

O teto é absoluto por dia, então o que não foi consumido ontem continua
disponível hoje ("segue de onde parou"). Regras aplicadas em ordem, em
`src/lib/ritmo.ts` e **revalidadas no servidor** a cada ação:

1. **Sequência** — só abre o próximo depois de concluir o anterior (com quiz aprovado, ≥70%).
2. **Assinatura** — capítulos 1–3 livres; do 4 em diante exige assinatura ativa.
3. **Ritmo** — não passa do teto proporcional do dia.

**Estrutura.** 5 fases × 6 capítulos: Diagnóstico → Descoberta → Tradução →
Sistema → Território.

**Cada capítulo tem:** tema, frase do dia, conceito definido, ilustração SVG,
conteúdo em blocos ricos (diagramas, gráficos, tabelas, comparações, exemplos
"genérico vs. singular"), insights, quiz corrigido no servidor, teste de
autodiagnóstico, pontuação de aplicação ponderada, tarefa guiada por campos e
diretrizes de produção com esqueleto pronto.

---

## Colocar no ar

### 1. Banco de dados

Abra o **SQL Editor** do Supabase → *New query* → cole
`supabase/migrations/0001_modo_singular_init.sql` → *Run*.

A migration é idempotente (pode rodar de novo). Ela cria tabelas, RLS, triggers,
a view `admin_subscribers`, e semeia `chapter_settings` (30 linhas) e
`app_settings` (preço R$ 19,90, capítulos grátis, ritmo).

Depois, torne-se administrador — substitua pelo seu e-mail:

```sql
update public.profiles set role = 'admin' where email = 'seu@email.com';
```

> Em **Authentication → URL Configuration**, defina *Site URL* e adicione
> `https://SEU-DOMINIO/auth/callback` às *Redirect URLs*.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` (local) e configure as mesmas na Vercel.
`SUPABASE_SERVICE_ROLE_KEY` e `KIWIFY_CLIENT_SECRET` são **somente servidor** —
nunca prefixe com `NEXT_PUBLIC_`.

### 3. Deploy

```bash
npm install
npm run dev      # local
npm run build    # verificar antes de publicar
```

Na Vercel: importe o repositório, cole as variáveis, deploy.

### 4. Kiwify

1. Crie o produto de assinatura recorrente a **R$ 19,90/mês**.
2. Webhook → URL: `https://SEU-DOMINIO/api/kiwify/webhook`
   — eventos: compra aprovada, assinatura renovada, atrasada, cancelada, reembolso.
3. Copie o **token do webhook** para `KIWIFY_WEBHOOK_TOKEN`.
   Sem ele, toda requisição é rejeitada com 401 (mas registrada em `kiwify_events` para auditoria).
4. Cole o link de checkout em **Gestão → Ajustes**.

O webhook valida HMAC-SHA1 sobre o **corpo cru** em comparação de tempo constante.
Se a pessoa comprar antes de criar conta, a assinatura fica pendente pelo e-mail e
o trigger `claim_subscription_by_email` a vincula no cadastro.

`GET /api/kiwify/webhook` responde um health-check para conferir a URL.

---

## Painel de gestão (`/admin`, só para `role = 'admin'`)

- **Visão geral** — cadastrados, assinantes ativos, receita recorrente, capítulos concluídos, tarefas entregues e os últimos eventos da Kiwify com status de assinatura.
- **Capítulos** — link de vídeo por capítulo (YouTube/Vimeo/Panda/MP4, detectados automaticamente), recado no topo e publicação.
- **Assinantes** — busca e filtros; por pessoa: reenviar senha, reenviar confirmação, liberar/revogar acesso manualmente, reiniciar a jornada no Dia 1, promover a admin.
- **Ajustes** — preço, link de checkout e aviso da jornada.

---

## Mapa do código

```
src/
  content/            os 30 capítulos como dados tipados (~4.500 linhas)
    types.ts          modelo de blocos, quiz, teste, tarefa, diretrizes
    capitulos/        fase1..fase5 — 6 capítulos cada
  lib/
    ritmo.ts          regra de liberação (teto de 7 dias) — pura e testável
    dados.ts          carregamento da jornada em uma ida ao banco
    kiwify.ts         HMAC, tradução de status, API pública
    supabase/         client (browser) · server (SSR) · admin (service role)
  components/
    Blocos.tsx        renderer dos blocos + ilustrações SVG
    Diagramas.tsx     9 tipos: gap, funil, quadrante, fluxo, camadas…
    Graficos.tsx      barras, linha, área acumulada, radar
  app/
    page.tsx          landing / página de vendas
    jornada/          mapa das 5 fases com gating visual
    dia/[n]/          leitor + quiz, teste, pontuação, tarefa, notas
    materia-prima/    banco de captura com filtros e busca
    perfil/           dados, linguagem criativa, indicadores
    admin/            painel de gestão
    api/kiwify/       webhook de assinatura
```

## Segurança

- RLS ativo em todas as tabelas; cada pessoa só lê e escreve o que é seu.
- `admin_subscribers` usa `security_invoker = true` — a view respeita o RLS de quem consulta.
- Trigger `guard_profile_role` impede que um usuário comum altere o próprio `role`.
- O gabarito do quiz **nunca vai para o cliente**: a correção acontece em server action.
- Todo acesso a capítulo é revalidado no servidor — o gating do cliente é apenas interface.
- Recuperação de senha responde igual exista ou não a conta (não revela quem é assinante).
