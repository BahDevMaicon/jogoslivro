import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PaperOverlayProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Uma folha de papel que desliza de baixo para cima e repousa sobre o livro —
 * usada para Inventário, Ficha e Histórico. Mesma acessibilidade do `Modal`
 * (portal, Escape, role="dialog"), mas com eixo/textura diferentes: fica em
 * `z-40` (abaixo de `Modal`/`ConfirmDialog`, que continuam em `z-50`) para que
 * um diálogo de confirmação aberto de dentro dela ainda apareça por cima.
 */
export function PaperOverlay({ open, title, onClose, children }: PaperOverlayProps) {
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
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="book-page paper-texture relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-lg rounded-b-none border-x-0 border-b-0 sm:mx-4 sm:max-w-xl sm:rounded-b-lg sm:border-x"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-parchment-700/30 bg-nightwood-900/95 px-5 py-4 backdrop-blur">
              <h2 className="font-display text-lg text-parchment-50">{title}</h2>
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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
