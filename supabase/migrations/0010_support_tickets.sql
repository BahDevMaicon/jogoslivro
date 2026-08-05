-- Suporte vira sistema de tickets: categoria, status e resposta do admin
-- na mesma tabela `support_messages` já criada na 0007 — mesma entidade,
-- só ganhando o que faltava pra virar um chamado acompanhável.
alter table public.support_messages
  add column category text not null default 'outro' check (category in ('livro', 'bug', 'reembolso', 'duvida', 'outro')),
  add column status text not null default 'sent' check (status in ('sent', 'in_review', 'answered')),
  add column admin_response text,
  add column responded_at timestamptz,
  add column updated_at timestamptz not null default now();

-- Autor não pode editar o próprio chamado depois de enviado (não foi
-- pedido) — só admin atualiza status/resposta. Lembrete da 0002: RLS
-- restringe LINHAS, GRANT libera a tabela — os dois juntos, sempre.
create policy "support_messages: admin atualiza status/resposta" on public.support_messages
  for update using (public.is_admin()) with check (public.is_admin());

grant update on public.support_messages to authenticated;

create trigger set_updated_at before update on public.support_messages
  for each row execute function public.set_updated_at();
