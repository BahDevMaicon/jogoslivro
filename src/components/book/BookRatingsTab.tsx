import { useEffect, useState } from "react";
import { LogIn, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LibraryBookEntry } from "@/stores/libraryStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { useAuthStore } from "@/stores/authStore";
import { type BookRating, fetchBookRatings, fetchMyRating, upsertRating } from "@/engine/ratingEngine";
import { StarRating } from "./StarRating";
import { TextareaField } from "@/components/editor/fields";

interface BookRatingsTabProps {
  entry: LibraryBookEntry;
}

export function BookRatingsTab({ entry }: BookRatingsTabProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [ratings, setRatings] = useState<BookRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookId = entry.supabaseBookId;
  const currentUserId = currentUser?.id;

  /**
   * Dependência é `currentUserId` (primitivo), não `currentUser` (objeto) —
   * `authStore.onAuthStateChange` recria esse objeto a cada disparo (troca de
   * foco da aba, refresh de token), mesmo com os mesmos dados. Se o efeito
   * dependesse do objeto inteiro, cada disparo re-buscaria a avaliação salva
   * e sobrescreveria silenciosamente uma edição em andamento na tela.
   */
  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchBookRatings(bookId), currentUserId ? fetchMyRating(bookId, currentUserId) : Promise.resolve(null)]).then(
      ([list, mine]) => {
        if (cancelled) return;
        setRatings(list);
        if (mine) {
          setMyRating(mine.rating);
          setMyComment(mine.comment);
        }
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [bookId, currentUserId]);

  async function handleSave() {
    if (!bookId || !currentUser || myRating === 0) return;
    setSaving(true);
    setError(null);
    const result = await upsertRating(bookId, currentUser.id, myRating, myComment);
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? "Não foi possível salvar sua avaliação.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    const [list] = await Promise.all([fetchBookRatings(bookId), useLibraryStore.getState().loadLibrary()]);
    setRatings(list);
  }

  if (!bookId) {
    return <p className="text-sm text-parchment-300/70">Este livro ainda não está disponível para avaliação.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <StarRating value={entry.ratingAvg} count={entry.ratingCount} />
      </div>

      {currentUser ? (
        <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-4">
          <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-ember-400">
            {myRating > 0 ? "Sua avaliação" : "Avaliar este livro"}
          </h3>
          <StarRating value={myRating} interactive onChange={setMyRating} />
          <div className="mt-3">
            <TextareaField label="Comentário (opcional)" value={myComment} onChange={setMyComment} rows={2} />
          </div>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          <button type="button" className="btn-secondary mt-3" disabled={saving || myRating === 0} onClick={handleSave}>
            {saved ? "Salvo!" : "Salvar avaliação"}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-parchment-300/70">
          <span>Quer avaliar este livro?</span>
          <button type="button" className="btn-secondary" onClick={() => navigate(`/login?redirect=/book/${entry.book.id}`)}>
            <LogIn className="h-4 w-4" aria-hidden="true" /> Fazer login
          </button>
        </div>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-ember-400">
          <MessageSquare className="h-4 w-4" aria-hidden="true" /> Avaliações dos leitores
        </h3>
        {loading ? (
          <p className="text-sm text-parchment-400/70">Carregando...</p>
        ) : ratings.length === 0 ? (
          <p className="text-sm text-parchment-400/70">Nenhuma avaliação ainda — seja o primeiro a avaliar.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {ratings.map((r) => (
              <li key={r.id} className="rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-sm text-parchment-100">{r.displayName || "Leitor"}</span>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} size="sm" />
                    <span className="text-xs text-parchment-400/70">{new Date(r.updatedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-parchment-200/85">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
