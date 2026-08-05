-- Etapa 9: premium pago via Mercado Pago (Checkout Pro), pagamento único
-- com renovação manual — sem assinatura recorrente.
--
-- Lembrete da 0002: RLS restringe LINHAS, GRANT libera a tabela — os dois
-- juntos, sempre.

alter table public.profiles
  add column premium_until timestamptz;

-- ============================================================================
-- premium_purchases: um pedido por tentativa de pagamento. `role` de
-- `profiles` continua sendo a fonte única de autorização (nenhuma policy
-- existente muda) — `premium_until` é só o cronômetro que diz até quando
-- vale, mantido por esta tabela + a Edge Function do webhook.
-- ============================================================================
create table public.premium_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  amount numeric(10, 2) not null,
  currency text not null default 'BRL',
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'cancelled')),
  external_reference text not null unique,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  expires_at timestamptz
);

alter table public.premium_purchases enable row level security;

create policy "premium_purchases: dono ou admin lê" on public.premium_purchases
  for select using (auth.uid() = user_id or public.is_admin());

create policy "premium_purchases: dono cria seu pedido" on public.premium_purchases
  for insert with check (auth.uid() = user_id);

-- Sem policy de update para anon/authenticated de propósito — só a Edge
-- Function do webhook (via service_role, que ignora RLS) aprova um pedido.
-- Isso fecha a brecha de alguém aprovar a própria compra sem pagar.

grant select, insert on public.premium_purchases to authenticated;

create trigger set_updated_at before update on public.premium_purchases
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Rebaixamento automático de premium vencido. Roda de hora em hora; só
-- mexe em quem já está `premium` e passou de `premium_until` — admin nunca
-- é afetado (não satisfaz `role = 'premium'`).
-- ============================================================================
create extension if not exists pg_cron;

select cron.schedule(
  'downgrade-expired-premium',
  '0 * * * *',
  $$
    update public.profiles
      set role = 'normal'
      where role = 'premium' and premium_until < now();
  $$
);
