import type { ReactNode } from "react";
import { Heart, Sparkles, Sword } from "lucide-react";
import type { Character } from "@/types/game";

interface HUDBarProps {
  character: Character;
}

/** HUD ampliado, visível durante a leitura: Energia, Habilidade e Sorte, com ícones grandes e coloridos. */
export function HUDBar({ character }: HUDBarProps) {
  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Atributos do personagem">
      <StatTile
        icon={<Heart className="h-7 w-7" aria-hidden="true" />}
        value={`${character.stats.stamina}/${character.stats.maxStamina}`}
        label="Energia"
        accentClass="border-wine-400/30 text-wine-400"
      />
      <StatTile
        icon={<Sword className="h-7 w-7" aria-hidden="true" />}
        value={`${character.stats.skill}/${character.stats.maxSkill}`}
        label="Habilidade"
        accentClass="border-ember-400/30 text-ember-400"
      />
      <StatTile
        icon={<Sparkles className="h-7 w-7" aria-hidden="true" />}
        value={`${character.stats.luck}/${character.stats.maxLuck}`}
        label="Sorte"
        accentClass="border-moss-400/30 text-moss-400"
      />
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
  accentClass,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  accentClass: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-md border bg-nightwood-900/40 py-3 ${accentClass}`}>
      {icon}
      <span className="font-display text-sm text-parchment-50">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-parchment-400">{label}</span>
    </div>
  );
}
