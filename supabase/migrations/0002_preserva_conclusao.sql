-- =====================================================================
-- MODO SINGULAR — preserva a conclusão dos capítulos
--
-- Bug corrigido: abrirCapitulo() gravava state='reading' sem condição, e
-- roda toda vez que o leitor abre um capítulo. Reabrir um capítulo já
-- concluído — para reler, ou por um simples remount da página —
-- rebaixava o registro e apagava o progresso do aluno.
--
-- O código foi corrigido, mas a garantia tem que ser do banco: nenhum
-- caminho futuro pode regredir uma conclusão.
--
-- Aplicar em: Supabase Dashboard > SQL Editor > New query > Run
-- Idempotente: pode rodar mais de uma vez.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) A trava estrutural
-- ---------------------------------------------------------------------
create or replace function public.preserva_conclusao()
returns trigger language plpgsql as $$
begin
  -- Uma vez concluído, sempre concluído. Reler não desfaz.
  if old.state = 'completed' and new.state is distinct from 'completed' then
    new.state := old.state;
  end if;

  -- A data original da conclusão nunca é perdida nem reescrita.
  if old.completed_at is not null then
    new.completed_at := old.completed_at;
  end if;

  return new;
end $$;

drop trigger if exists trg_preserva_conclusao on public.chapter_progress;
create trigger trg_preserva_conclusao
  before update on public.chapter_progress
  for each row execute function public.preserva_conclusao();

-- ---------------------------------------------------------------------
-- 2) Recuperação do progresso perdido
--
-- Toda conclusão deixou rastro em activity_log (acao='concluiu_capitulo'),
-- e esse registro nunca foi sobrescrito. É a fonte da verdade para
-- reconstruir o que o bug apagou.
-- ---------------------------------------------------------------------

-- 2a) Capítulos concluídos cujo registro de progresso sumiu por completo.
insert into public.chapter_progress (user_id, chapter, state, completed_at, opened_at)
select al.user_id, al.chapter, 'completed', min(al.created_at), min(al.created_at)
from public.activity_log al
where al.acao = 'concluiu_capitulo' and al.chapter is not null
group by al.user_id, al.chapter
on conflict (user_id, chapter) do nothing;

-- 2b) Capítulos rebaixados de 'completed' para 'reading' pelo bug.
update public.chapter_progress cp
   set state = 'completed',
       completed_at = coalesce(cp.completed_at, r.quando)
  from (
    select user_id, chapter, min(created_at) as quando
    from public.activity_log
    where acao = 'concluiu_capitulo' and chapter is not null
    group by user_id, chapter
  ) r
 where cp.user_id = r.user_id
   and cp.chapter = r.chapter
   and cp.state is distinct from 'completed';

-- ---------------------------------------------------------------------
-- 3) Conferência — quanto foi recuperado
-- ---------------------------------------------------------------------
do $$
declare recuperados int;
begin
  select count(*) into recuperados
  from public.chapter_progress where state = 'completed';
  raise notice 'Capítulos marcados como concluídos após a recuperação: %', recuperados;
end $$;
