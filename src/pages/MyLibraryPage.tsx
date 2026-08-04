import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LibraryBig, ScrollText } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";
import { BookCover } from "@/components/book/BookCover";

interface LibraryRow {
  book_id: string;
  reading_status: "not_started" | "in_progress" | "completed";
  progress: number;
  books: { slug: string; title: string; cover_url: string | null } | null;
}

const STATUS_LABEL: Record<LibraryRow["reading_status"], string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído",
};

export default function MyLibraryPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [rows, setRows] = useState<LibraryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !supabase) return;
    supabase
      .from("user_library")
      .select("book_id, reading_status, progress, books(slug, title, cover_url)")
      .eq("user_id", currentUser.id)
      .order("last_read_at", { ascending: false, nullsFirst: false })
      .order("acquired_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError("Não foi possível carregar sua biblioteca.");
          return;
        }
        setRows((data ?? []) as unknown as LibraryRow[]);
      });
  }, [currentUser]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SiteNav />
      <header className="mb-8 flex items-center gap-3">
        <LibraryBig className="h-6 w-6 text-ember-400" aria-hidden="true" />
        <div>
          <h1 className="font-display text-2xl text-parchment-50 sm:text-3xl">Minha biblioteca</h1>
          <p className="mt-1 font-serif text-sm text-parchment-300/70">Livros que você já começou a ler.</p>
        </div>
      </header>

      {rows === null && !error && <p className="font-serif text-parchment-300">Carregando...</p>}

      {error && <div className="parchment-card p-6 text-center font-serif text-red-300">{error}</div>}

      {rows !== null && rows.length === 0 && (
        <div className="parchment-card p-8 text-center font-serif text-parchment-300/80">
          Você ainda não começou nenhuma leitura. Escolha um livro na{" "}
          <Link to="/biblioteca" className="text-ember-400 underline">
            Biblioteca
          </Link>{" "}
          para começar.
        </div>
      )}

      {rows !== null && rows.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
          {rows
            .filter((row) => row.books)
            .map((row) => (
              <Link
                key={row.book_id}
                to={`/book/${row.books!.slug}`}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="w-full max-w-[160px]">
                  <BookCover
                    title={row.books!.title}
                    imageUrl={row.books!.cover_url ?? undefined}
                    icon={<ScrollText className="h-8 w-8" aria-hidden="true" />}
                  />
                </div>
                <h2 className="font-display text-sm text-parchment-50">{row.books!.title}</h2>
                <span className="rounded-full border border-parchment-700/40 px-2 py-1 text-xs text-parchment-300/70">
                  {STATUS_LABEL[row.reading_status] ?? row.reading_status}
                </span>
                <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-nightwood-800">
                  <div
                    className="h-full bg-ember-500"
                    style={{ width: `${Math.min(100, Math.round(row.progress))}%` }}
                  />
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
