import { create } from "zustand";
import type { GameBook, StoryItem } from "@/types/story";
import type { Character, CombatState, EnemyState, GameSave, LogEntry, PendingTest } from "@/types/game";
import { SAVE_FORMAT_VERSION } from "@/types/game";
import {
  applyFatigueTick,
  buildInitialCharacter,
  eatAtSection as eatAtSectionPure,
  executeChoice,
  getChoiceLockReason,
  getSection,
  isChoiceAvailable,
  isRuleEnabled,
  processSectionEntry,
  restAtSection as restAtSectionPure,
} from "@/engine/storyEngine";
import { resolveTest, type TestOutcome } from "@/engine/testEngine";
import {
  applyRoundDamage,
  createCombatState,
  evaluateCombatOutcome,
  resolveCombatLuckBonus,
  resolveCombatRound,
} from "@/engine/combatEngine";
import { deleteSave, exportSave, importSave, loadGame, saveGame } from "@/engine/saveEngine";
import { syncReadingProgress } from "@/engine/userLibraryEngine";
import { createLogEntry, generateId } from "@/utils/log";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { useLibraryStore } from "@/stores/libraryStore";

interface GameSessionState {
  book: GameBook | null;
  character: Character | null;
  flags: Record<string, boolean>;
  currentSectionId: string | null;
  visitedSections: string[];
  choicesMade: string[];
  defeatedEnemies: string[];
  combat: CombatState | null;
  pendingTest: PendingTest | null;
  log: LogEntry[];
  isFinished: boolean;
  ending: GameSave["ending"];
  lastRoundResult:
    | (ReturnType<typeof resolveCombatRound> & {
        damageDealt: number;
        targetEnemyId: string;
        /** Resultado do "Testar a Sorte" pós-ataque desta rodada, se usado. */
        luckBonus?: { success: boolean; total: number };
      })
    | null;
  lastTestOutcome: TestOutcome | null;
  rulesAcknowledged: boolean;
  /** true logo após uma rodada de combate vencida pelo jogador contra um inimigo que sobreviveu ao golpe — permite "Testar a Sorte" uma vez. */
  luckTestAvailable: boolean;
  /** Id da seção anterior à atual, usado pelo botão "Voltar" quando o jogador fica sem escolhas disponíveis. */
  previousSectionId: string | null;

  // ---- Ciclo de vida ----
  startNewGame: (book: GameBook, character: Character) => void;
  continueGame: (book: GameBook) => boolean;
  restartGame: () => void;
  exitGame: () => void;
  acknowledgeRules: () => void;

  // ---- Navegação ----
  selectChoice: (choiceId: string) => void;
  isChoiceEnabled: (choiceId: string) => boolean;
  getLockReason: (choiceId: string) => string | undefined;
  goBackToPreviousSection: () => void;

  // ---- Testes ----
  rollPendingTest: () => void;
  confirmPendingTest: () => void;

  // ---- Combate ----
  playerAttack: () => void;
  useProvisionInCombat: () => void;
  fleeCombat: () => void;
  testCombatLuck: () => void;

  // ---- Inventário ----
  useItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (kind: "weapon" | "armor") => void;
  discardItem: (itemId: string) => void;

  // ---- Sobrevivência ----
  restAtSection: () => void;
  eatAtSection: () => void;

  // ---- Persistência ----
  persist: () => void;
  exportCurrentSave: () => string | null;
  importSaveFile: (json: string) => { success: boolean; error?: string };
  deleteCurrentSave: () => void;
}

function toSave(state: GameSessionState): GameSave | null {
  if (!state.book || !state.character || !state.currentSectionId) return null;
  return {
    formatVersion: SAVE_FORMAT_VERSION,
    bookId: state.book.id,
    bookVersion: state.book.version,
    currentSectionId: state.currentSectionId,
    character: state.character,
    flags: state.flags,
    visitedSections: state.visitedSections,
    choicesMade: state.choicesMade,
    defeatedEnemies: state.defeatedEnemies,
    combat: state.combat,
    pendingTest: state.pendingTest,
    log: state.log,
    settings: useSettingsStore.getState().settings,
    isFinished: state.isFinished,
    ending: state.ending,
    rulesAcknowledged: state.rulesAcknowledged,
    previousSectionId: state.previousSectionId,
    createdAt: state.log[0]?.timestamp ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function findItem(book: GameBook, itemId: string): StoryItem | undefined {
  return book.items.find((i) => i.id === itemId);
}

/**
 * Calcula o novo `previousSectionId` ao sair da seção atual. Seções sem
 * nenhuma escolha (ex.: um trecho que só existe para disparar `startTest`/
 * `startCombat` automaticamente via `onEnter`) não têm nada navegável para
 * mostrar caso o jogador use "Voltar" — por isso são puladas, mantendo o
 * `previousSectionId` anterior até uma seção com escolhas de verdade.
 */
function nextPreviousSectionId(book: GameBook, state: GameSessionState): string | null {
  if (!state.currentSectionId) return state.previousSectionId;
  const section = getSection(book, state.currentSectionId);
  return section.choices.length > 0 ? state.currentSectionId : state.previousSectionId;
}

/** Recompensas de derrotar inimigos: pontos e possível item de loot (ver `enemy.points`/`lootItemId`/`lootChancePercent`). */
function applyVictoryRewards(
  book: GameBook,
  character: Character,
  defeatedIds: string[]
): { character: Character; logEntries: LogEntry[] } {
  let nextCharacter = character;
  let pointsEarned = 0;
  const logEntries: LogEntry[] = [];

  for (const enemyId of defeatedIds) {
    const enemyDef = book.enemies.find((e) => e.id === enemyId);
    if (!enemyDef) continue;
    pointsEarned += enemyDef.points ?? 0;
    if (enemyDef.lootItemId && Math.random() * 100 < (enemyDef.lootChancePercent ?? 0)) {
      const lootItem = findItem(book, enemyDef.lootItemId);
      if (lootItem) {
        nextCharacter = { ...nextCharacter, inventory: [...nextCharacter.inventory, lootItem.id] };
        logEntries.push(createLogEntry("itemGained", `Item recebido: ${lootItem.name}`));
      }
    }
  }

  if (pointsEarned > 0) {
    const nextScore = (nextCharacter.score ?? 0) + pointsEarned;
    nextCharacter = { ...nextCharacter, score: nextScore };
    logEntries.push(createLogEntry("statChange", `Pontuação +${pointsEarned} (agora ${nextScore})`));
  }

  return { character: nextCharacter, logEntries };
}

export const useGameSessionStore = create<GameSessionState>((set, get) => ({
  book: null,
  character: null,
  flags: {},
  currentSectionId: null,
  visitedSections: [],
  choicesMade: [],
  defeatedEnemies: [],
  combat: null,
  pendingTest: null,
  log: [],
  isFinished: false,
  ending: null,
  lastRoundResult: null,
  lastTestOutcome: null,
  rulesAcknowledged: false,
  luckTestAvailable: false,
  previousSectionId: null,

  startNewGame: (book, character) => {
    set({
      book,
      character,
      flags: {},
      currentSectionId: book.startSection,
      visitedSections: [],
      choicesMade: [],
      defeatedEnemies: [],
      combat: null,
      pendingTest: null,
      log: [createLogEntry("custom", `Aventura iniciada: ${book.title}`)],
      isFinished: false,
      ending: null,
      lastRoundResult: null,
      lastTestOutcome: null,
      rulesAcknowledged: false,
      luckTestAvailable: false,
      previousSectionId: null,
    });
    get().persist();
    enterSection(set, get, book.startSection);
    get().persist();
  },

  continueGame: (book) => {
    const save = loadGame(book.id);
    if (!save) return false;
    set({
      book,
      character: save.character,
      flags: save.flags,
      currentSectionId: save.currentSectionId,
      visitedSections: save.visitedSections,
      choicesMade: save.choicesMade,
      defeatedEnemies: save.defeatedEnemies,
      combat: save.combat,
      pendingTest: save.pendingTest,
      log: save.log,
      isFinished: save.isFinished,
      ending: save.ending,
      lastRoundResult: null,
      lastTestOutcome: null,
      rulesAcknowledged: save.rulesAcknowledged ?? false,
      luckTestAvailable: false,
      previousSectionId: save.previousSectionId ?? null,
    });
    return true;
  },

  restartGame: () => {
    const { book } = get();
    if (!book) return;
    deleteSave(book.id);
    set({
      character: null,
      currentSectionId: null,
      flags: {},
      visitedSections: [],
      choicesMade: [],
      defeatedEnemies: [],
      combat: null,
      pendingTest: null,
      log: [],
      isFinished: false,
      ending: null,
      rulesAcknowledged: false,
      luckTestAvailable: false,
      previousSectionId: null,
    });
  },

  exitGame: () => {
    set({
      book: null,
      character: null,
      currentSectionId: null,
      flags: {},
      visitedSections: [],
      choicesMade: [],
      defeatedEnemies: [],
      combat: null,
      pendingTest: null,
      log: [],
      isFinished: false,
      ending: null,
      rulesAcknowledged: false,
      luckTestAvailable: false,
      previousSectionId: null,
    });
  },

  acknowledgeRules: () => {
    set({ rulesAcknowledged: true });
    get().persist();
  },

  goBackToPreviousSection: () => {
    const state = get();
    if (!state.previousSectionId || !state.currentSectionId) return;
    set({ currentSectionId: state.previousSectionId, previousSectionId: state.currentSectionId });
    get().persist();
  },

  isChoiceEnabled: (choiceId) => {
    const state = get();
    if (!state.book || !state.character || !state.currentSectionId) return false;
    const section = getSection(state.book, state.currentSectionId);
    const choice = section.choices.find((c) => c.id === choiceId);
    if (!choice) return false;
    return isChoiceAvailable(choice, section, {
      character: state.character,
      flags: state.flags,
      visitedSections: state.visitedSections,
      choicesMade: state.choicesMade,
      defeatedEnemies: state.defeatedEnemies,
    });
  },

  getLockReason: (choiceId) => {
    const state = get();
    if (!state.book || !state.character || !state.currentSectionId) return undefined;
    const section = getSection(state.book, state.currentSectionId);
    const choice = section.choices.find((c) => c.id === choiceId);
    if (!choice) return undefined;
    return getChoiceLockReason(choice, section, {
      character: state.character,
      flags: state.flags,
      visitedSections: state.visitedSections,
      choicesMade: state.choicesMade,
      defeatedEnemies: state.defeatedEnemies,
    });
  },

  selectChoice: (choiceId) => {
    const state = get();
    if (!state.book || !state.character || !state.currentSectionId) return;
    const section = getSection(state.book, state.currentSectionId);
    const choice = section.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    if (!get().isChoiceEnabled(choiceId)) return;

    const result = executeChoice(state.book, choice, state.character, state.flags);
    const fatigueResult = applyFatigueTick(state.book, result.character);
    set({
      character: fatigueResult.character,
      flags: result.flags,
      choicesMade: [...state.choicesMade, choiceId],
      log: [...state.log, ...result.logEntries, ...fatigueResult.logEntries],
      previousSectionId: nextPreviousSectionId(state.book, state),
    });
    enterSection(set, get, result.targetSectionId);
    get().persist();
  },

  rollPendingTest: () => {
    const state = get();
    if (!state.book || !state.character || !state.pendingTest) return;
    const outcome = resolveTest(state.character, state.pendingTest);

    let nextCharacter = state.character;
    if (outcome.luckPenaltyApplied) {
      nextCharacter = {
        ...nextCharacter,
        stats: { ...nextCharacter.stats, luck: Math.max(0, nextCharacter.stats.luck - 1) },
      };
    }

    const logEntries: LogEntry[] = [
      createLogEntry(
        "diceRoll",
        `Dados: ${outcome.roll.rolls.join(" + ")} = ${outcome.roll.total}`
      ),
      createLogEntry(
        "test",
        outcome.success ? "Teste bem-sucedido!" : "Teste malsucedido."
      ),
    ];

    set({ character: nextCharacter, lastTestOutcome: outcome, log: [...state.log, ...logEntries] });
    get().persist();
  },

  confirmPendingTest: () => {
    const state = get();
    if (!state.book || !state.character || !state.pendingTest || !state.lastTestOutcome) return;
    const targetSectionId = state.lastTestOutcome.nextSectionId;
    const fatigueResult = applyFatigueTick(state.book, state.character);
    set({
      pendingTest: null,
      character: fatigueResult.character,
      log: [...state.log, ...fatigueResult.logEntries],
      previousSectionId: nextPreviousSectionId(state.book, state),
    });
    enterSection(set, get, targetSectionId);
    get().persist();
  },

  playerAttack: () => {
    const state = get();
    if (!state.book || !state.character || !state.combat || !state.combat.isActive) return;

    const livingEnemies = state.combat.enemies.filter((e) => e.stamina > 0);
    const target = livingEnemies[0];
    if (!target) return;

    const weapon = state.character.equippedWeapon
      ? findItem(state.book, state.character.equippedWeapon)
      : undefined;
    const armor = state.character.equippedArmor
      ? findItem(state.book, state.character.equippedArmor)
      : undefined;

    const round = resolveCombatRound(state.character.stats.skill, target.skill);

    // O bônus da arma só se aplica quando o jogador vence (aumenta o dano causado);
    // o bônus da armadura só se aplica quando o inimigo vence (reduz o dano recebido).
    const { character: charAfter, enemy: enemyAfter, damageDealt } = applyRoundDamage(
      round,
      state.character,
      target,
      {
        attackerDamageBonus: round.winner === "player" ? weapon?.damageBonus ?? 0 : 0,
        defenderDefenseBonus: round.winner === "enemy" ? armor?.defenseBonus ?? 0 : 0,
      }
    );

    const nextEnemies = state.combat.enemies.map((e) => (e.id === target.id ? enemyAfter : e));

    const outcome = evaluateCombatOutcome(charAfter, nextEnemies);

    const damageLabel =
      round.winner === "player"
        ? weapon?.damageBonus
          ? `você causa ${damageDealt} de dano (${round.damage} + ${weapon.damageBonus} de ${weapon.name})`
          : `você causa ${damageDealt} de dano`
        : round.winner === "enemy"
          ? armor?.defenseBonus
            ? `${target.name} causa ${damageDealt} de dano (${round.damage} − ${armor.defenseBonus} de ${armor.name})`
            : `${target.name} causa ${damageDealt} de dano`
          : "empate, sem dano";

    const logEntries: LogEntry[] = [
      createLogEntry(
        "combatRound",
        `Rodada ${state.combat.round}: você ${round.playerAttackStrength} x ${target.name} ${round.enemyAttackStrength} — ${damageLabel}`
      ),
    ];

    if (outcome === "victory") {
      logEntries.push(createLogEntry("combatResult", "Vitória no combate!"));
      const defeatedIds = nextEnemies.filter((e) => e.stamina <= 0).map((e) => e.id);
      const rewards = applyVictoryRewards(state.book, charAfter, defeatedIds);
      const fatigueResult = applyFatigueTick(state.book, rewards.character);

      set({
        character: fatigueResult.character,
        combat: { ...state.combat, enemies: nextEnemies, isActive: false },
        defeatedEnemies: [...state.defeatedEnemies, ...defeatedIds],
        log: [...state.log, ...logEntries, ...rewards.logEntries, ...fatigueResult.logEntries],
        lastRoundResult: { ...round, damageDealt, targetEnemyId: target.id },
        luckTestAvailable: false,
        previousSectionId: nextPreviousSectionId(state.book, state),
      });
      enterSection(set, get, state.combat.onVictory);
      get().persist();
      return;
    }

    if (outcome === "defeat") {
      logEntries.push(createLogEntry("combatResult", "Derrota no combate."));
      const fatigueResult = applyFatigueTick(state.book, charAfter);
      set({
        character: fatigueResult.character,
        combat: { ...state.combat, enemies: nextEnemies, isActive: false },
        log: [...state.log, ...logEntries, ...fatigueResult.logEntries],
        lastRoundResult: { ...round, damageDealt, targetEnemyId: target.id },
        luckTestAvailable: false,
        previousSectionId: nextPreviousSectionId(state.book, state),
      });
      enterSection(set, get, state.combat.onDefeat);
      get().persist();
      return;
    }

    const luckTestAvailable =
      round.winner === "player" &&
      enemyAfter.stamina > 0 &&
      isRuleEnabled(state.book, "combatLuck") &&
      charAfter.stats.luck > 0;

    set({
      character: charAfter,
      combat: { ...state.combat, enemies: nextEnemies, round: state.combat.round + 1 },
      log: [...state.log, ...logEntries],
      lastRoundResult: { ...round, damageDealt, targetEnemyId: target.id },
      luckTestAvailable,
    });
    get().persist();
  },

  testCombatLuck: () => {
    const state = get();
    if (!state.book || !state.character || !state.combat || !state.combat.isActive) return;
    if (!state.luckTestAvailable || !state.lastRoundResult) return;

    const target = state.combat.enemies.find((e) => e.id === state.lastRoundResult!.targetEnemyId);
    if (!target || target.stamina <= 0) return;

    const { roll, success } = resolveCombatLuckBonus(state.character);
    const characterAfterCost: Character = {
      ...state.character,
      stats: { ...state.character.stats, luck: Math.max(0, state.character.stats.luck - 1) },
    };

    const logEntries: LogEntry[] = [
      createLogEntry("diceRoll", `Teste de Sorte (combate): ${roll.rolls.join(" + ")} = ${roll.total}`),
    ];

    if (!success) {
      logEntries.push(createLogEntry("test", "Você testa a sorte, mas ela não ajuda desta vez."));
      set({
        character: characterAfterCost,
        luckTestAvailable: false,
        log: [...state.log, ...logEntries],
        lastRoundResult: { ...state.lastRoundResult, luckBonus: { success: false, total: roll.total } },
      });
      get().persist();
      return;
    }

    const LUCK_BONUS_DAMAGE = 2;
    const enemyAfterBonus: EnemyState = { ...target, stamina: Math.max(0, target.stamina - LUCK_BONUS_DAMAGE) };
    const nextEnemies = state.combat.enemies.map((e) => (e.id === target.id ? enemyAfterBonus : e));
    logEntries.push(createLogEntry("test", `A sorte sorri para você: +${LUCK_BONUS_DAMAGE} de dano em ${target.name}!`));

    const outcome = evaluateCombatOutcome(characterAfterCost, nextEnemies);

    if (outcome === "victory") {
      logEntries.push(createLogEntry("combatResult", "Vitória no combate!"));
      const defeatedIds = nextEnemies.filter((e) => e.stamina <= 0).map((e) => e.id);
      const rewards = applyVictoryRewards(state.book, characterAfterCost, defeatedIds);
      const fatigueResult = applyFatigueTick(state.book, rewards.character);

      set({
        character: fatigueResult.character,
        combat: { ...state.combat, enemies: nextEnemies, isActive: false },
        defeatedEnemies: [...state.defeatedEnemies, ...defeatedIds],
        log: [...state.log, ...logEntries, ...rewards.logEntries, ...fatigueResult.logEntries],
        luckTestAvailable: false,
        lastRoundResult: { ...state.lastRoundResult, luckBonus: { success: true, total: roll.total } },
        previousSectionId: nextPreviousSectionId(state.book, state),
      });
      enterSection(set, get, state.combat.onVictory);
      get().persist();
      return;
    }

    set({
      character: characterAfterCost,
      combat: { ...state.combat, enemies: nextEnemies },
      log: [...state.log, ...logEntries],
      luckTestAvailable: false,
      lastRoundResult: { ...state.lastRoundResult, luckBonus: { success: true, total: roll.total } },
    });
    get().persist();
  },

  useProvisionInCombat: () => {
    const state = get();
    if (!state.character || state.character.provisions <= 0) return;
    const nextCharacter: Character = {
      ...state.character,
      provisions: state.character.provisions - 1,
      stats: {
        ...state.character.stats,
        stamina: Math.min(state.character.stats.maxStamina, state.character.stats.stamina + 4),
      },
    };
    set({
      character: nextCharacter,
      log: [...state.log, createLogEntry("custom", "Provisão consumida: +4 de Energia.")],
    });
    get().persist();
  },

  fleeCombat: () => {
    const state = get();
    if (!state.book || !state.character || !state.combat || !state.combat.onFlee) return;
    const fleeTarget = state.combat.onFlee;
    const fatigueResult = applyFatigueTick(state.book, state.character);
    set({
      character: fatigueResult.character,
      combat: { ...state.combat, isActive: false },
      luckTestAvailable: false,
      log: [...state.log, createLogEntry("combatResult", "Você fugiu do combate."), ...fatigueResult.logEntries],
      previousSectionId: nextPreviousSectionId(state.book, state),
    });
    enterSection(set, get, fleeTarget);
    get().persist();
  },

  useItem: (itemId) => {
    const state = get();
    if (!state.book || !state.character) return;
    const item = findItem(state.book, itemId);
    if (!item) return;

    let nextStats = { ...state.character.stats };
    let nextGold = state.character.gold;
    let nextProvisions = state.character.provisions;

    for (const effect of item.onUseEffects ?? []) {
      if (effect.stat === "gold") nextGold += effect.value;
      else if (effect.stat === "provisions") nextProvisions += effect.value;
      else {
        const maxKey = `max${effect.stat.charAt(0).toUpperCase()}${effect.stat.slice(1)}` as keyof typeof nextStats;
        const max = nextStats[maxKey];
        nextStats = {
          ...nextStats,
          [effect.stat]: Math.max(0, Math.min(nextStats[effect.stat] + effect.value, max)),
        };
      }
    }

    let nextInventory = state.character.inventory;
    if (item.consumable) {
      const index = nextInventory.indexOf(itemId);
      nextInventory = [...nextInventory];
      if (index !== -1) nextInventory.splice(index, 1);
    }

    set({
      character: {
        ...state.character,
        stats: nextStats,
        gold: nextGold,
        provisions: nextProvisions,
        inventory: nextInventory,
      },
      log: [...state.log, createLogEntry("custom", `Item usado: ${item.name}`)],
    });
    get().persist();
  },

  equipItem: (itemId) => {
    const state = get();
    if (!state.book || !state.character) return;
    const item = findItem(state.book, itemId);
    if (!item) return;
    if (item.kind !== "weapon" && item.kind !== "armor") return;

    set({
      character: {
        ...state.character,
        equippedWeapon: item.kind === "weapon" ? itemId : state.character.equippedWeapon,
        equippedArmor: item.kind === "armor" ? itemId : state.character.equippedArmor,
      },
      log: [...state.log, createLogEntry("custom", `Equipado: ${item.name}`)],
    });
    get().persist();
  },

  unequipItem: (kind) => {
    const state = get();
    if (!state.character) return;
    set({
      character: {
        ...state.character,
        equippedWeapon: kind === "weapon" ? undefined : state.character.equippedWeapon,
        equippedArmor: kind === "armor" ? undefined : state.character.equippedArmor,
      },
    });
    get().persist();
  },

  discardItem: (itemId) => {
    const state = get();
    if (!state.book || !state.character) return;
    const item = findItem(state.book, itemId);
    if (item && item.discardable === false) return;
    const index = state.character.inventory.indexOf(itemId);
    if (index === -1) return;
    const nextInventory = [...state.character.inventory];
    nextInventory.splice(index, 1);
    set({
      character: { ...state.character, inventory: nextInventory },
      log: [...state.log, createLogEntry("itemRemoved", `Item descartado: ${item?.name ?? itemId}`)],
    });
    get().persist();
  },

  restAtSection: () => {
    const state = get();
    if (!state.book || !state.character || !state.currentSectionId) return;
    const section = getSection(state.book, state.currentSectionId);
    if (!section.allowRest || !isRuleEnabled(state.book, "restSystem")) return;
    if (state.character.provisions <= 0) return;

    if (section.restEncounter && Math.random() * 100 < section.restEncounter.chancePercent) {
      const { enemyIds, onVictory, onDefeat, onFlee } = section.restEncounter;
      const enemies = enemyIds
        .map((id) => state.book!.enemies.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e));
      const combat = createCombatState(enemies, onVictory, onDefeat, onFlee);
      set({
        combat,
        log: [...state.log, createLogEntry("combatResult", "Enquanto tenta descansar, você é surpreendido!")],
      });
      get().persist();
      return;
    }

    const result = restAtSectionPure(state.character);
    set({ character: result.character, log: [...state.log, ...result.logEntries] });
    get().persist();
  },

  eatAtSection: () => {
    const state = get();
    if (!state.book || !state.character || !state.currentSectionId) return;
    const section = getSection(state.book, state.currentSectionId);
    if (!section.allowEat) return;
    if (state.character.provisions <= 0) return;
    const result = eatAtSectionPure(state.character);
    set({ character: result.character, log: [...state.log, ...result.logEntries] });
    get().persist();
  },

  persist: () => {
    const state = get();
    const save = toSave(state);
    if (save) saveGame(save);
  },

  exportCurrentSave: () => {
    const save = toSave(get());
    return save ? exportSave(save) : null;
  },

  importSaveFile: (json) => {
    const result = importSave(json);
    if (!result.success || !result.save) {
      return { success: false, error: result.error ?? "Erro desconhecido." };
    }
    const save = result.save;
    set({
      currentSectionId: save.currentSectionId,
      character: save.character,
      flags: save.flags,
      visitedSections: save.visitedSections,
      choicesMade: save.choicesMade,
      defeatedEnemies: save.defeatedEnemies,
      combat: save.combat,
      pendingTest: save.pendingTest,
      log: save.log,
      isFinished: save.isFinished,
      ending: save.ending,
      rulesAcknowledged: save.rulesAcknowledged ?? false,
      lastRoundResult: null,
      lastTestOutcome: null,
      luckTestAvailable: false,
      previousSectionId: save.previousSectionId ?? null,
    });
    saveGame(save);
    return { success: true };
  },

  deleteCurrentSave: () => {
    const { book } = get();
    if (book) deleteSave(book.id);
  },
}));

/**
 * Processa a entrada em uma nova seção: aplica `onEnter`, resolve combate/teste
 * automáticos e atualiza o estado. Função auxiliar interna (não exportada como
 * hook) para evitar duplicação entre `startNewGame`, `selectChoice`, etc.
 */
function enterSection(
  set: (partial: Partial<GameSessionState>) => void,
  get: () => GameSessionState,
  sectionId: string
) {
  const state = get();
  if (!state.book || !state.character) return;

  const section = getSection(state.book, sectionId);
  const result = processSectionEntry(state.book, section, state.character, state.flags);

  const visited = state.visitedSections.includes(sectionId)
    ? state.visitedSections
    : [...state.visitedSections, sectionId];

  const sectionLogEntry = createLogEntry(
    "section",
    `Seção: ${section.title ?? section.id}`
  );

  const willRedirect = Boolean(result.redirectSectionId && result.redirectSectionId !== sectionId);

  set({
    character: result.character,
    flags: result.flags,
    currentSectionId: result.redirectSectionId ?? sectionId,
    visitedSections: visited,
    combat: result.combat ?? state.combat,
    pendingTest: result.pendingTest ?? null,
    lastTestOutcome: result.pendingTest ? null : state.lastTestOutcome,
    lastRoundResult: result.combat ? null : state.lastRoundResult,
    ending: result.ending,
    isFinished: Boolean(result.ending),
    log: [...state.log, sectionLogEntry, ...result.logEntries],
  });

  if (willRedirect) {
    enterSection(set, get, result.redirectSectionId!);
    return;
  }

  syncLibraryProgress(get(), visited);
}

/**
 * Espelha status/progresso de leitura em `user_library` (Supabase), fire-and-
 * -forget — nunca bloqueia a leitura local, que continua funcionando via
 * `localStorage` independente disso. Só roda quando o livro atual já está
 * sincronizado com o backend (`supabaseBookId`) e há um usuário logado.
 * `progress` é uma estimativa grosseira (seções visitadas / total de
 * seções) — em livros com ramos mutuamente exclusivos, 100% pode nunca ser
 * alcançável por design, o que é esperado para essa métrica.
 */
function syncLibraryProgress(state: GameSessionState, visited: string[]) {
  if (!state.book || !state.character || !state.currentSectionId) return;

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) return;

  const entry = useLibraryStore.getState().entries.find((e) => e.book.id === state.book!.id);
  if (!entry?.supabaseBookId) return;

  const save = toSave(state);
  if (!save) return;

  const totalSections = Object.keys(state.book.sections).length;
  const progress = totalSections > 0 ? Math.min(100, Math.round((visited.length / totalSections) * 100)) : 0;

  void syncReadingProgress(currentUser.id, entry.supabaseBookId, {
    readingStatus: state.isFinished ? "completed" : "in_progress",
    progress,
    currentSectionId: state.currentSectionId,
    saveData: save,
    completedAt: state.isFinished ? new Date().toISOString() : undefined,
  });
}

/** Utilitário para criar o personagem inicial fora do componente de criação. */
export function createCharacterFromRolls(
  name: string,
  stats: { skill: number; stamina: number; luck: number },
  gold: number,
  provisions: number
): Character {
  return buildInitialCharacter(name, stats, gold, provisions);
}

export function generateEnemyLogId(): string {
  return generateId("enemy");
}

export type { EnemyState };
