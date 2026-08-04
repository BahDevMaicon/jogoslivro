-- Mensagens de suporte enviadas por usuários logados. Sem fila de
-- atendimento/status nesta rodada — só o registro em si; dono ou admin leem.
--
-- Lembrete da 0002: RLS restringe LINHAS, GRANT libera a tabela — os dois
-- juntos, sempre.
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

create policy "support_messages: autor envia" on public.support_messages
  for insert with check (auth.uid() = user_id);

create policy "support_messages: autor ou admin lê" on public.support_messages
  for select using (auth.uid() = user_id or public.is_admin());

grant select, insert on public.support_messages to authenticated;
