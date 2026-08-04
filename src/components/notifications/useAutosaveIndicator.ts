import { useEffect, useRef, useState } from "react";
import { useGameSessionStore } from "@/stores/gameSessionStore";

const VISIBLE_MS = 1400;

/**
 * Mostra brevemente um indicador de "salvo" sempre que a seção ou o
 * personagem mudam — a store já persiste automaticamente (`persist()`) logo
 * após essas mudanças, então esta é uma aproximação confiável sem precisar
 * expor um timestamp de save dedicado na store.
 */
export function useAutosaveIndicator() {
  const currentSectionId = useGameSessionStore((s) => s.currentSectionId);
  const character = useGameSessionStore((s) => s.character);
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [currentSectionId, character]);

  return visible;
}
