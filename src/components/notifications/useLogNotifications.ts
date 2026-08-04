import { useEffect, useRef, useState } from "react";
import { useGameSessionStore } from "@/stores/gameSessionStore";

let idCounter = 0;

export interface ItemNotification {
  id: string;
  itemName: string;
}

/** Observa o histórico de eventos (`log`) e enfileira uma notificação para cada novo item ganho. */
export function useLogNotifications() {
  const log = useGameSessionStore((s) => s.log);
  const prevLenRef = useRef(log.length);
  const [queue, setQueue] = useState<ItemNotification[]>([]);

  useEffect(() => {
    const newEntries = log.slice(prevLenRef.current);
    prevLenRef.current = log.length;
    const gains = newEntries.filter((e) => e.type === "itemGained");
    if (gains.length === 0) return;
    setQueue((q) => [
      ...q,
      ...gains.map((entry) => ({
        id: `${entry.id}-${idCounter++}`,
        itemName: entry.message.replace(/^Item recebido:\s*/, ""),
      })),
    ]);
  }, [log]);

  function dismiss(id: string) {
    setQueue((q) => q.filter((n) => n.id !== id));
  }

  return { queue, dismiss };
}
