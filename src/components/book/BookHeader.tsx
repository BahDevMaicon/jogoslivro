import type { ReactNode } from "react";
import { Backpack, History, Home, ScrollText } from "lucide-react";
import type { Character } from "@/types/game";
import { HUDBar } from "./HUDBar";

interface BookHeaderProps {
  character: Character;
  onLeave: () => void;
  onOpenInventory: () => void;
  onOpenSheet: () => void;
  onOpenHistory: () => void;
}

export function BookHeader({
  character,
  onLeave,
  onOpenInventory,
  onOpenSheet,
  onOpenHistory,
}: BookHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <button
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-parchment-400 transition hover:text-ember-300"
          onClick={onLeave}
        >
          <Home className="h-4 w-4" aria-hidden="true" /> Biblioteca
        </button>

        <div className="flex items-center gap-1">
          <CompactTab icon={<Backpack className="h-5 w-5" aria-hidden="true" />} label="Inventário" onClick={onOpenInventory} />
          <CompactTab icon={<ScrollText className="h-5 w-5" aria-hidden="true" />} label="Ficha" onClick={onOpenSheet} />
          <CompactTab icon={<History className="h-5 w-5" aria-hidden="true" />} label="Histórico" onClick={onOpenHistory} />
        </div>
      </div>

      <HUDBar character={character} />
    </div>
  );
}

function CompactTab({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className="rounded-md p-2 text-parchment-400 transition hover:bg-nightwood-800/60 hover:text-ember-300"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
