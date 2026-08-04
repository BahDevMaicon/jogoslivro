import { supabase } from "@/lib/supabaseClient";

export interface DiscussionComment {
  id: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  displayName: string | null;
  likeCount: number;
  likedByMe: boolean;
  reportedByMe: boolean;
  replies: DiscussionComment[];
}

interface CommentRow {
  id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
}

/**
 * Comentários do livro organizados em árvore de 1 nível (respostas não têm
 * respostas). Nome de quem comentou via `public_profiles` (mesmo padrão de
 * `ratingEngine.fetchBookRatings` — `profiles` em si não é mais legível
 * publicamente desde a Etapa 4). Curtidas/denúncia-própria resolvidas com
 * consultas separadas, aceitável para a lista de um único livro por vez (sem
 * N+1 entre livros, diferente da média de avaliação que aparece em cada
 * card da Biblioteca).
 */
export async function fetchComments(bookId: string, currentUserId?: string): Promise<DiscussionComment[]> {
  if (!supabase) return [];
  const { data: rows, error } = await supabase
    .from("book_comments")
    .select("id, user_id, parent_id, content, created_at")
    .eq("book_id", bookId)
    .order("created_at", { ascending: true });
  if (error || !rows || rows.length === 0) return [];

  const commentIds = rows.map((r) => r.id);
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));

  const [{ data: profiles }, { data: likes }, reportedRows] = await Promise.all([
    supabase.from("public_profiles").select("id, display_name").in("id", userIds),
    supabase.from("comment_likes").select("comment_id, user_id").in("comment_id", commentIds),
    currentUserId
      ? supabase.from("comment_reports").select("comment_id").in("comment_id", commentIds).eq("user_id", currentUserId)
      : Promise.resolve({ data: [] as { comment_id: string }[] }),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string | null]));
  const likeCountByComment = new Map<string, number>();
  const likedByMeSet = new Set<string>();
  for (const like of likes ?? []) {
    likeCountByComment.set(like.comment_id, (likeCountByComment.get(like.comment_id) ?? 0) + 1);
    if (like.user_id === currentUserId) likedByMeSet.add(like.comment_id);
  }
  const reportedSet = new Set((reportedRows.data ?? []).map((r) => r.comment_id));

  function toComment(row: CommentRow): DiscussionComment {
    return {
      id: row.id,
      userId: row.user_id,
      parentId: row.parent_id,
      content: row.content,
      createdAt: row.created_at,
      displayName: nameById.get(row.user_id) ?? null,
      likeCount: likeCountByComment.get(row.id) ?? 0,
      likedByMe: likedByMeSet.has(row.id),
      reportedByMe: reportedSet.has(row.id),
      replies: [],
    };
  }

  const topLevel: DiscussionComment[] = [];
  const byId = new Map<string, DiscussionComment>();
  for (const row of rows as CommentRow[]) {
    byId.set(row.id, toComment(row));
  }
  for (const row of rows as CommentRow[]) {
    const comment = byId.get(row.id)!;
    if (row.parent_id) {
      byId.get(row.parent_id)?.replies.push(comment);
    } else {
      topLevel.push(comment);
    }
  }
  return topLevel.reverse();
}

/** Contagem de denúncias por comentário — só chamada pela UI de quem gerencia o livro; a RLS já limita quem vê o quê. */
export async function fetchReportCounts(bookId: string): Promise<Map<string, number>> {
  if (!supabase) return new Map();
  const { data } = await supabase
    .from("comment_reports")
    .select("comment_id, book_comments!inner(book_id)")
    .eq("book_comments.book_id", bookId);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.comment_id, (counts.get(row.comment_id) ?? 0) + 1);
  }
  return counts;
}

export async function postComment(
  bookId: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: "Escreva algo antes de comentar." };
  const { error } = await supabase
    .from("book_comments")
    .insert({ book_id: bookId, user_id: userId, content: trimmed, parent_id: parentId ?? null });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleLike(commentId: string, userId: string, liked: boolean): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const { error } = liked
    ? await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId)
    : await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: userId });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function reportComment(commentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const { error } = await supabase.from("comment_reports").insert({ comment_id: commentId, user_id: userId });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Só exposta à UI de quem gerencia o livro (dono ou admin) — a política `book_comments: dono do livro ou admin apaga` já garante isso no servidor também. */
export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const { error } = await supabase.from("book_comments").delete().eq("id", commentId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
