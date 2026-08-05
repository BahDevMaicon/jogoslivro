import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BarChart3,
  Heart,
  Info,
  Library,
  LogIn,
  MessageSquare,
  Play,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { hasSave } from "@/engine/saveEngine";
import { ensureFreeBookInLibrary } from "@/engine/userLibraryEngine";
import { useAuthStore } from "@/stores/authStore";
import { BookCover } from "@/components/book/BookCover";
import { BookDiscussionTab } from "@/components/book/BookDiscussionTab";
import { BookOwnerPanel } from "@/components/book/BookOwnerPanel";
import { BookRatingsTab } from "@/components/book/BookRatingsTab";
import { BookStatsTab } from "@/components/book/BookStatsTab";
import { ShareButtons } from "@/components/book/ShareButtons";
import { StarRating } from "@/components/book/StarRating";
import { SiteNav } from "@/components/layout/SiteNav";
import {
  canManageBook,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  VISIBILITY_BADGE_CLASS,
  VISIBILITY_LABEL,
} from "@/lib/bookStatus";

type DetailsTab = "info" | "avaliacoes" | "discussao" | "estatisticas" | "administracao";

const ALL_TABS: { id: DetailsTab; label: string; icon: LucideIcon }[] = [
  { id: "info", label: "Informações", icon: Info },
  { id: "avaliacoes", label: "Avaliações", icon: Star },
  { id: "discussao", label: "Discussão", icon: MessageSquare },
  { id: "estatisticas", label: "Estatísticas", icon: BarChart3 },
  { id: "administracao", label: "Administração", icon: Settings },
];

/**
 * Toda ação sobre um livro mora aqui — a Biblioteca (`LibraryPage.tsx`) é só
 * vitrine/descoberta. O que aparece varia por quem está olhando: visitante,
 * logado, dono do livro, admin. Capa/título/ações do leitor ficam sempre
 * visíveis acima das abas; o restante (descrição, avaliações, discussão,
 * estatísticas, administração) mora nas abas estilo fichário abaixo.
 */
export default function BookDetailsPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { entries, status, loadLibrary, getEntry } = useLibraryStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [addedToLibrary, setAddedToLibrary] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailsTab>("info");

  useEffect(() => {
    if (entries.length === 0 && status === "idle") loadLibrary();
  }, [entries.length, status, loadLibrary]);

  const entry = bookId ? getEntry(bookId) : undefined;
  const book = entry?.book;
  const canManage = entry ? canManageBook(entry, currentUser) : false;
  const canRead = Boolean(entry?.isFree || canManage);

  /**
   * Best-effort: se o livro já está sincronizado com o Supabase e o usuário
   * está logado, garante uma linha em `user_library` antes de navegar — sem
   * aguardar nem bloquear. Quem não está logado, ou cujo livro ainda não tem
   * `supabaseBookId`, continua lendo exatamente como hoje.
   */
  function goRead(path: string) {
    if (currentUser && entry?.supabaseBookId) {
      void ensureFreeBookInLibrary(currentUser.id, entry.supabaseBookId);
    }
    navigate(path);
  }

  async function handleAddToLibrary() {
    if (!currentUser || !entry?.supabaseBookId) return;
    await ensureFreeBookInLibrary(currentUser.id, entry.supabaseBookId);
    setAddedToLibrary(true);
  }

  function goToRatings() {
    setActiveTab("avaliacoes");
    document.getElementById("book-tabs")?.scrollIntoView({ behavior: "smooth" });
  }

  if (status === "loading" || (status === "idle" && !book)) {
    return <p className="p-10 text-center font-serif text-parchment-300">Carregando...</p>;
  }

  if (!book || !entry) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <SiteNav />
        <p className="font-serif text-parchment-200">Livro não encontrado.</p>
        <button className="btn-secondary mt-4" onClick={() => navigate("/biblioteca")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar à biblioteca
        </button>
      </div>
    );
  }

  const attributeLabels = [
    { key: "skill", label: "Habilidade" },
    { key: "stamina", label: "Energia" },
    { key: "luck", label: "Sorte" },
  ];

  const tabs = canManage ? ALL_TABS : ALL_TABS.filter((t) => t.id !== "administracao");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SiteNav />
      <button className="btn-secondary mb-6" onClick={() => navigate("/biblioteca")}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
      </button>

      <div className="parchment-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <BookCover
            title={book.title}
            imageUrl={book.cover || undefined}
            icon={<ScrollText className="h-8 w-8" aria-hidden="true" />}
            className="max-w-[160px]"
          />
          <div>
            <h1 className="font-display text-2xl text-parchment-50 sm:text-3xl">{book.title}</h1>
            <p className="mt-1 italic text-parchment-300/70">por {book.author}</p>
          </div>
          <StarRating value={entry.ratingAvg} count={entry.ratingCount} size="sm" />
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
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
          <ShareButtons title={book.title} url={`${window.location.origin}/book/${book.id}`} />
        </div>

        {/* Ações do leitor */}
        {canRead ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {hasSave(book.id) && (
              <button className="btn-secondary flex-1" onClick={() => goRead(`/book/${book.id}/play`)}>
                <Play className="h-4 w-4" aria-hidden="true" /> Continuar partida
              </button>
            )}
            <button className="btn-primary flex-1" onClick={() => goRead(`/book/${book.id}/create`)}>
              <Play className="h-4 w-4" aria-hidden="true" /> Nova aventura
            </button>
          </div>
        ) : (
          <div className="rounded-md border border-amber-700/40 bg-amber-950/20 p-4 text-center">
            <button className="btn-primary mx-auto" disabled>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Comprar
            </button>
            <p className="mt-2 text-xs text-amber-200/80">Fluxo de compra ainda não disponível.</p>
          </div>
        )}

        {/* Ações de quem está logado */}
        {currentUser ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {entry.isFree && (
              <button className="btn-secondary" onClick={handleAddToLibrary} disabled={addedToLibrary}>
                <Library className="h-4 w-4" aria-hidden="true" />
                {addedToLibrary ? "Adicionado!" : "Adicionar à biblioteca"}
              </button>
            )}
            <button className="btn-secondary" disabled title="Em breve">
              <Heart className="h-4 w-4" aria-hidden="true" /> Favoritar
            </button>
            <button className="btn-secondary" onClick={goToRatings}>
              <Star className="h-4 w-4" aria-hidden="true" /> Avaliar
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-parchment-300/70">
            <span>Quer favoritar, avaliar ou guardar na sua biblioteca?</span>
            <button className="btn-secondary" onClick={() => navigate(`/login?redirect=/book/${book.id}`)}>
              <LogIn className="h-4 w-4" aria-hidden="true" /> Fazer login
            </button>
          </div>
        )}
      </div>

      <nav id="book-tabs" className="mb-6 mt-6 flex flex-wrap gap-2 border-b border-parchment-700/30 pb-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              activeTab === id ? "bg-ember-600/20 text-ember-300" : "text-parchment-300 hover:bg-nightwood-800"
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </nav>

      <div className="parchment-card p-5 sm:p-6">
        {activeTab === "info" && (
          <div className="flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-parchment-200/90">{book.description}</p>

            {book.rulesText && (
              <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-4">
                <h2 className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-ember-400">
                  <Shield className="h-4 w-4" aria-hidden="true" /> Regras
                </h2>
                <p className="text-parchment-200/85">{book.rulesText}</p>
              </div>
            )}

            <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-4">
              <h2 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-ember-400">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Atributos utilizados
              </h2>
              <ul className="grid grid-cols-3 gap-3 text-center">
                {attributeLabels.map((attr) => (
                  <li key={attr.key} className="rounded-md border border-parchment-700/30 py-3">
                    <p className="font-display text-sm text-parchment-100">{attr.label}</p>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-parchment-400">Gênero</dt>
                <dd className="text-parchment-100">{book.genre || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-parchment-400">Classificação</dt>
                <dd className="text-parchment-100">{book.ageRating || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-parchment-400">Tempo médio</dt>
                <dd className="text-parchment-100">{book.estimatedDuration || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-parchment-400">Número de seções</dt>
                <dd className="text-parchment-100">{Object.keys(book.sections).length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-parchment-400">Publicado em</dt>
                <dd className="text-parchment-100">
                  {entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString("pt-BR") : "Ainda não publicado"}
                </dd>
              </div>
            </dl>

            {entry.tags.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-parchment-400">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-parchment-700/40 px-2 py-0.5 text-xs text-parchment-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "avaliacoes" && <BookRatingsTab entry={entry} />}

        {activeTab === "discussao" && <BookDiscussionTab entry={entry} canManage={canManage} />}

        {activeTab === "estatisticas" && <BookStatsTab entry={entry} />}

        {activeTab === "administracao" && canManage && (
          <BookOwnerPanel entry={entry} onDeleted={() => navigate("/biblioteca")} />
        )}
      </div>
    </div>
  );
}
