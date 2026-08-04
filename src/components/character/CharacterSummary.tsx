import type { ReactNode } from "react";
import { Coins, Heart, Sparkles, Sword, Utensils } from "lucide-react";
import type { Character } from "@/types/game";

interface CharacterSummaryProps {
  character: Character;
}

export function CharacterSummary({ character }: CharacterSummaryProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-md border border-parchment-700/30 bg-nightwood-900/70 px-4 py-3 text-sm"
      aria-label="Resumo do personagem"
    >
      <span className="font-display text-parchment-100">{character.name}</span>
      <StatBadge icon={<Sword className="h-4 w-4" aria-hidden="true" />} label="Habilidade">
        {character.stats.skill}/{character.stats.maxSkill}
      </StatBadge>
      <StatBadge icon={<Heart className="h-4 w-4" aria-hidden="true" />} label="Energia">
        {character.stats.stamina}/{character.stats.maxStamina}
      </StatBadge>
      <StatBadge icon={<Sparkles className="h-4 w-4" aria-hidden="true" />} label="Sorte">
        {character.stats.luck}/{character.stats.maxLuck}
      </StatBadge>
      <StatBadge icon={<Coins className="h-4 w-4" aria-hidden="true" />} label="Ouro">
        {character.gold}
      </StatBadge>
      <StatBadge icon={<Utensils className="h-4 w-4" aria-hidden="true" />} label="Provisões">
        {character.provisions}
      </StatBadge>
    </div>
  );
}

function StatBadge({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-parchment-200" title={label}>
      <span className="text-ember-400">{icon}</span>
      {children}
    </span>
  );
}
