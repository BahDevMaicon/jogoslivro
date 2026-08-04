import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, X } from "lucide-react";

interface SettingsRibbonProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Um marcador preso à borda direita do livro. Ao clicar, desliza um painel
 * horizontalmente (eixo diferente do `PaperOverlay`, que sobe verticalmente) —
 * cumpre o pedido de que Configurações não pareça mais um modal/folha comum.
 */
export function SettingsRibbon({ open, onOpen, onClose, children }: SettingsRibbonProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      <button
        className="bookmark-ribbon"
        onClick={onOpen}
        aria-label="Abrir configurações"
        aria-expanded={open}
      >
        <SettingsIcon className="h-4 w-4" aria-hidden="true" />
        <span className="text-[10px] uppercase tracking-widest" style={{ writingMode: "vertical-rl" }}>
          Config.
        </span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/55"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                role="presentation"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Configurações"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                className="book-page paper-texture fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto rounded-none border-y-0 border-r-0"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-parchment-700/30 bg-nightwood-900/95 px-5 py-4 backdrop-blur">
                  <h2 className="font-display text-lg text-parchment-50">Configurações</h2>
                  <button
                    className="rounded-md p-1.5 text-parchment-300 transition hover:bg-nightwood-800 hover:text-parchment-50"
                    onClick={onClose}
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="p-5">{children}</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
