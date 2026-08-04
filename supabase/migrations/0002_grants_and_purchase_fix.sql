-- Correções sobre 0001_init.sql:
--
-- 1) RLS restringe QUAIS linhas uma role vê, mas não concede acesso à tabela
--    em si — isso é um GRANT à parte, no nível do Postgres. 0001 esqueceu
--    esses GRANTs, então mesmo com a policy de leitura pública em `profiles`
--    (`using (true)`), a role `anon`/`authenticated` levava
--    "permission denied for table profiles" antes de a RLS sequer ser
--    avaliada. Este arquivo concede exatamente os privilégios que as
--    políticas de 0001 pressupõem.
--
-- 2) `approve_purchase_dev_mode` não checava se quem chamava era admin —
--    qualquer usuário autenticado com EXECUTE na função podia aprovar
--    QUALQUER compra pendente (inclusive de outra pessoa) e ganhar o livro
--    de graça. Corrigido para exigir `is_admin()`.
--
-- Como rodar: cole este arquivo no SQL Editor do Supabase e execute (Run) —
-- depois de já ter rodado 0001_init.sql.

grant usage on schema public to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

grant select on public.author_profiles to anon, authenticated;
grant insert, update, delete on public.author_profiles to authenticated;

grant select on public.books to anon, authenticated;
grant insert, update, delete on public.books to authenticated;

grant select, insert, update on public.user_library to authenticated;

grant select, insert on public.purchases to authenticated;

revoke execute on function public.approve_purchase_dev_mode(uuid) from public;
grant execute on function public.approve_purchase_dev_mode(uuid) to authenticated;

create or replace function public.approve_purchase_dev_mode(purchase_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem aprovar compras.';
  end if;

  select * into p from public.purchases where id = purchase_id;

  if p is null then
    raise exception 'Compra não encontrada.';
  end if;

  if p.status <> 'pending' then
    raise exception 'Compra já processada.';
  end if;

  update public.purchases
    set status = 'approved', approved_at = now(), updated_at = now()
    where id = purchase_id;

  insert into public.user_library (user_id, book_id, acquisition_type)
    values (p.user_id, p.book_id, 'purchase')
    on conflict (user_id, book_id) do nothing;
end;
$$;
