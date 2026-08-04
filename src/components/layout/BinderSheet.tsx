import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Backpack, History, ScrollText, Shield, X, type LucideIcon } from "lucide-react";

export type BinderTab = "inventory" | "sheet" | "history" | "rules";

interface BinderSheetProps {
  open: boolean;
  activeTab: BinderTab;
  onSelectTab: (tab: BinderTab) => void;
  onClose: () => void;
  children: ReactNode;
}

const TABS: { id: BinderTab; label: string; icon: LucideIcon; accent: "ember" | "azure" | "moss" | "wine" }[] = [
  { id: "inventory", label: "Inventário", icon: Backpack, accent: "ember" },
  { id: "sheet", label: "Ficha", icon: ScrollText, accent: "azure" },
  { id: "history", label: "Histórico", icon: History, accent: "moss" },
  { id: "rules", label: "Regras", icon: Shield, accent: "wine" },
];

const TITLES: Record<BinderTab, string> = {
  inventory: "Inventário",
  sheet: "Ficha do Personagem",
  history: "Histórico",
  rules: "Regras da Aventura",
};

/**
 * Um "fichário": abas coloridas na lateral (Inventário/Ficha/Histórico) e o
 * conteúdo da aba ativa no centro — troca de aba sem fechar a folha, ao
 * contrário dos antigos `InventorySheet`/`CharacterSheet` independentes.
 */
export function BinderSheet({ open, activeTab, onSelectTab, onClose, children }: BinderSheetProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Fichário"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="book-page paper-texture relative flex h-[85vh] w-full max-w-3xl overflow-hidden rounded-t-lg rounded-b-none border-x-0 border-b-0 sm:mx-4 sm:h-[75vh] sm:rounded-b-lg sm:border-x"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-20 shrink-0 flex-col items-center gap-3 overflow-y-auto border-r border-parchment-800/30 bg-nightwood-900/50 py-6 sm:w-24">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    aria-pressed={active}
                    className={`binder-tab binder-tab-${tab.accent} ${active ? "binder-tab-active" : ""}`}
                  >
                    <Icon className="h-8 w-8" aria-hidden="true" />
                    <span className="text-center text-[10px] font-display uppercase leading-tight tracking-wide">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-parchment-700/30 bg-nightwood-900/95 px-5 py-4 backdrop-blur">
                <h2 className="font-display text-lg text-parchment-50">{TITLES[activeTab]}</h2>
                <button
                  className="rounded-md p-1.5 text-parchment-300 transition hover:bg-nightwood-800 hover:text-parchment-50"
                  onClick={onClose}
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
