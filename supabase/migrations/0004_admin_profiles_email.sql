-- Suporte ao painel admin: profiles precisa de email para o admin buscar/
-- identificar usuários (hoje só existe em auth.users, schema interno do
-- Supabase, inacessível via REST). Aproveita para apertar a política de
-- leitura pública de profiles, que exporia esse email a qualquer um.
--
-- Como rodar: npx supabase db push (projeto já linkado).

alter table public.profiles add column email text;

-- Backfill: migrations rodam com privilégio de dono do banco, conseguem ler
-- auth.users direto, sem precisar de service_role key.
update public.profiles p
  set email = u.email
  from auth.users u
  where u.id = p.id;

-- Cadastros futuros já vêm com email preenchido.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

-- Aperta a leitura pública: nada no app hoje depende de ler o perfil de
-- OUTRO usuário (confirmado) — só o próprio dono ou um admin. Evita expor
-- email (ou qualquer outro campo) a todo mundo agora que a coluna existe.
-- Uma futura página de autor público pode reabrir campos específicos via
-- uma view separada, sem precisar disso agora.
drop policy "profiles: leitura pública" on public.profiles;

create policy "profiles: dono ou admin lê" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
