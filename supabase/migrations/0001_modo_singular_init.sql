-- =====================================================================
-- MODO SINGULAR — schema inicial
-- Aplicar em: Supabase Dashboard > SQL Editor > New query > Run
-- Idempotente: pode rodar mais de uma vez sem quebrar.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
do $$ begin
  create type app_role as enum ('user','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sub_status as enum ('none','trialing','active','past_due','canceled','refunded','expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type chapter_state as enum ('locked','available','reading','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_state as enum ('draft','submitted','published');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  nome            text,
  profissao       text,
  especialidade   text,
  bio             text,
  instagram       text,
  cidade          text,
  avatar_url      text,
  role            app_role not null default 'user',
  timezone        text not null default 'America/Sao_Paulo',
  onboarding_done boolean not null default false,
  -- resultado do "Teste de Linguagem Criativa" (Cap. 9)
  linguagem_primaria   text,
  linguagem_secundaria text,
  linguagem_scores     jsonb not null default '{}'::jsonb,
  -- ritmo declarado pelo especialista (Cap. 10)
  ritmo_minutos_dia    int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ASSINATURAS (Kiwify)
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid unique references auth.users(id) on delete cascade,
  email                   text not null,
  status                  sub_status not null default 'none',
  plan                    text not null default 'mensal',
  price_cents             int not null default 1990,
  currency                text not null default 'BRL',
  kiwify_order_id         text,
  kiwify_subscription_id  text,
  kiwify_customer_id      text,
  started_at              timestamptz,
  current_period_end      timestamptz,
  canceled_at             timestamptz,
  raw                     jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists subscriptions_email_idx on public.subscriptions (lower(email));
create index if not exists subscriptions_status_idx on public.subscriptions (status);
create unique index if not exists subscriptions_kiwify_sub_idx
  on public.subscriptions (kiwify_subscription_id) where kiwify_subscription_id is not null;

-- Log cru de webhooks (auditoria + reprocessamento)
create table if not exists public.kiwify_events (
  id            uuid primary key default gen_random_uuid(),
  event_type    text,
  order_id      text,
  subscription_id text,
  email         text,
  signature_ok  boolean not null default false,
  payload       jsonb not null,
  processed_at  timestamptz,
  error         text,
  created_at    timestamptz not null default now()
);
create index if not exists kiwify_events_created_idx on public.kiwify_events (created_at desc);

-- ---------------------------------------------------------------------
-- JORNADA (matrícula nos 30 dias)
-- ---------------------------------------------------------------------
create table if not exists public.journeys (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  started_at     timestamptz not null default now(),
  timezone       text not null default 'America/Sao_Paulo',
  last_active_at timestamptz not null default now(),
  streak_atual   int not null default 0,
  streak_recorde int not null default 0,
  finished_at    timestamptz,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PROGRESSO POR CAPÍTULO
-- ---------------------------------------------------------------------
create table if not exists public.chapter_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  chapter         int  not null check (chapter between 1 and 30),
  state           chapter_state not null default 'available',
  opened_at       timestamptz,
  completed_at    timestamptz,
  leitura_segundos int not null default 0,
  scroll_pct      int not null default 0 check (scroll_pct between 0 and 100),
  favorito        boolean not null default false,
  updated_at      timestamptz not null default now(),
  unique (user_id, chapter)
);
create index if not exists chapter_progress_user_idx on public.chapter_progress (user_id);

-- ---------------------------------------------------------------------
-- QUIZ
-- ---------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  chapter      int  not null check (chapter between 1 and 30),
  attempt_no   int  not null default 1,
  answers      jsonb not null default '[]'::jsonb,
  acertos      int  not null default 0,
  total        int  not null default 0,
  passou       boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists quiz_attempts_user_chapter_idx on public.quiz_attempts (user_id, chapter);

-- ---------------------------------------------------------------------
-- PONTUAÇÃO DE APLICAÇÃO (auto-avaliação guiada por critérios)
-- ---------------------------------------------------------------------
create table if not exists public.application_scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  chapter     int  not null check (chapter between 1 and 30),
  criterios   jsonb not null default '{}'::jsonb,  -- { criterioId: 0..5 }
  score       int  not null default 0,             -- 0..100 normalizado
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, chapter)
);

-- ---------------------------------------------------------------------
-- TAREFAS — o especialista produzindo conteúdo de verdade
-- ---------------------------------------------------------------------
create table if not exists public.task_submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  chapter      int  not null check (chapter between 1 and 30),
  state        task_state not null default 'draft',
  titulo       text,
  corpo        text not null default '',
  formato      text,          -- reels | carrossel | texto | story | live ...
  campos       jsonb not null default '{}'::jsonb, -- respostas de campos guiados
  publicado_em timestamptz,
  link_publicacao text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, chapter)
);
create index if not exists task_submissions_user_idx on public.task_submissions (user_id);

-- ---------------------------------------------------------------------
-- BANCO DE MATÉRIA-PRIMA (o "caderno de campo" do especialista)
-- ---------------------------------------------------------------------
create table if not exists public.raw_material (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tipo        text not null default 'observacao', -- pergunta | objecao | caso | opiniao | erro | observacao | explicacao
  texto       text not null,
  contexto    text,
  tags        text[] not null default '{}',
  usado_em    int,     -- capítulo em que virou conteúdo
  origem_capitulo int,
  created_at  timestamptz not null default now()
);
create index if not exists raw_material_user_idx on public.raw_material (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- ANOTAÇÕES / GRIFOS
-- ---------------------------------------------------------------------
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  chapter    int not null check (chapter between 1 and 30),
  corpo      text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, chapter)
);

-- ---------------------------------------------------------------------
-- DIAGNÓSTICOS / TESTES (entrada e saída)
-- ---------------------------------------------------------------------
create table if not exists public.assessments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  slug       text not null,       -- 'diagnostico-inicial' | 'linguagem-criativa' | 'diagnostico-final'
  respostas  jsonb not null default '{}'::jsonb,
  resultado  jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists assessments_user_slug_idx on public.assessments (user_id, slug, created_at desc);

-- ---------------------------------------------------------------------
-- CONFIG DE CAPÍTULO (gerida pelo admin: vídeo, nota, publicação)
-- ---------------------------------------------------------------------
create table if not exists public.chapter_settings (
  chapter        int primary key check (chapter between 1 and 30),
  video_url      text,
  video_provider text,            -- youtube | vimeo | panda | mp4
  video_duracao  int,
  nota_admin     text,
  publicado      boolean not null default true,
  updated_by     uuid references auth.users(id),
  updated_at     timestamptz not null default now()
);

insert into public.chapter_settings (chapter)
select generate_series(1,30)
on conflict (chapter) do nothing;

-- ---------------------------------------------------------------------
-- CONFIG GLOBAL DO APP
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('preco',            '{"cents":1990,"label":"R$ 19,90","periodo":"mês"}'::jsonb),
  ('checkout_url',     '{"url":""}'::jsonb),
  ('capitulos_gratis', '{"ate":3}'::jsonb),
  ('ritmo',            '{"dias_minimos":7,"total_capitulos":30,"sugestao_diaria":1}'::jsonb),
  ('avisos',           '{"banner":"", "ativo":false}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- LOG DE ATIVIDADE (streak, métricas de admin)
-- ---------------------------------------------------------------------
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  acao       text not null,
  chapter    int,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_user_idx on public.activity_log (user_id, created_at desc);
create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

-- ---------------------------------------------------------------------
-- FUNÇÕES
-- ---------------------------------------------------------------------

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','subscriptions','chapter_progress','application_scores',
    'task_submissions','notes','chapter_settings','app_settings'
  ] loop
    execute format('drop trigger if exists trg_touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger trg_touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Criação automática de profile + journey ao cadastrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;

  insert into public.journeys (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, email, status)
  values (new.id, new.email, 'none')
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- É admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Teto de capítulos liberados: sugestão 1/dia, adiantamento até fechar em 7 dias.
--   teto(dia) = ceil(dia * 30 / 7)  →  D1:5 D2:9 D3:13 D4:18 D5:22 D6:26 D7:30
create or replace function public.limite_capitulos(started timestamptz, tz text default 'America/Sao_Paulo')
returns int language sql immutable as $$
  select least(30, greatest(1,
    ceil(
      (
        (date_trunc('day', (now() at time zone tz))::date
         - date_trunc('day', (started at time zone tz))::date) + 1
      )::numeric * 30 / 7
    )::int
  ));
$$;

-- Ligar assinatura da Kiwify ao usuário quando ele se cadastrar depois de comprar
create or replace function public.claim_subscription_by_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.subscriptions s
     set user_id = new.id
   where s.user_id is null
     and lower(s.email) = lower(new.email);
  return new;
end $$;

drop trigger if exists on_auth_user_claim_sub on auth.users;
create trigger on_auth_user_claim_sub
  after insert on auth.users
  for each row execute function public.claim_subscription_by_email();

-- ---------------------------------------------------------------------
-- VIEW de admin: assinantes com progresso
-- ---------------------------------------------------------------------
create or replace view public.admin_subscribers
with (security_invoker = true) as
select
  p.id,
  p.email,
  p.nome,
  p.profissao,
  p.role,
  p.linguagem_primaria,
  p.created_at as cadastrado_em,
  coalesce(s.status,'none')      as status_assinatura,
  s.current_period_end,
  s.kiwify_order_id,
  j.started_at                   as jornada_iniciada_em,
  j.streak_atual,
  (select count(*) from public.chapter_progress cp
    where cp.user_id = p.id and cp.state = 'completed') as capitulos_concluidos,
  (select count(*) from public.task_submissions ts
    where ts.user_id = p.id and ts.state in ('submitted','published')) as tarefas_entregues,
  (select max(al.created_at) from public.activity_log al where al.user_id = p.id) as ultima_atividade
from public.profiles p
left join public.subscriptions s on s.user_id = p.id
left join public.journeys j      on j.user_id = p.id;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.journeys           enable row level security;
alter table public.chapter_progress   enable row level security;
alter table public.quiz_attempts      enable row level security;
alter table public.application_scores enable row level security;
alter table public.task_submissions   enable row level security;
alter table public.raw_material       enable row level security;
alter table public.notes              enable row level security;
alter table public.assessments        enable row level security;
alter table public.chapter_settings   enable row level security;
alter table public.app_settings       enable row level security;
alter table public.activity_log       enable row level security;
alter table public.kiwify_events      enable row level security;

-- Helper: gera as 4 políticas padrão "dono do registro" para uma tabela
do $$
declare t text;
begin
  foreach t in array array[
    'chapter_progress','quiz_attempts','application_scores',
    'task_submissions','raw_material','notes','assessments'
  ] loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_insert_own" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_update_own" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_delete_own" on public.%1$s', t);

    execute format('create policy "%1$s_select_own" on public.%1$s for select
      using (auth.uid() = user_id or public.is_admin())', t);
    execute format('create policy "%1$s_insert_own" on public.%1$s for insert
      with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_update_own" on public.%1$s for update
      using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s_delete_own" on public.%1$s for delete
      using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Impede escalonamento de privilégio: usuário comum nunca altera o próprio role.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_profile_role on public.profiles;
create trigger trg_guard_profile_role before update on public.profiles
  for each row execute function public.guard_profile_role();
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- subscriptions: leitura própria; escrita só via service_role (webhook)
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions for select
  using (auth.uid() = user_id or public.is_admin());

-- journeys
drop policy if exists "journeys_select_own" on public.journeys;
create policy "journeys_select_own" on public.journeys for select
  using (auth.uid() = user_id or public.is_admin());
drop policy if exists "journeys_upsert_own" on public.journeys;
create policy "journeys_upsert_own" on public.journeys for insert
  with check (auth.uid() = user_id);
drop policy if exists "journeys_update_own" on public.journeys;
create policy "journeys_update_own" on public.journeys for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- activity_log: insere o próprio, admin lê tudo
drop policy if exists "activity_insert_own" on public.activity_log;
create policy "activity_insert_own" on public.activity_log for insert
  with check (auth.uid() = user_id);
drop policy if exists "activity_select" on public.activity_log;
create policy "activity_select" on public.activity_log for select
  using (auth.uid() = user_id or public.is_admin());

-- chapter_settings: todo autenticado lê; só admin escreve
drop policy if exists "chapter_settings_read" on public.chapter_settings;
create policy "chapter_settings_read" on public.chapter_settings for select
  using (auth.role() = 'authenticated');
drop policy if exists "chapter_settings_admin" on public.chapter_settings;
create policy "chapter_settings_admin" on public.chapter_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- app_settings: leitura pública (preço/checkout aparecem na landing)
drop policy if exists "app_settings_read" on public.app_settings;
create policy "app_settings_read" on public.app_settings for select using (true);
drop policy if exists "app_settings_admin" on public.app_settings;
create policy "app_settings_admin" on public.app_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- kiwify_events: só admin lê (escrita via service_role)
drop policy if exists "kiwify_events_admin" on public.kiwify_events;
create policy "kiwify_events_admin" on public.kiwify_events for select
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- GRANTS
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.app_settings to anon, authenticated;
grant select on public.chapter_settings to authenticated;
grant select, insert, update, delete on
  public.chapter_progress, public.quiz_attempts, public.application_scores,
  public.task_submissions, public.raw_material, public.notes,
  public.assessments, public.journeys
  to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert on public.activity_log to authenticated;
grant select on public.admin_subscribers to authenticated;
