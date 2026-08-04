import { supabase } from "@/lib/supabaseClient";
import type { GameSave } from "@/types/game";

/**
 * Garante que um livro gratuito esteja na biblioteca pessoal do usuário
 * (`user_library`). Best-effort: nunca lança, chamada como fire-and-forget a
 * partir da UI de leitura — nunca deve atrasar/bloquear a navegação. A
 * política de RLS (`user_library: dono adiciona livro gratuito`) já garante
 * que só livros com `is_free=true` podem ser adicionados desta forma; uma
 * segunda tentativa para o mesmo livro simplesmente esbarra na violação de
 * `unique(user_id, book_id)` e é ignorada.
 */
export async function ensureFreeBookInLibrary(userId: string, supabaseBookId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase
      .from("user_library")
      .insert({ user_id: userId, book_id: supabaseBookId, acquisition_type: "free" });
  } catch {
    // silencioso — biblioteca pessoal é um espelho, nunca deve atrapalhar a leitura.
  }
}

export interface ReadingProgressPatch {
  readingStatus: "not_started" | "in_progress" | "completed";
  progress: number;
  currentSectionId: string;
  saveData: GameSave;
  completedAt?: string;
}

/**
 * Espelha status/progresso de leitura em `user_library`. Tenta `UPDATE`
 * primeiro (para não sobrescrever `acquisition_type` de uma linha existente
 * — ex. uma compra — de volta para `'free'`); só faz `INSERT` como
 * `acquisition_type='free'` quando nenhuma linha existia ainda (caso de
 * início de jogo antes do `ensureFreeBookInLibrary` do clique inicial
 * terminar). Best-effort, mesmo padrão de `ensureFreeBookInLibrary`.
 */
export async function syncReadingProgress(
  userId: string,
  supabaseBookId: string,
  patch: ReadingProgressPatch
): Promise<void> {
  if (!supabase) return;
  try {
    const fields = {
      reading_status: patch.readingStatus,
      progress: patch.progress,
      current_section_id: patch.currentSectionId,
      save_data: patch.saveData,
      last_read_at: new Date().toISOString(),
      ...(patch.completedAt ? { completed_at: patch.completedAt } : {}),
    };

    const { data, error } = await supabase
      .from("user_library")
      .update(fields)
      .eq("user_id", userId)
      .eq("book_id", supabaseBookId)
      .select("id");

    if (!error && (!data || data.length === 0)) {
      await supabase
        .from("user_library")
        .insert({ user_id: userId, book_id: supabaseBookId, acquisition_type: "free", ...fields });
    }
  } catch {
    // silencioso — best-effort, nunca deve atrapalhar a leitura local.
  }
}
