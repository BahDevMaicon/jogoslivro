import { motion } from "framer-motion";
import { ChevronRight, Eye, Lock } from "lucide-react";

interface BookChoiceProps {
  text: string;
  enabled: boolean;
  lockedReason?: string;
  /** Se o destino desta escolha já foi visitado antes — mostra um ícone de olho discreto. */
  alreadyVisited?: boolean;
  onSelect: () => void;
}

/** Uma escolha da história, apresentada como um link em prosa com ícone, não como botão. */
export function BookChoice({ text, enabled, lockedReason, alreadyVisited, onSelect }: BookChoiceProps) {
  return (
    <motion.button
      type="button"
      className="book-choice group"
      disabled={!enabled}
      onClick={onSelect}
      whileHover={enabled ? { x: 6 } : undefined}
      whileTap={enabled ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
          enabled
            ? "border-ember-500/50 bg-ember-500/10 text-ember-600 group-hover:border-ember-500 group-hover:bg-ember-500/20 group-hover:text-ember-500"
            : "border-nightwood-900/20 bg-nightwood-900/5 text-nightwood-900/40"
        }`}
      >
        {enabled ? (
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Lock className="h-4 w-4" aria-hidden="true" />
        )}
      </span>
      <span className="mt-1 -mx-1.5 rounded-sm px-1.5 py-0.5 transition-colors duration-200 group-hover:bg-ember-500/15">
        <span className="inline-flex items-center gap-1.5">
          {text}
          {alreadyVisited && (
            <span title="Você já visitou este lugar.">
              <Eye className="h-3.5 w-3.5 shrink-0 text-nightwood-900/40" aria-hidden="true" />
            </span>
          )}
        </span>
        {!enabled && lockedReason && (
          <span className="mt-1 block text-base italic text-nightwood-900/50">{lockedReason}</span>
        )}
      </span>
    </motion.button>
  );
}
