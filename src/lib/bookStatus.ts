export type BookStatus = "draft" | "in_review" | "published" | "rejected" | "unpublished" | "archived";
export type BookVisibility = "public" | "private";

export const STATUS_LABEL: Record<BookStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  published: "Publicado",
  rejected: "Rejeitado",
  unpublished: "Despublicado",
  archived: "Arquivado",
};

export const STATUS_BADGE_CLASS: Record<BookStatus, string> = {
  draft: "border-parchment-700/40 text-parchment-300",
  in_review: "border-amber-700/40 text-amber-300",
  published: "border-moss-600/40 text-moss-400",
  rejected: "border-red-800/50 text-red-300",
  unpublished: "border-parchment-700/40 text-parchment-400/70",
  archived: "border-parchment-700/40 text-parchment-500/60",
};

export const VISIBILITY_LABEL: Record<BookVisibility, string> = {
  public: "Público",
  private: "Privado",
};

export const VISIBILITY_BADGE_CLASS: Record<BookVisibility, string> = {
  public: "border-moss-600/40 text-moss-400",
  private: "border-parchment-700/40 text-parchment-400/70",
};

/**
 * Se a pessoa logada pode editar/remover/gerenciar este livro na UI.
 * Usa `ownerId` de verdade quando o livro já está sincronizado com o
 * Supabase — inclusive livros já publicados (correção: antes disso só
 * liberava para `isUserBook`, que o catálogo público do Supabase nunca
 * marca, então o próprio dono perdia acesso ao publicar). Livros locais
 * ainda não sincronizados não guardam dono de verdade (IndexedDB não é
 * particionado por conta) — nesse caso libera para quem é premium/admin,
 * mesmo comportamento de sempre, declarado explicitamente. O RLS no servidor
 * é quem impõe posse de verdade em qualquer um dos dois casos.
 */
export function canManageBook(
  entry: { isUserBook: boolean; ownerId?: string },
  currentUser: { id: string; role: string } | null
): boolean {
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  if (entry.ownerId) return entry.ownerId === currentUser.id;
  return entry.isUserBook && currentUser.role === "premium";
}
