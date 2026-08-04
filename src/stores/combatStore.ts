import { useGameSessionStore } from "./gameSessionStore";

/** Slice de conveniência para o combate (ver nota em characterStore.ts). */
export function useCombat() {
  return useGameSessionStore((s) => s.combat);
}

export function useLastRoundResult() {
  return useGameSessionStore((s) => s.lastRoundResult);
}

export function useLuckTestAvailable() {
  return useGameSessionStore((s) => s.luckTestAvailable);
}

export function useCombatActions() {
  return useGameSessionStore((s) => ({
    playerAttack: s.playerAttack,
    useProvisionInCombat: s.useProvisionInCombat,
    fleeCombat: s.fleeCombat,
    useItem: s.useItem,
    testCombatLuck: s.testCombatLuck,
  }));
}
