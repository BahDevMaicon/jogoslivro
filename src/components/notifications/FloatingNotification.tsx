import { AnimatePresence, motion } from "framer-motion";
import { PackagePlus } from "lucide-react";
import { useEffect } from "react";
import { useSound } from "@/lib/sound/useSound";
import { useLogNotifications } from "./useLogNotifications";

const AUTO_DISMISS_MS = 3000;

/** Cartas que entram pela lateral anunciando itens recém-obtidos, e somem sozinhas. */
export function FloatingNotification() {
  const { queue, dismiss } = useLogNotifications();

  return (
    <div className="pointer-events-none fixed right-3 top-16 z-50 flex flex-col gap-2 sm:right-6">
      <AnimatePresence>
        {queue.map((n) => (
          <NotificationCard key={n.id} itemName={n.itemName} onDismiss={() => dismiss(n.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationCard({ itemName, onDismiss }: { itemName: string; onDismiss: () => void }) {
  const play = useSound();

  useEffect(() => {
    play("item");
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="book-page paper-texture pointer-events-auto flex items-center gap-2 rounded-md px-4 py-2.5 text-sm text-parchment-100"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
    >
      <PackagePlus className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
      <span>
        Você encontrou: <strong className="font-display text-emerald-300">{itemName}</strong>
      </span>
    </motion.div>
  );
}
