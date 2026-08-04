import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSound } from "@/lib/sound/useSound";

interface DiceFaceProps {
  value: number;
  animate?: boolean;
  delay?: number;
}

const SIZE = 56; // px — mesmo tamanho do dado 2D anterior (h-14 w-14)
const RADIUS = SIZE / 2;

/** Rotação do cubo (em graus) que traz cada face para frente da câmera. */
const FACE_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

/** Posicionamento estático de cada face na montagem do cubo (opostos somam 7, como um dado real). */
const FACE_PLACEMENT: { pips: number; transform: string }[] = [
  { pips: 1, transform: `translateZ(${RADIUS}px)` },
  { pips: 2, transform: `rotateY(90deg) translateZ(${RADIUS}px)` },
  { pips: 3, transform: `rotateX(90deg) translateZ(${RADIUS}px)` },
  { pips: 4, transform: `rotateX(-90deg) translateZ(${RADIUS}px)` },
  { pips: 5, transform: `rotateY(-90deg) translateZ(${RADIUS}px)` },
  { pips: 6, transform: `rotateY(180deg) translateZ(${RADIUS}px)` },
];

/** Grade 3x3 (topo-esq → base-dir) indicando quais células mostram um ponto. */
const PIP_LAYOUTS: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

/**
 * Um dado 3D (cubo real, não um ícone plano). O valor final já vem resolvido
 * por `diceEngine` — ao trocar `value`, o cubo gira em várias voltas completas
 * e assenta exatamente na face correta, como um dado físico sendo lançado.
 */
export function DiceFace({ value, animate: shouldAnimate = true, delay = 0 }: DiceFaceProps) {
  const safeValue = Math.min(Math.max(Math.round(value), 1), 6);
  const [rollId, setRollId] = useState(0);
  const prevValueRef = useRef<number | null>(null);
  const spinsRef = useRef({ x: 2, y: 2 });
  const play = useSound();

  useEffect(() => {
    if (prevValueRef.current === safeValue) return;
    prevValueRef.current = safeValue;
    if (!shouldAnimate) return;
    spinsRef.current = {
      x: 4 + Math.floor(Math.random() * 2),
      y: 4 + Math.floor(Math.random() * 2),
    };
    setRollId((id) => id + 1);
    play("dice");
  }, [safeValue, shouldAnimate, play]);

  const target = FACE_ROTATION[safeValue];
  const { x: spinsX, y: spinsY } = spinsRef.current;

  return (
    <div
      className="h-14 w-14"
      style={{ perspective: 400 }}
      role="img"
      aria-label={`Dado mostrando ${safeValue}`}
    >
      <motion.div
        key={shouldAnimate ? rollId : "static"}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={
          shouldAnimate
            ? { rotateX: target.x - spinsX * 360, rotateY: target.y - spinsY * 360 }
            : false
        }
        animate={{ rotateX: target.x, rotateY: target.y }}
        transition={{ duration: 2, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {FACE_PLACEMENT.map(({ pips, transform }) => (
          <div
            key={pips}
            className="absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center rounded-lg border border-ember-500/50 bg-nightwood-800 p-2.5 shadow-md"
            style={{ transform, backfaceVisibility: "hidden" }}
          >
            {PIP_LAYOUTS[pips].map((active, i) => (
              <span key={i} className={active ? "h-2 w-2 rounded-full bg-ember-400" : undefined} />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
