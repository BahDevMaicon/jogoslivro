import { create } from "zustand";
import type { GameBook } from "@/types/story";
import { BOOK_REGISTRY } from "@/stories/registry";
import { loadBookFromData, loadBookFromUrl } from "@/engine/bookLoader";
import { hasSave } from "@/engine/saveEngine";
import { deleteBookFromSupabase, deleteUserBook, listUserBookIds, loadUserBook } from "@/engine/userBookStorage";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import type { BookStatus, BookVisibility } from "@/lib/bookStatus";

export interface LibraryBookEntry {
  book: GameBook;
  hasSave: boolean;
  /** true para livros adicionados/criados pelo usuário neste navegador (podem ser removidos/editados aqui). */
  isUserBook: boolean;
  /** uuid da linha em `books` no Supabase, quando o livro já está sincronizado com o backend (usado para gravar em `user_library`). */
  supabaseBookId?: string;
  /** `books.owner_id` — presente só para livros já sincronizados. Sem isso (livro local ainda não sincronizado), não dá pra confirmar posse real. */
  ownerId?: string;
  status: BookStatus;
  visibility: BookVisibility;
  /** Preço em reais e se é gratuito — colunas de `books`, não fazem parte do `story.json`. Sem UI de preço ainda, tudo fica `price: 0, isFree: true` por padrão. */
  price: number;
  isFree: boolean;
  /** Tags de marketplace — coluna de `books`, editável no painel do dono, sem relação com o `story.json`. */
  tags: string[];
  /** Média/contagem de `book_ratings`, denormalizadas em `books` por trigger (Etapa 7). */
  ratingAvg: number;
  ratingCount: number;
  publishedAt: string | null;
}

interface LibraryState {
  entries: LibraryBookEntry[];
  status: "idle" | "loading" | "ready" | "error";
  errors: string[];
  loadLibrary: () => Promise<void>;
  resetLibrary: () => void;
  refreshSaveStatus: () => void;
  getBook: (id: string) => GameBook | undefined;
  getEntry: (id: string) => LibraryBookEntry | undefined;
  removeUserBook: (id: string) => Promise<void>;
}

interface SupabaseBookRow {
  id: string;
  slug: string;
  owner_id: string | null;
  status: BookStatus;
  visibility: BookVisibility;
  price: number | null;
  is_free: boolean | null;
  content_data: unknown;
  tags: string[] | null;
  rating_avg: number | null;
  rating_count: number | null;
  published_at: string | null;
}

/**
 * Metadados reais (id/status/visibilidade/preço) dos livros do próprio
 * usuário no Supabase, indexados por slug — inclusive rascunhos privados,
 * que `loadSupabaseCatalog` nunca traz (só published+public). Sem isso, um
 * livro local já sincronizado nunca teria `supabaseBookId`, e o painel do
 * dono (publicar, preço, capa) nunca teria como saber que já dá pra usar.
 * Política `books: leitura pública se publicado, ou dono, ou admin` já cobre.
 */
async function loadOwnBooksMeta(userId: string): Promise<Map<string, SupabaseBookRow>> {
  const map = new Map<string, SupabaseBookRow>();
  if (!supabase) return map;
  const { data } = await supabase
    .from("books")
    .select("id, slug, owner_id, status, visibility, price, is_free, content_data, tags, rating_avg, rating_count, published_at")
    .eq("owner_id", userId);
  for (const row of (data ?? []) as SupabaseBookRow[]) {
    map.set(row.slug, row);
  }
  return map;
}

interface Catalog {
  entries: LibraryBookEntry[];
  errors: string[];
}

/** Catálogo público (livros `published`+`public`) vindo do Supabase — `content_data` já é o `GameBook` completo. */
async function loadSupabaseCatalog(): Promise<Catalog | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("books")
    .select("id, slug, owner_id, price, is_free, content_data, tags, rating_avg, rating_count, published_at")
    .eq("status", "published")
    .eq("visibility", "public");
  if (error) return null;

  const entries: LibraryBookEntry[] = [];
  const errors: string[] = [];
  for (const row of (data ?? []) as SupabaseBookRow[]) {
    const result = loadBookFromData(row.content_data);
    if (result.success && result.book) {
      entries.push({
        book: result.book,
        hasSave: hasSave(result.book.id),
        isUserBook: false,
        supabaseBookId: row.id,
        ownerId: row.owner_id ?? undefined,
        status: "published",
        visibility: "public",
        price: row.price ?? 0,
        isFree: row.is_free ?? true,
        tags: row.tags ?? [],
        ratingAvg: row.rating_avg ?? 0,
        ratingCount: row.rating_count ?? 0,
        publishedAt: row.published_at,
      });
    } else {
      errors.push(`Falha ao carregar "${row.slug}" do servidor: ${(result.errors ?? []).join("; ")}`);
    }
  }
  return { entries, errors };
}

/** Fallback 100% offline: os 3 livros de demonstração embutidos em `public/stories/*`, usado quando o Supabase está inacessível ou não configurado. */
async function loadStaticCatalog(): Promise<Catalog> {
  const staticResults = await Promise.all(BOOK_REGISTRY.map((entry) => loadBookFromUrl(entry.url)));
  const entries: LibraryBookEntry[] = [];
  const errors: string[] = [];
  staticResults.forEach((result, index) => {
    if (result.success && result.book) {
      entries.push({
        book: result.book,
        hasSave: hasSave(result.book.id),
        isUserBook: false,
        status: "published",
        visibility: "public",
        price: 0,
        isFree: true,
        tags: [],
        ratingAvg: 0,
        ratingCount: 0,
        publishedAt: null,
      });
    } else {
      errors.push(`Falha ao carregar "${BOOK_REGISTRY[index].id}": ${(result.errors ?? []).join("; ")}`);
    }
  });
  return { entries, errors };
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  entries: [],
  status: "idle",
  errors: [],

  loadLibrary: async () => {
    set({ status: "loading", errors: [] });

    // Checa a sessão direto no Supabase (promessa cacheada internamente, sem
    // corrida) em vez de ler `authStore.currentUser` — logo após um reload,
    // esse valor ainda pode não ter sido restaurado, o que faria a biblioteca
    // esconder os livros locais do próprio usuário por engano.
    const { data: sessionData } = isSupabaseConfigured && supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const session = sessionData.session;

    const remote = isSupabaseConfigured ? await loadSupabaseCatalog().catch(() => null) : null;
    const catalog = remote ?? (await loadStaticCatalog());

    let entries: LibraryBookEntry[] = [...catalog.entries];
    const errors: string[] = [...catalog.errors];

    // Deslogado (ou sem sessão): nada de gratuito/pago pago ainda existe de verdade, mas o filtro já
    // fica pronto para quando existir — e livros locais (IndexedDB, sempre rascunho/privado) somem
    // por completo, fechando o vazamento de rascunho para quem não está logado.
    if (!session) {
      entries = entries.filter((e) => e.isFree);
    } else {
      const ownMeta = await loadOwnBooksMeta(session.user.id);
      // Um livro do próprio usuário que já está publicado (`public`+`published`)
      // já veio do catálogo acima — sem isso, apareceria duplicado na grade.
      const catalogIds = new Set(entries.map((e) => e.book.id));
      const userIds = (await listUserBookIds()).filter((id) => !catalogIds.has(id));
      const userResults = await Promise.all(userIds.map((id) => loadUserBook(id)));
      userResults.forEach((result, index) => {
        if (result.success && result.book) {
          const meta = ownMeta.get(result.book!.id);
          entries.push({
            book: result.book!,
            hasSave: hasSave(result.book!.id),
            isUserBook: true,
            supabaseBookId: meta?.id,
            ownerId: meta?.owner_id ?? undefined,
            status: meta?.status ?? "draft",
            visibility: meta?.visibility ?? "private",
            price: meta?.price ?? 0,
            isFree: meta?.is_free ?? true,
            tags: meta?.tags ?? [],
            ratingAvg: meta?.rating_avg ?? 0,
            ratingCount: meta?.rating_count ?? 0,
            publishedAt: meta?.published_at ?? null,
          });
        } else {
          errors.push(
            `Falha ao carregar livro adicionado "${userIds[index]}": ${(result.errors ?? []).join("; ")}`
          );
        }
      });
    }

    set({ entries, errors, status: errors.length > 0 && entries.length === 0 ? "error" : "ready" });
  },

  resetLibrary: () => set({ entries: [], status: "idle", errors: [] }),

  refreshSaveStatus: () => {
    set((state) => ({
      entries: state.entries.map((e) => ({ ...e, hasSave: hasSave(e.book.id) })),
    }));
  },

  getBook: (id: string) => get().entries.find((e) => e.book.id === id)?.book,
  getEntry: (id: string) => get().entries.find((e) => e.book.id === id),

  removeUserBook: async (id: string) => {
    const entry = get().getEntry(id);
    await deleteUserBook(id);
    if (entry?.supabaseBookId) await deleteBookFromSupabase(entry.supabaseBookId);
    await get().loadLibrary();
  },
}));
