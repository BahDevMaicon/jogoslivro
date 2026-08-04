import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Client do Supabase (backend real: Postgres + Auth + Row Level Security).
 * `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` vêm do painel do projeto em
 * supabase.com (Project Settings → API) — ver `.env.example`. A anon key é
 * segura para expor no frontend (é o que a Row Level Security protege);
 * nunca use a `service_role key` aqui.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
