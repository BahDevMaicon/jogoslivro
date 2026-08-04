import { AnimatePresence, motion } from "framer-motion";
import { Feather } from "lucide-react";
import { useAutosaveIndicator } from "./useAutosaveIndicator";

/** "Uma pena escrevendo... Partida salva" — aparece por um instante e some sozinho. */
export function AutosaveIndicator() {
  const visible = useAutosaveIndicator();
  return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="flex items-center gap-1.5 rounded-full border border-parchment-700/30 bg-nightwood-900/90 px-3 py-1.5 text-xs text-parchment-300 shadow-md backdrop-blur"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
          >
            <Feather className="h-3.5 w-3.5 text-ember-400" aria-hidden="true" />
            Partida salva
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
