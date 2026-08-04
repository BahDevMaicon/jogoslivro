import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CombatPanel } from "./CombatPanel";
import { useSettingsStore } from "@/stores/settingsStore";
import { useSound } from "@/lib/sound/useSound";

type Stage = "closing" | "table";

/**
 * Cena de tela cheia para o combate: o livro "fecha" e a mesa de combate
 * aparece; ao sair (combate encerrado), o wrapper em `ReadingPage` desmonta
 * este componente dentro de um `AnimatePresence`, que reproduz a animação de
 * saída — o livro "reabrindo" sobre a próxima seção, já pronta por baixo.
 */
export function CombatScene() {
  const animate = useSettingsStore((s) => s.settings.animations);
  const [stage, setStage] = useState<Stage>(animate ? "closing" : "table");
  const play = useSound();

  useEffect(() => {
    play("sword");
    if (!animate) {
      setStage("table");
      return;
    }
    setStage("closing");
    const t = setTimeout(() => setStage("table"), 260);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: animate ? 0.35 : 0, delay: animate ? 0.15 : 0 } }}
    >
      <div className="w-full max-w-lg" style={{ perspective: 1200 }}>
        <motion.div
          initial={animate ? { rotateX: -90, opacity: 0 } : false}
          animate={{ rotateX: stage === "closing" ? -90 : 0, opacity: stage === "closing" ? 0 : 1 }}
          exit={animate ? { rotateX: 90, opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.45, 0, 0.2, 1] }}
        >
          <CombatPanel />
        </motion.div>
      </div>
    </motion.div>
  );
}
