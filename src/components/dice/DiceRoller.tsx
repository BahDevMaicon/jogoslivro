import { useState } from "react";
import { Dices } from "lucide-react";
import { DiceFace } from "./DiceFace";
import { rollDice } from "@/engine/diceEngine";
import { useSettingsStore } from "@/stores/settingsStore";

interface DiceRollerProps {
  /** Quantidade de dados a rolar (1 ou 2, normalmente). */
  count?: 1 | 2;
  onResult?: (total: number, rolls: number[]) => void;
}

/**
 * Componente livre de rolagem de dados, usado para curiosidade do jogador ou
 * para decisões fora do fluxo formal de testes/combate. Registra o resultado
 * localmente; o chamador pode reagir via `onResult`.
 */
export function DiceRoller({ count = 2, onResult }: DiceRollerProps) {
  const animations = useSettingsStore((s) => s.settings.animations);
  const [rolls, setRolls] = useState<number[] | null>(null);

  function handleRoll() {
    const result = rollDice(count, 6, 0);
    setRolls(result.rolls);
    onResult?.(result.total, result.rolls);
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-5">
      <p className="font-display text-sm uppercase tracking-wide text-ember-400">
        Rolar {count === 1 ? "um dado" : "dois dados"}
      </p>
      <div className="flex gap-3" role="status" aria-live="polite">
        {rolls
          ? rolls.map((r, i) => <DiceFace key={i} value={r} animate={animations} delay={i * 0.08} />)
          : Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-parchment-700/40 text-parchment-500"
              >
                ?
              </div>
            ))}
      </div>
      {rolls && (
        <p className="font-display text-lg text-parchment-50">
          Total: <span className="text-ember-400">{rolls.reduce((a, b) => a + b, 0)}</span>
        </p>
      )}
      <button className="btn-secondary" onClick={handleRoll}>
        <Dices className="h-4 w-4" aria-hidden="true" /> Rolar dados
      </button>
    </div>
  );
}
