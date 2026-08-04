-- Etapa 7: avaliações por estrelas + metadados para a página do livro em abas.
--
-- Lembrete da 0002 (não repetir o bug): RLS restringe LINHAS, mas não
-- concede acesso à tabela/view em si — isso é GRANT, à parte. Toda tabela e
-- view nova aqui recebe seu grant explícito.

-- ============================================================================
-- book_ratings: uma avaliação (1-5 estrelas + comentário opcional) por
-- usuário por livro — upsert por (book_id, user_id), nunca duplica linha.
-- ============================================================================
create table public.book_ratings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, user_id)
);

alter table public.book_ratings enable row level security;

create policy "book_ratings: leitura pública" on public.book_ratings
  for select using (true);

create policy "book_ratings: dono cria a própria avaliação" on public.book_ratings
  for insert with check (auth.uid() = user_id);

create policy "book_ratings: dono edita a própria avaliação" on public.book_ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "book_ratings: dono ou admin apaga" on public.book_ratings
  for delete using (auth.uid() = user_id or public.is_admin());

grant select on public.book_ratings to anon, authenticated;
grant insert, update, delete on public.book_ratings to authenticated;

create trigger set_updated_at before update on public.book_ratings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- books: tags (metadado de marketplace, editável no painel do dono) +
-- média/contagem de avaliações denormalizadas (evita agregar em toda leitura
-- do catálogo — a query da Biblioteca já traz a média pronta).
-- ============================================================================
alter table public.books
  add column tags text[] not null default '{}'::text[],
  add column rating_avg numeric(3, 2) not null default 0,
  add column rating_count integer not null default 0;

create or replace function public.refresh_book_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_book_id uuid;
  stats record;
begin
  affected_book_id := coalesce(new.book_id, old.book_id);

  select coalesce(avg(rating), 0)::numeric(3, 2) as avg_rating, count(*) as total
    into stats
    from public.book_ratings
    where book_id = affected_book_id;

  update public.books
    set rating_avg = stats.avg_rating, rating_count = stats.total
    where id = affected_book_id;

  return coalesce(new, old);
end;
$$;

create trigger book_ratings_refresh_stats
  after insert or update or delete on public.book_ratings
  for each row execute function public.refresh_book_rating_stats();

-- ============================================================================
-- public_profiles: subconjunto seguro de `profiles` (só id/display_name/
-- avatar_url) exposto publicamente para listas de avaliações (e, mais pra
-- frente, discussão). A política `profiles: dono ou admin lê` (Etapa 4)
-- continua protegendo o resto do perfil (email etc.) — a view roda com o
-- privilégio de quem criou a migration, contornando a RLS só para estes 2
-- campos inofensivos, exatamente como o próprio plano da Etapa 4 previu.
-- ============================================================================
create view public.public_profiles as
  select id, display_name, avatar_url from public.profiles;

grant select on public.public_profiles to anon, authenticated;
