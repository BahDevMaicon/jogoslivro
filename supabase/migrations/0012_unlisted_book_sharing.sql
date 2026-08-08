-- ============================================================================
-- Compartilhamento por link sem entrar na biblioteca oficial: novo estado de
-- visibilidade 'unlisted' — livro publicado, mas fora do catálogo público
-- (loadSupabaseCatalog filtra visibility='public', então 'unlisted' já fica
-- de fora sem mudança nenhuma ali). Quem tem o link consegue abrir mesmo
-- deslogado, porque a policy de leitura passa a aceitar também esse estado.
-- ============================================================================

alter table public.books drop constraint if exists books_visibility_check;
alter table public.books add constraint books_visibility_check
  check (visibility in ('public', 'private', 'unlisted'));

drop policy if exists "books: leitura pública se publicado, ou dono, ou admin" on public.books;

create policy "books: leitura pública/não-listada se publicado, ou dono, ou admin" on public.books
  for select using (
    (status = 'published' and visibility in ('public', 'unlisted'))
    or auth.uid() = owner_id
    or public.is_admin()
  );
