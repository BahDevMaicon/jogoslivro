import { useGameSessionStore } from "./gameSessionStore";

/**
 * Slice de conveniência para a ficha do personagem.
 * Implementado como seletor sobre `gameSessionStore` (a fonte única de verdade
 * da partida) em vez de uma store Zustand independente, porque personagem,
 * inventário e combate são sempre lidos/gravados atomicamente no mesmo save.
 * Mesmo assim, cada domínio é isolado em seu próprio hook para manter os
 * componentes desacoplados do restante da sessão.
 */
export function useCharacter() {
  return useGameSessionStore((s) => s.character);
}

export function useCharacterActions() {
  return useGameSessionStore((s) => ({
    equipItem: s.equipItem,
    unequipItem: s.unequipItem,
  }));
}
