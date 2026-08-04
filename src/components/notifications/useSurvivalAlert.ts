import { useEffect, useRef, useState } from "react";
import { useGameSessionStore } from "@/stores/gameSessionStore";

let idCounter = 0;

export interface SurvivalAlert {
  id: string;
  kind: "rest" | "eat";
}

/** Observa o histórico (`log`) e enfileira um alerta central toda vez que o jogador descansa ou come (fadiga zerada). */
export function useSurvivalAlert() {
  const log = useGameSessionStore((s) => s.log);
  const prevLenRef = useRef(log.length);
  const [queue, setQueue] = useState<SurvivalAlert[]>([]);

  useEffect(() => {
    const newEntries = log.slice(prevLenRef.current);
    prevLenRef.current = log.length;
    const survivalEntries = newEntries.filter((e) => e.type === "rest" || e.type === "eat");
    if (survivalEntries.length === 0) return;
    setQueue((q) => [
      ...q,
      ...survivalEntries.map((entry) => ({
        id: `${entry.id}-${idCounter++}`,
        kind: entry.type as "rest" | "eat",
      })),
    ]);
  }, [log]);

  function dismiss(id: string) {
    setQueue((q) => q.filter((n) => n.id !== id));
  }

  return { alert: queue[0] ?? null, dismiss };
}
