import { supabase } from "@/lib/supabaseClient";

/**
 * Registra uma navegação em `page_views`. Best-effort: nunca lança, chamada
 * como fire-and-forget a cada troca de rota — nunca deve atrasar/bloquear a
 * navegação real do usuário.
 */
export async function logPageView(path: string, userId?: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("page_views").insert({ path, user_id: userId ?? null });
  } catch {
    // silencioso — analytics nunca deve atrapalhar o uso do app.
  }
}
