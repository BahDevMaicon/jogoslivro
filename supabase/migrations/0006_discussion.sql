-- Etapa 8: discussão do livro — comentários (1 nível de respostas), curtidas
-- e denúncia de conteúdo inadequado.
--
-- Lembrete da 0002 (não repetir o bug): RLS restringe LINHAS, mas não
-- concede acesso à tabela em si — isso é GRANT, à parte. Toda tabela nova
-- aqui recebe seu grant explícito.

-- ============================================================================
-- book_comments: comentários públicos do livro. `parent_id` nulo = comentário
-- de nível superior; não-nulo = resposta a ele (só 1 nível, sem resposta de
-- resposta nesta rodada). Sem policy de update — sem edição de comentário.
-- ============================================================================
create table public.book_comments (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.book_comments (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.book_comments enable row level security;

create policy "book_comments: leitura pública" on public.book_comments
  for select using (true);

create policy "book_comments: autor comenta" on public.book_comments
  for insert with check (auth.uid() = user_id);

create policy "book_comments: dono do livro ou admin apaga" on public.book_comments
  for delete using (
    public.is_admin()
    or exists (select 1 from public.books b where b.id = book_comments.book_id and b.owner_id = auth.uid())
  );

grant select on public.book_comments to anon, authenticated;
grant insert, delete on public.book_comments to authenticated;

create trigger set_updated_at before update on public.book_comments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- comment_likes: curtida por usuário por comentário.
-- ============================================================================
create table public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.book_comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

create policy "comment_likes: leitura pública" on public.comment_likes
  for select using (true);

create policy "comment_likes: autor curte" on public.comment_likes
  for insert with check (auth.uid() = user_id);

create policy "comment_likes: autor descurte" on public.comment_likes
  for delete using (auth.uid() = user_id);

grant select on public.comment_likes to anon, authenticated;
grant insert, delete on public.comment_likes to authenticated;

-- ============================================================================
-- comment_reports: denúncia por usuário por comentário — um report por
-- usuário. Leitura restrita: quem denunciou, dono do livro, ou admin (nunca
-- pública — é um sinal de moderação, não conteúdo).
-- ============================================================================
create table public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.book_comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

alter table public.comment_reports enable row level security;

create policy "comment_reports: reporter, dono do livro ou admin lê" on public.comment_reports
  for select using (
    auth.uid() = user_id
    or public.is_admin()
    or exists (
      select 1 from public.book_comments c join public.books b on b.id = c.book_id
      where c.id = comment_reports.comment_id and b.owner_id = auth.uid()
    )
  );

create policy "comment_reports: autor denuncia" on public.comment_reports
  for insert with check (auth.uid() = user_id);

grant select on public.comment_reports to anon, authenticated;
grant insert on public.comment_reports to authenticated;
