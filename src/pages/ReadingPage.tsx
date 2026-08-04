import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, Moon, ScrollText, ShieldQuestion, Utensils } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import { getSection } from "@/engine/storyEngine";
import { CombatScene } from "@/components/combat/CombatScene";
import { TestPanel } from "@/components/dice/TestPanel";
import { BinderSheet, type BinderTab } from "@/components/layout/BinderSheet";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { InventoryPanel } from "@/components/inventory/InventoryPanel";
import { CharacterSheetPanel } from "@/components/character/CharacterSheetPanel";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { SettingsRibbon } from "@/components/settings/SettingsRibbon";
import { Book } from "@/components/book/Book";
import { BookHeader } from "@/components/book/BookHeader";
import { BookPage } from "@/components/book/BookPage";
import { BookChoice } from "@/components/book/BookChoice";
import { RulesScreen } from "@/components/book/RulesScreen";
import { FloatingNotification } from "@/components/notifications/FloatingNotification";
import { AutosaveIndicator } from "@/components/notifications/AutosaveIndicator";
import { CenterAlert } from "@/components/notifications/CenterAlert";
import { useSettingsStore } from "@/stores/settingsStore";

const FONT_SIZE_CLASS: Record<string, string> = {
  small: "text-base",
  medium: "text-lg",
  large: "text-xl",
  xlarge: "text-2xl",
};

const SPACING_CLASS: Record<string, string> = {
  compact: "leading-normal space-y-2",
  normal: "leading-relaxed space-y-4",
  relaxed: "leading-loose space-y-6",
};

const FONT_FAMILY_CLASS: Record<string, string> = {
  garamond: "font-book-garamond",
  ebGaramond: "font-book-eb",
  baskerville: "font-book-baskerville",
};

type ModalKind = "inventory" | "sheet" | "history" | "rules" | "settings" | null;

const BINDER_TABS: ModalKind[] = ["inventory", "sheet", "history", "rules"];

export default function ReadingPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getBook, entries, status, loadLibrary } = useLibraryStore();
  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const book = useGameSessionStore((s) => s.book);
  const character = useGameSessionStore((s) => s.character);
  const currentSectionId = useGameSessionStore((s) => s.currentSectionId);
  const combat = useGameSessionStore((s) => s.combat);
  const pendingTest = useGameSessionStore((s) => s.pendingTest);
  const isFinished = useGameSessionStore((s) => s.isFinished);
  const ending = useGameSessionStore((s) => s.ending);
  const selectChoice = useGameSessionStore((s) => s.selectChoice);
  const isChoiceEnabled = useGameSessionStore((s) => s.isChoiceEnabled);
  const getLockReason = useGameSessionStore((s) => s.getLockReason);
  const continueGame = useGameSessionStore((s) => s.continueGame);
  const restartGame = useGameSessionStore((s) => s.restartGame);
  const exitGame = useGameSessionStore((s) => s.exitGame);
  const rulesAcknowledged = useGameSessionStore((s) => s.rulesAcknowledged);
  const acknowledgeRules = useGameSessionStore((s) => s.acknowledgeRules);
  const restAtSection = useGameSessionStore((s) => s.restAtSection);
  const eatAtSection = useGameSessionStore((s) => s.eatAtSection);
  const visitedSections = useGameSessionStore((s) => s.visitedSections);
  const previousSectionId = useGameSessionStore((s) => s.previousSectionId);
  const goBackToPreviousSection = useGameSessionStore((s) => s.goBackToPreviousSection);

  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    if (entries.length === 0 && status === "idle") loadLibrary();
  }, [entries.length, status, loadLibrary]);

  const libraryBook = bookId ? getBook(bookId) : undefined;

  // Se a sessão de jogo não tem um livro carregado (ex.: o usuário navegou
  // diretamente para /play, ou recarregou a página), tenta continuar a
  // partida salva a partir do localStorage.
  useEffect(() => {
    if (!libraryBook) return;
    if (book?.id === libraryBook.id) return;
    const restored = continueGame(libraryBook);
    if (!restored) {
      navigate(`/book/${libraryBook.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryBook, book?.id]);

  if (!libraryBook || !book || !character || !currentSectionId) {
    return <p className="p-10 text-center font-serif text-parchment-300">Carregando aventura...</p>;
  }

  if (isFinished && ending) {
    return <EndingScreen title={ending.title} text={ending.text} type={ending.type} onExit={() => {
      exitGame();
      navigate("/biblioteca");
    }} onRestart={() => {
      restartGame();
      navigate(`/book/${book.id}/create`);
    }} />;
  }

  const section = getSection(book, currentSectionId);
  const isCombatActive = Boolean(combat?.isActive);
  const isTestPending = Boolean(pendingTest);
  const showRules = !rulesAcknowledged;
  const allChoicesLocked = section.choices.length > 0 && section.choices.every((c) => !isChoiceEnabled(c.id));

  return (
    <>
      <FloatingNotification />
      <AutosaveIndicator />
      <CenterAlert />

      <Book
        header={
          <BookHeader
            character={character}
            onLeave={() => setConfirmLeaveOpen(true)}
            onOpenInventory={() => setOpenModal("inventory")}
            onOpenSheet={() => setOpenModal("sheet")}
            onOpenHistory={() => setOpenModal("history")}
          />
        }
      >
        <BookPage>
          {showRules && (
            <div className="book-page paper-texture rounded-md p-5 sm:p-6">
              <RulesScreen book={book} onContinue={acknowledgeRules} />
            </div>
          )}

          {!showRules && !isCombatActive && !isTestPending && (
            <div>
              {section.title && (
                <h1 className="mb-4 flex items-center gap-2 font-display text-xl text-nightwood-900 sm:text-2xl">
                  <ScrollText className="h-5 w-5 text-ember-600" aria-hidden="true" /> {section.title}
                </h1>
              )}
              {section.image && (
                <div className="mx-auto mb-5 max-w-sm sm:max-w-md">
                  <div className="rounded-sm border border-nightwood-900/25 bg-nightwood-900/5 p-1.5 shadow-md">
                    <img
                      src={section.image}
                      alt=""
                      className="w-full rounded-[2px]"
                      style={{ mixBlendMode: "multiply" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.parentElement!.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
              <div
                className={`drop-cap text-nightwood-900 ${FONT_FAMILY_CLASS[settings.fontFamily]} ${FONT_SIZE_CLASS[settings.fontSize]} ${SPACING_CLASS[settings.textSpacing]} ${settings.textBold ? "font-bold" : ""}`}
              >
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {(section.allowRest || section.allowEat) && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-nightwood-900/10 pt-4">
                  {section.allowRest && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={restAtSection}
                      disabled={character.provisions <= 0 || character.stats.stamina >= character.stats.maxStamina}
                    >
                      <Moon className="h-4 w-4" aria-hidden="true" /> Descansar (-1 provisão, +4 energia)
                    </button>
                  )}
                  {section.allowEat && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={eatAtSection}
                      disabled={character.provisions <= 0}
                    >
                      <Utensils className="h-4 w-4" aria-hidden="true" /> Comer (-1 provisão, fadiga zerada)
                    </button>
                  )}
                </div>
              )}

              {section.choices.length > 0 && (
                <div className="mt-6 flex flex-col gap-1">
                  {section.choices.map((choice) => (
                    <BookChoice
                      key={choice.id}
                      text={choice.text}
                      enabled={isChoiceEnabled(choice.id)}
                      lockedReason={getLockReason(choice.id)}
                      alreadyVisited={visitedSections.includes(choice.target)}
                      onSelect={() => selectChoice(choice.id)}
                    />
                  ))}
                </div>
              )}

              {allChoicesLocked && previousSectionId && (
                <div className="mt-4 flex justify-center">
                  <button type="button" className="btn-secondary" onClick={goBackToPreviousSection}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
                  </button>
                </div>
              )}

              {section.choices.length === 0 && (
                <p className="mt-6 flex items-center justify-center gap-2 text-sm text-nightwood-900/60">
                  <ShieldQuestion className="h-4 w-4" aria-hidden="true" /> Este trecho da história ainda está
                  sendo processado...
                </p>
              )}
            </div>
          )}

          {isTestPending && <TestPanel />}
        </BookPage>

        <AnimatePresence>{isCombatActive && <CombatScene key="combat" />}</AnimatePresence>
      </Book>

      <BinderSheet
        open={BINDER_TABS.includes(openModal)}
        activeTab={(BINDER_TABS.includes(openModal) ? openModal : "inventory") as BinderTab}
        onSelectTab={(tab) => setOpenModal(tab)}
        onClose={() => setOpenModal(null)}
      >
        {openModal === "inventory" && <InventoryPanel />}
        {openModal === "sheet" && <CharacterSheetPanel />}
        {openModal === "history" && <HistoryPanel />}
        {openModal === "rules" && <RulesScreen book={book} />}
      </BinderSheet>

      <SettingsRibbon
        open={openModal === "settings"}
        onOpen={() => setOpenModal("settings")}
        onClose={() => setOpenModal(null)}
      >
        <SettingsPanel />
      </SettingsRibbon>

      <ConfirmDialog
        open={confirmLeaveOpen}
        title="Voltar à biblioteca"
        message="Voltar para a biblioteca? Seu progresso está salvo automaticamente."
        confirmLabel="Voltar"
        onCancel={() => setConfirmLeaveOpen(false)}
        onConfirm={() => {
          setConfirmLeaveOpen(false);
          navigate("/biblioteca");
        }}
      />
    </>
  );
}

function EndingScreen({
  title,
  text,
  type,
  onExit,
  onRestart,
}: {
  title: string;
  text: string;
  type: "victory" | "defeat" | "neutral";
  onExit: () => void;
  onRestart: () => void;
}) {
  const color = type === "victory" ? "text-emerald-400" : type === "defeat" ? "text-red-400" : "text-parchment-200";
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
      <p className={`font-display text-sm uppercase tracking-[0.3em] ${color}`}>
        {type === "victory" ? "Vitória" : type === "defeat" ? "Derrota" : "Fim de jogo"}
      </p>
      <h1 className="font-display text-3xl text-parchment-50">{title}</h1>
      <p className="font-serif text-lg leading-relaxed text-parchment-200/90">{text}</p>
      <div className="flex gap-3">
        <button className="btn-secondary" onClick={onExit}>
          <Home className="h-4 w-4" aria-hidden="true" /> Biblioteca
        </button>
        <button className="btn-primary" onClick={onRestart}>
          Jogar novamente
        </button>
      </div>
    </div>
  );
}
