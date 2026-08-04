import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, PenSquare, ScrollText, Sparkles } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { BookCover } from "@/components/book/BookCover";
import { accentForBookId } from "@/components/book/bookAccents";
import { AddBookButton } from "@/components/book/AddBookButton";
import { SiteNav } from "@/components/layout/SiteNav";
import { TextField, SelectField } from "@/components/editor/fields";
import { normalize } from "@/lib/text";
import { canManageBook, STATUS_BADGE_CLASS, STATUS_LABEL, VISIBILITY_BADGE_CLASS, VISIBILITY_LABEL } from "@/lib/bookStatus";
import { useAuthStore } from "@/stores/authStore";
import { StarRating } from "@/components/book/StarRating";

type PricingFilter = "all" | "free" | "paid";
type SortOption = "title-asc" | "title-desc" | "price-asc";

/**
 * Só descoberta e navegação — nenhum botão de ação por livro aqui (Ler,
 * Continuar, Editar, Excluir, Publicar, etc. moraram todos para
 * `BookDetailsPage.tsx`). O card inteiro é clicável.
 */
export default function LibraryPage() {
  const { entries, status, errors, loadLibrary } = useLibraryStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const canCreateBooks = currentUser?.role === "premium" || currentUser?.role === "admin";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [pricingFilter, setPricingFilter] = useState<PricingFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("title-asc");

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const genres = useMemo(
    () =>
      Array.from(new Set(entries.map((e) => e.book.genre).filter((g): g is string => Boolean(g)))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const query = normalize(search.trim());
    const filtered = entries.filter((e) => {
      if (query && !normalize(e.book.title).includes(query) && !normalize(e.book.author).includes(query)) {
        return false;
      }
      if (genreFilter !== "all" && e.book.genre !== genreFilter) return false;
      if (pricingFilter === "free" && !e.isFree) return false;
      if (pricingFilter === "paid" && e.isFree) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "title-asc") return a.book.title.localeCompare(b.book.title, "pt-BR");
      if (sortBy === "title-desc") return b.book.title.localeCompare(a.book.title, "pt-BR");
      return a.price - b.price;
    });
  }, [entries, search, genreFilter, pricingFilter, sortBy]);

  const filtersActive = search.trim() !== "" || genreFilter !== "all" || pricingFilter !== "all";

  function clearFilters() {
    setSearch("");
    setGenreFilter("all");
    setPricingFilter("all");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SiteNav />
      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-ember-400">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="font-display text-xs uppercase tracking-[0.3em]">Engine de Gamebooks</span>
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl text-parchment-50 sm:text-4xl">Biblioteca LivroQuest</h1>
        <p className="mx-auto mt-3 max-w-xl font-serif text-lg text-parchment-200/80">
          Escolha uma aventura para começar. Suas escolhas moldarão o destino da história.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <AddBookButton onAdded={loadLibrary} />
          {canCreateBooks && (
            <button type="button" className="btn-secondary" onClick={() => navigate("/create-book")}>
              <PenSquare className="h-4 w-4" aria-hidden="true" /> Criar novo livro
            </button>
          )}
        </div>
      </header>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 py-16 text-parchment-300">
          <BookOpen className="h-8 w-8 animate-pulse" aria-hidden="true" />
          <p className="font-serif">Carregando a biblioteca...</p>
        </div>
      )}

      {status === "error" && (
        <div className="mx-auto max-w-lg rounded-md border border-red-800/50 bg-red-950/30 p-4 text-center font-serif text-red-200">
          <p>Não foi possível carregar nenhum livro-jogo.</p>
          <ul className="mt-2 text-sm text-red-300/80">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="mb-6 rounded-lg border border-parchment-800/30 bg-nightwood-900/40 p-3">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              <div className="col-span-2">
                <TextField compact label="Buscar" value={search} onChange={setSearch} placeholder="Título ou autor..." />
              </div>
              <SelectField
                compact
                label="Gênero"
                value={genreFilter}
                onChange={setGenreFilter}
                options={[{ value: "all", label: "Todos os gêneros" }, ...genres.map((g) => ({ value: g, label: g }))]}
              />
              <SelectField
                compact
                label="Preço"
                value={pricingFilter}
                onChange={(v) => setPricingFilter(v as PricingFilter)}
                options={[
                  { value: "all", label: "Todos" },
                  { value: "free", label: "Gratuitos" },
                  { value: "paid", label: "Pagos" },
                ]}
              />
              <SelectField
                compact
                label="Ordenar por"
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={[
                  { value: "title-asc", label: "Título (A-Z)" },
                  { value: "title-desc", label: "Título (Z-A)" },
                  { value: "price-asc", label: "Preço (menor)" },
                ]}
              />
            </div>
            {filtersActive && (
              <button
                type="button"
                className="mt-2.5 text-xs text-parchment-400 underline hover:text-ember-400"
                onClick={clearFilters}
              >
                Limpar filtros
              </button>
            )}
          </div>

          {filteredEntries.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-8 text-center font-serif text-parchment-300">
              <p>Nenhum livro encontrado com esses filtros.</p>
              <button type="button" className="btn-secondary mt-4" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-parchment-800/30 bg-gradient-to-b from-nightwood-800/50 via-nightwood-900/40 to-nightwood-950/60 p-4 shadow-inner sm:p-8">
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
                {filteredEntries.map((entry, index) => {
                  const { book } = entry;
                  const canManage = canManageBook(entry, currentUser);
                  return (
                    <motion.article
                      key={book.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.35 }}
                    >
                      <button
                        className="book-tilt flex w-full flex-col gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember-400"
                        onClick={() => navigate(`/book/${book.id}`)}
                        aria-label={`Ver detalhes de ${book.title}`}
                      >
                        <div className="mx-auto w-full max-w-[180px]">
                          <BookCover
                            title={book.title}
                            accent={accentForBookId(book.id)}
                            icon={<ScrollText className="h-8 w-8" aria-hidden="true" />}
                            imageUrl={book.cover || undefined}
                          />
                        </div>
                        <div className="text-center">
                          <h2 className="font-display text-lg text-parchment-50">{book.title}</h2>
                          {book.description && (
                            <p className="mt-1 line-clamp-3 font-serif text-sm text-parchment-300/75">
                              {book.description}
                            </p>
                          )}
                          <div className="mt-1.5 flex justify-center">
                            <StarRating value={entry.ratingAvg} count={entry.ratingCount} size="sm" />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                            <span
                              className={`rounded-full border px-2 py-0.5 ${
                                entry.isFree ? "border-moss-600/40 text-moss-400" : "border-amber-700/40 text-amber-300"
                              }`}
                            >
                              {entry.isFree ? "Gratuito" : "Pago"}
                            </span>
                            {canManage && (
                              <>
                                <span className={`rounded-full border px-2 py-0.5 ${STATUS_BADGE_CLASS[entry.status]}`}>
                                  {STATUS_LABEL[entry.status]}
                                </span>
                                <span className={`rounded-full border px-2 py-0.5 ${VISIBILITY_BADGE_CLASS[entry.visibility]}`}>
                                  {VISIBILITY_LABEL[entry.visibility]}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
