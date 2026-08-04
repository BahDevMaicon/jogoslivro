import { useGameSessionStore } from "./gameSessionStore";

/** Slice de conveniência para o inventário (ver nota em characterStore.ts). */
export function useInventory() {
  return useGameSessionStore((s) => s.character?.inventory ?? []);
}

export function useInventoryActions() {
  return useGameSessionStore((s) => ({
    useItem: s.useItem,
    equipItem: s.equipItem,
    unequipItem: s.unequipItem,
    discardItem: s.discardItem,
  }));
}
