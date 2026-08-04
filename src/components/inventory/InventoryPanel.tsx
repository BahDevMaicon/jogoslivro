import { useState } from "react";
import { Backpack, Eye, Shield, Sword, Trash2 } from "lucide-react";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import { Modal } from "@/components/layout/Modal";
import { resolveItemIcon } from "@/lib/itemIcons";
import type { StoryItem } from "@/types/story";

const EFFECT_STAT_LABEL: Record<string, string> = {
  skill: "Habilidade",
  stamina: "Energia",
  luck: "Sorte",
  gold: "Ouro",
  provisions: "Provisões",
};

function itemAttributeTags(item: StoryItem): string[] {
  const tags: string[] = [];
  if (item.damageBonus) tags.push(`+${item.damageBonus} dano`);
  if (item.defenseBonus) tags.push(`+${item.defenseBonus} defesa`);
  for (const effect of item.onUseEffects ?? []) {
    const label = EFFECT_STAT_LABEL[effect.stat] ?? effect.stat;
    tags.push(`${effect.value >= 0 ? "+" : ""}${effect.value} ${label} ao usar`);
  }
  return tags;
}

export function InventoryPanel() {
  const book = useGameSessionStore((s) => s.book);
  const character = useGameSessionStore((s) => s.character);
  const consumeItem = useGameSessionStore((s) => s.useItem);
  const equipItem = useGameSessionStore((s) => s.equipItem);
  const unequipItem = useGameSessionStore((s) => s.unequipItem);
  const discardItem = useGameSessionStore((s) => s.discardItem);
  const [examiningId, setExaminingId] = useState<string | null>(null);

  if (!book || !character) return null;

  const uniqueItemIds = Array.from(new Set(character.inventory));
  const examiningItem = examiningId ? book.items.find((i) => i.id === examiningId) : undefined;

  if (uniqueItemIds.length === 0) {
    return (
      <p className="flex flex-col items-center gap-3 py-8 text-center font-serif text-parchment-300">
        <Backpack className="h-8 w-8 text-parchment-500" aria-hidden="true" />
        Seu inventário está vazio.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {uniqueItemIds.map((itemId) => {
          const item = book.items.find((i) => i.id === itemId);
          if (!item) return null;
          const count = character.inventory.filter((id) => id === itemId).length;
          const isEquippedWeapon = character.equippedWeapon === itemId;
          const isEquippedArmor = character.equippedArmor === itemId;
          const Icon = resolveItemIcon(item);
          const attributeTags = itemAttributeTags(item);
          const canExamine = Boolean(item.examineText || item.examineImage);

          return (
            <li key={itemId} className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-display text-parchment-50">
                  <Icon className="h-5 w-5 shrink-0 text-ember-400" aria-hidden="true" />
                  {item.name} {count > 1 && <span className="text-sm text-parchment-400">×{count}</span>}
                </p>
                {(isEquippedWeapon || isEquippedArmor) && (
                  <span className="shrink-0 rounded-full bg-ember-600/30 px-2 py-0.5 text-xs text-ember-300">
                    Equipado
                  </span>
                )}
              </div>
              <p className="mb-2 text-sm text-parchment-300/80">{item.description}</p>
              {attributeTags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {attributeTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-moss-400/30 bg-moss-500/10 px-2 py-0.5 text-xs text-moss-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <ItemActions
                item={item}
                isEquipped={isEquippedWeapon || isEquippedArmor}
                canExamine={canExamine}
                onUse={() => consumeItem(itemId)}
                onEquip={() => equipItem(itemId)}
                onUnequip={() => unequipItem(item.kind === "weapon" ? "weapon" : "armor")}
                onDiscard={() => discardItem(itemId)}
                onExamine={() => setExaminingId(itemId)}
              />
            </li>
          );
        })}
      </ul>

      <Modal open={examiningId !== null} title={examiningItem?.name ?? "Item"} onClose={() => setExaminingId(null)}>
        {examiningItem?.examineImage && (
          <img
            src={examiningItem.examineImage}
            alt=""
            className="mb-4 max-h-80 w-full rounded-md border border-parchment-700/30 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {examiningItem?.examineText && (
          <p className="font-serif text-parchment-100">{examiningItem.examineText}</p>
        )}
      </Modal>
    </>
  );
}

function ItemActions({
  item,
  isEquipped,
  canExamine,
  onUse,
  onEquip,
  onUnequip,
  onDiscard,
  onExamine,
}: {
  item: StoryItem;
  isEquipped: boolean;
  canExamine: boolean;
  onUse: () => void;
  onEquip: () => void;
  onUnequip: () => void;
  onDiscard: () => void;
  onExamine: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {canExamine && (
        <button className="btn-secondary px-3 py-2 text-xs" onClick={onExamine}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Olhar
        </button>
      )}
      {item.kind === "consumable" && (
        <button className="btn-secondary px-3 py-2 text-xs" onClick={onUse}>
          Usar
        </button>
      )}
      {(item.kind === "weapon" || item.kind === "armor") &&
        (isEquipped ? (
          <button className="btn-secondary px-3 py-2 text-xs" onClick={onUnequip}>
            {item.kind === "weapon" ? <Sword className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
            Desequipar
          </button>
        ) : (
          <button className="btn-secondary px-3 py-2 text-xs" onClick={onEquip}>
            {item.kind === "weapon" ? <Sword className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
            Equipar
          </button>
        ))}
      {item.discardable !== false && (
        <button className="btn-secondary px-3 py-2 text-xs text-red-300" onClick={onDiscard}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Descartar
        </button>
      )}
    </div>
  );
}
