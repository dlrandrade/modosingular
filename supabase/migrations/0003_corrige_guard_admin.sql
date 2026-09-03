-- =====================================================================
-- MODO SINGULAR — corrige o bloqueio de promoção a admin
--
-- Bug: guard_profile_role() checava public.is_admin(), que depende de
-- auth.uid(). No SQL Editor (e em qualquer chamada via service_role) não
-- existe usuário autenticado — auth.uid() retorna null — então a checagem
-- sempre dava falso e o trigger revertia QUALQUER promoção a admin feita
-- por SQL direto, mesmo pelo dono do projeto. O UPDATE parecia funcionar
-- (0 erro, "1 row affected") mas o valor voltava a 'user' na mesma
-- transação, antes de ser gravado.
--
-- Correção: só bloquear quando existe um usuário autenticado tentando
-- alterar o PRÓPRIO role sem ser admin — que é a ameaça real (alguém
-- promovendo a si mesmo pelo app). Fora de uma sessão autenticada
-- (SQL Editor, service_role, sua própria promoção inicial), a alteração
-- passa.
--
-- Aplicar em: Supabase Dashboard > SQL Editor > New query > Run
-- Já promove dlrandrade@gmail.com a admin ao final.
-- =====================================================================

create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

-- Promove o dono do projeto. Ajuste o e-mail se precisar rodar para outra conta.
update public.profiles
   set role = 'admin'
 where email ilike 'dlrandrade@gmail.com';

do $$
declare virou_admin boolean;
begin
  select (role = 'admin') into virou_admin
  from public.profiles where email ilike 'dlrandrade@gmail.com';

  if virou_admin is null then
    raise notice 'Nenhuma conta com esse e-mail ainda. Cadastre-se no app primeiro, depois rode este UPDATE de novo.';
  elsif virou_admin then
    raise notice 'dlrandrade@gmail.com agora é admin.';
  else
    raise notice 'Ainda não é admin — algo mais está bloqueando. Avise.';
  end if;
end $$;
