import type { ReactNode } from "react";
import { BatteryWarning, Coins, Heart, Shield, Sparkles, Sword, Trophy, Utensils } from "lucide-react";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import { isRuleEnabled } from "@/engine/storyEngine";

export function CharacterSheetPanel() {
  const book = useGameSessionStore((s) => s.book);
  const character = useGameSessionStore((s) => s.character);

  if (!book || !character) return null;

  const weapon = character.equippedWeapon ? book.items.find((i) => i.id === character.equippedWeapon) : undefined;
  const armor = character.equippedArmor ? book.items.find((i) => i.id === character.equippedArmor) : undefined;
  const fatigueEnabled = isRuleEnabled(book, "fatigueSystem");

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-center font-display text-xl text-parchment-50">{character.name}</h3>

      <div className={`grid grid-cols-3 gap-3 ${fatigueEnabled ? "sm:grid-cols-6" : "sm:grid-cols-5"}`}>
        <StatTile icon={<Sword className="h-5 w-5" />} label="Habilidade" value={character.stats.skill} max={character.stats.maxSkill} />
        <StatTile icon={<Heart className="h-5 w-5" />} label="Energia" value={character.stats.stamina} max={character.stats.maxStamina} />
        <StatTile icon={<Sparkles className="h-5 w-5" />} label="Sorte" value={character.stats.luck} max={character.stats.maxLuck} />
        <StatTile icon={<Coins className="h-5 w-5" />} label="Ouro" value={character.gold} />
        <StatTile icon={<Utensils className="h-5 w-5" />} label="Provisões" value={character.provisions} />
        {fatigueEnabled && (
          <StatTile icon={<BatteryWarning className="h-5 w-5" />} label="Fadiga" value={character.fatigue ?? 0} max={10} />
        )}
      </div>

      <div className="flex items-center justify-center gap-2 rounded-md border border-ember-500/30 bg-ember-600/10 p-3">
        <Trophy className="h-5 w-5 text-ember-400" aria-hidden="true" />
        <span className="font-display text-parchment-100">Pontuação: {character.score ?? 0}</span>
      </div>

      <div>
        <h4 className="mb-2 font-display text-sm uppercase tracking-wide text-ember-400">Equipamento</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs uppercase text-parchment-400">
              <Sword className="h-3.5 w-3.5" aria-hidden="true" /> Arma
            </p>
            <p className="font-serif text-parchment-100">
              {weapon?.name ?? "Nenhuma"}
              {weapon?.damageBonus ? <span className="ml-1 text-sm text-moss-400">(+{weapon.damageBonus} dano)</span> : null}
            </p>
          </div>
          <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs uppercase text-parchment-400">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Armadura
            </p>
            <p className="font-serif text-parchment-100">
              {armor?.name ?? "Nenhuma"}
              {armor?.defenseBonus ? <span className="ml-1 text-sm text-moss-400">(+{armor.defenseBonus} defesa)</span> : null}
            </p>
          </div>
        </div>
      </div>

      {character.activeEffects.length > 0 && (
        <div>
          <h4 className="mb-2 font-display text-sm uppercase tracking-wide text-ember-400">
            Efeitos ativos / condições especiais
          </h4>
          <ul className="flex flex-wrap gap-2">
            {character.activeEffects.map((effect) => (
              <li
                key={effect.id}
                className="rounded-full border border-ember-500/40 bg-ember-600/10 px-3 py-1 text-sm text-ember-300"
              >
                {effect.label}
                {effect.remainingRounds !== undefined && ` (${effect.remainingRounds} rodadas)`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  max,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  max?: number;
}) {
  const pct = max && max > 0 ? Math.round((value / max) * 100) : null;
  return (
    <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-3 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-ember-400">{icon}</div>
      <p className="font-display text-lg text-parchment-50">{max !== undefined ? `${value}/${max}` : value}</p>
      <p className="text-xs uppercase tracking-wide text-parchment-400">{label}</p>
      {pct !== null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-nightwood-950">
          <div className="h-full bg-ember-500" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
