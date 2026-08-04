import { supabase } from "@/lib/supabaseClient";

export interface BookRating {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  displayName: string | null;
}

/**
 * Avaliações de um livro, com o nome de quem avaliou resolvido via
 * `public_profiles` (a view segura criada na Etapa 7 — `profiles` em si não
 * é mais legível publicamente desde a Etapa 4). Duas consultas porque não há
 * FK de `book_ratings` para a view (PostgREST só faz embed automático contra
 * a tabela referenciada de verdade, `profiles`).
 */
export async function fetchBookRatings(bookId: string): Promise<BookRating[]> {
  if (!supabase) return [];
  const { data: ratings, error } = await supabase
    .from("book_ratings")
    .select("id, user_id, rating, comment, created_at, updated_at")
    .eq("book_id", bookId)
    .order("updated_at", { ascending: false });
  if (error || !ratings || ratings.length === 0) return [];

  const userIds = Array.from(new Set(ratings.map((r) => r.user_id)));
  const { data: profiles } = await supabase.from("public_profiles").select("id, display_name").in("id", userIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string | null]));

  return ratings.map((r) => ({
    id: r.id,
    userId: r.user_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    displayName: nameById.get(r.user_id) ?? null,
  }));
}

export async function fetchMyRating(bookId: string, userId: string): Promise<{ rating: number; comment: string } | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("book_ratings")
    .select("rating, comment")
    .eq("book_id", bookId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return { rating: data.rating, comment: data.comment ?? "" };
}

/** Upsert por `(book_id, user_id)` — cria a avaliação na primeira vez, atualiza nas seguintes, nunca duplica. */
export async function upsertRating(
  bookId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const { error } = await supabase
    .from("book_ratings")
    .upsert({ book_id: bookId, user_id: userId, rating, comment: comment.trim() || null }, { onConflict: "book_id,user_id" });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
