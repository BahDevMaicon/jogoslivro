-- Tracking mínimo de navegação para o painel admin (Etapa 10): só path +
-- timestamp + usuário opcional, nada de IP/user-agent/geolocalização.
-- Usuários deslogados também geram linha (user_id null) — contam para
-- "total de acessos", mas não para "usuários ativos" (sem id de sessão
-- anônima, essa é uma limitação aceita).
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  path text not null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views (created_at);

alter table public.page_views enable row level security;

-- Qualquer um (logado ou não) pode registrar a própria navegação; só admin lê.
create policy "page_views: qualquer um registra" on public.page_views
  for insert with check (true);

create policy "page_views: admin lê" on public.page_views
  for select using (public.is_admin());

-- Lembrete da 0002: RLS restringe LINHAS, GRANT libera a TABELA — os dois juntos, sempre.
grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;
