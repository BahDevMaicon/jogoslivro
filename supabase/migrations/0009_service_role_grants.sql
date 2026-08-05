-- Etapa 9, correção: a Edge Function do webhook usa a service_role key
-- (contorna RLS, mas RLS e GRANT são coisas separadas — mesmo lembrete da
-- 0002, agora pro service_role, que nunca tinha sido usado neste projeto
-- até o webhook do Mercado Pago).
grant select, update on public.premium_purchases to service_role;
grant select, update on public.profiles to service_role;
