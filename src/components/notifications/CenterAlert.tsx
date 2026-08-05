import { AnimatePresence, motion } from "framer-motion";
import { Moon, Utensils } from "lucide-react";
import { useEffect } from "react";
import { useSurvivalAlert } from "./useSurvivalAlert";

const AUTO_DISMISS_MS = 2800;

const CONTENT = {
  rest: {
    icon: Moon,
    message: "Você descansou. Energia recuperada e fadiga zerada.",
  },
  eat: {
    icon: Utensils,
    message: "Você comeu. Fadiga zerada.",
  },
};

/** Alerta centralizado, distinto das notificações de canto — avisa que o personagem descansou/comeu e a fadiga foi zerada. */
export function CenterAlert() {
  const { alert, dismiss } = useSurvivalAlert();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4">
      <AnimatePresence>
        {alert && <AlertCard key={alert.id} kind={alert.kind} onDismiss={() => dismiss(alert.id)} />}
      </AnimatePresence>
    </div>
  );
}

function AlertCard({ kind, onDismiss }: { kind: "rest" | "eat"; onDismiss: () => void }) {
  const { icon: Icon, message } = CONTENT[kind];

  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="book-page paper-texture pointer-events-none flex max-w-xs flex-col items-center gap-2 rounded-md px-6 py-5 text-center shadow-page"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="h-6 w-6 text-ember-400" aria-hidden="true" />
      <p className="font-display text-parchment-50">{message}</p>
    </motion.div>
  );
}
