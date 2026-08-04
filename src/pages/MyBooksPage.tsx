import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, PenSquare, ScrollText } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useLibraryStore } from "@/stores/libraryStore";
import { useAuthStore } from "@/stores/authStore";
import { BookCover } from "@/components/book/BookCover";
import { accentForBookId } from "@/components/book/bookAccents";
import { STATUS_LABEL, STATUS_BADGE_CLASS, VISIBILITY_LABEL, VISIBILITY_BADGE_CLASS, canManageBook } from "@/lib/bookStatus";

/**
 * Lista os livros que o usuário logado criou/importou e pode gerenciar
 * (`canManageBook`) — livros locais (IndexedDB) ainda não sincronizados não
 * guardam dono de verdade, então ficam liberados para quem é premium/admin
 * neste navegador; livros já sincronizados usam `owner_id` real.
 */
export default function MyBooksPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { entries, status, loadLibrary } = useLibraryStore();

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const myBooks = entries.filter((e) => canManageBook(e, currentUser));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SiteNav />

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-parchment-50 sm:text-3xl">Meus livros</h1>
          <p className="mt-1 font-serif text-sm text-parchment-300/70">Livros que você criou ou importou.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => navigate("/create-book")}>
          <PenSquare className="h-4 w-4" aria-hidden="true" /> Criar livro
        </button>
      </header>

      {status === "loading" && <p className="font-serif text-parchment-300">Carregando...</p>}

      {status !== "loading" && myBooks.length === 0 && (
        <div className="parchment-card p-8 text-center font-serif text-parchment-300/80">
          Você ainda não criou nem importou nenhum livro.
        </div>
      )}

      {myBooks.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
          {myBooks.map(({ book, status: bookStatus, visibility }) => (
            <div key={book.id} className="flex flex-col items-center gap-3 text-center">
              <button
                className="book-tilt block w-full max-w-[160px]"
                onClick={() => navigate(`/book/${book.id}`)}
                aria-label={`Ver detalhes de ${book.title}`}
              >
                <BookCover
                  title={book.title}
                  accent={accentForBookId(book.id)}
                  icon={<ScrollText className="h-8 w-8" aria-hidden="true" />}
                  imageUrl={book.cover || undefined}
                />
              </button>
              <h2 className="font-display text-sm text-parchment-50">{book.title}</h2>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <span className={`rounded-full border px-2 py-0.5 ${STATUS_BADGE_CLASS[bookStatus]}`}>
                  {STATUS_LABEL[bookStatus]}
                </span>
                <span className={`rounded-full border px-2 py-0.5 ${VISIBILITY_BADGE_CLASS[visibility]}`}>
                  {VISIBILITY_LABEL[visibility]}
                </span>
              </div>
              <button className="btn-secondary" onClick={() => navigate(`/edit-book/${book.id}`)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
