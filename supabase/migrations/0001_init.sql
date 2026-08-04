-- Livro-Jogo Engine: schema inicial do backend real (Supabase).
-- Cobre as 5 entidades do marketplace (profiles, author_profiles, books,
-- user_library, purchases) com Row Level Security aplicando permissão no
-- servidor, não só escondendo botão no frontend.
--
-- Como rodar: cole este arquivo inteiro no SQL Editor do painel do seu
-- projeto em supabase.com e execute (Run).

-- ============================================================================
-- profiles: 1:1 com auth.users
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  description text,
  biography text,
  city text,
  country text,
  social_links jsonb not null default '{}'::jsonb,
  role text not null default 'normal' check (role in ('admin', 'premium', 'normal')),
  status text not null default 'active' check (status in ('active', 'blocked', 'pending', 'deleted')),
  is_author boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.profiles enable row level security;

-- Helper: checa se o usuário autenticado atual é admin, sem recursão de RLS
-- (SECURITY DEFINER pula a RLS de `profiles` dentro da própria função).
-- Definida só agora porque `language sql` é validada contra o catálogo já
-- na criação — referenciar `profiles` antes dela existir falha.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: leitura pública" on public.profiles
  for select using (true);

create policy "profiles: dono edita seus próprios dados" on public.profiles
  for update using (auth.uid() = id) with check (
    auth.uid() = id
    -- role/status não mudam nesta política: mesmo valor antes/depois, a menos que seja admin.
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

create policy "profiles: admin edita qualquer perfil (inclui role/status)" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Cria a linha de profile automaticamente quando um usuário se cadastra no Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- author_profiles: perfil público de autor (opcional, 1:N nunca — 1:1 por enquanto)
-- ============================================================================
create table public.author_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  author_name text not null,
  avatar_url text,
  banner_url text,
  description text,
  biography text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.author_profiles enable row level security;

create policy "author_profiles: leitura pública" on public.author_profiles
  for select using (true);

create policy "author_profiles: dono cria o próprio (premium/admin)" on public.author_profiles
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('premium', 'admin'))
  );

create policy "author_profiles: dono edita o próprio" on public.author_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "author_profiles: admin edita qualquer um" on public.author_profiles
  for update using (public.is_admin()) with check (public.is_admin());

create policy "author_profiles: dono ou admin apaga" on public.author_profiles
  for delete using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- books: livros-jogo do marketplace (schema pronto; leitura/gravação de
-- conteúdo continua via IndexedDB nesta rodada — ver plano).
-- ============================================================================
create table public.books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  author_profile_id uuid references public.author_profiles (id) on delete set null,
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  cover_url text,
  genre text,
  age_rating text,
  price numeric(10, 2) not null default 0,
  is_free boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'published', 'rejected', 'unpublished', 'archived')),
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  content_data jsonb,
  estimated_sections integer,
  estimated_reading_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.books enable row level security;

create policy "books: leitura pública se publicado, ou dono, ou admin" on public.books
  for select using (
    (status = 'published' and visibility = 'public')
    or auth.uid() = owner_id
    or public.is_admin()
  );

create policy "books: premium/admin cria, dono do registro" on public.books
  for insert with check (
    auth.uid() = owner_id
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('premium', 'admin'))
  );

create policy "books: dono ou admin edita" on public.books
  for update using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

create policy "books: dono ou admin apaga" on public.books
  for delete using (auth.uid() = owner_id or public.is_admin());

-- ============================================================================
-- user_library: livros que cada usuário possui (comprados, gratuitos, etc.)
-- ============================================================================
create table public.user_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  acquisition_type text not null check (acquisition_type in ('purchase', 'free', 'admin', 'courtesy')),
  reading_status text not null default 'not_started' check (reading_status in ('not_started', 'in_progress', 'completed')),
  progress numeric(5, 2) not null default 0,
  current_section_id text,
  save_data jsonb,
  acquired_at timestamptz not null default now(),
  last_read_at timestamptz,
  completed_at timestamptz,
  unique (user_id, book_id)
);

alter table public.user_library enable row level security;

create policy "user_library: dono lê, admin lê tudo" on public.user_library
  for select using (auth.uid() = user_id or public.is_admin());

create policy "user_library: dono adiciona livro gratuito" on public.user_library
  for insert with check (
    auth.uid() = user_id
    and acquisition_type = 'free'
    and exists (select 1 from public.books where id = book_id and is_free = true)
  );

create policy "user_library: admin adiciona qualquer aquisição" on public.user_library
  for insert with check (public.is_admin());

create policy "user_library: dono atualiza progresso de leitura" on public.user_library
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_library: admin atualiza qualquer registro" on public.user_library
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- purchases: pedidos de compra. Modo de desenvolvimento — nenhum pagamento
-- real é processado; ver função `approve_purchase_dev_mode` abaixo.
-- ============================================================================
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  amount numeric(10, 2) not null,
  currency text not null default 'BRL',
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'cancelled', 'refunded')),
  payment_provider text,
  payment_method text,
  external_transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.purchases enable row level security;

create policy "purchases: comprador ou admin lê" on public.purchases
  for select using (auth.uid() = user_id or public.is_admin());

create policy "purchases: comprador cria pedido pendente" on public.purchases
  for insert with check (auth.uid() = user_id and status = 'pending');

create policy "purchases: admin atualiza (cancelamento/estorno manual)" on public.purchases
  for update using (public.is_admin()) with check (public.is_admin());

-- Aprova uma compra "em modo de desenvolvimento": marca como aprovada e
-- libera o livro na biblioteca do comprador. Substitui, por enquanto, o
-- webhook que um provedor de pagamento real (Stripe/MercadoPago/PagSeguro)
-- dispararia — nenhum pagamento de verdade acontece aqui. `security definer`
-- porque grava em duas tabelas de uma vez, fora do alcance normal do
-- comprador via RLS.
create or replace function public.approve_purchase_dev_mode(purchase_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
begin
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

-- ============================================================================
-- updated_at automático
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.author_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.books
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.purchases
  for each row execute function public.set_updated_at();
