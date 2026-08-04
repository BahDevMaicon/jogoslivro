import {
  BookOpen,
  Dices,
  Feather,
  Flag,
  History as HistoryIcon,
  Moon,
  MoveRight,
  PackageMinus,
  PackagePlus,
  Sparkles,
  Swords,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import type { LogEntryType } from "@/types/game";

const TYPE_COLORS: Record<LogEntryType, string> = {
  section: "text-parchment-300",
  choice: "text-ember-300",
  itemGained: "text-emerald-300",
  itemRemoved: "text-red-300",
  test: "text-sky-300",
  diceRoll: "text-parchment-400",
  combatRound: "text-orange-300",
  combatResult: "text-orange-400",
  statChange: "text-parchment-300",
  rest: "text-azure-400",
  eat: "text-moss-400",
  custom: "text-parchment-200",
};

const TYPE_ICONS: Record<LogEntryType, LucideIcon> = {
  section: BookOpen,
  choice: MoveRight,
  itemGained: PackagePlus,
  itemRemoved: PackageMinus,
  test: Sparkles,
  diceRoll: Dices,
  combatRound: Swords,
  combatResult: Flag,
  statChange: TrendingUp,
  rest: Moon,
  eat: Utensils,
  custom: Feather,
};

export function HistoryPanel() {
  const log = useGameSessionStore((s) => s.log);

  if (log.length === 0) {
    return (
      <p className="flex flex-col items-center gap-3 py-8 text-center font-serif text-parchment-300">
        <HistoryIcon className="h-8 w-8 text-parchment-500" aria-hidden="true" />
        Nenhum evento registrado ainda.
      </p>
    );
  }

  const reversed = [...log].reverse();

  return (
    <ol className="flex flex-col divide-y divide-parchment-800/25">
      {reversed.map((entry) => {
        const Icon = TYPE_ICONS[entry.type];
        return (
          <li key={entry.id} className="flex items-start gap-3 py-3 first:pt-0">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${TYPE_COLORS[entry.type]}`} aria-hidden="true" />
            <div className="flex-1">
              <p className={`font-serif ${TYPE_COLORS[entry.type]}`}>{entry.message}</p>
              <p className="mt-0.5 text-xs italic text-parchment-500">
                {new Date(entry.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
