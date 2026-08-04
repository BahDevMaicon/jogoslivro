import type { Action, GameBook } from "@/types/story";
import type { Character, LogEntry } from "@/types/game";
import { createLogEntry } from "@/utils/log";

export interface ActionResult {
  character: Character;
  flags: Record<string, boolean>;
  logEntries: LogEntry[];
  /** Definido quando uma ação pede navegação explícita (goToSection/endStory tratados fora daqui) */
  redirectSectionId?: string;
}

const clampStat = (value: number, max: number) => Math.max(0, Math.min(value, max));

/**
 * Aplica uma lista de ações "simples" (não-navegacionais) sobre o personagem
 * e as flags, retornando um novo estado (imutável) e as entradas de log geradas.
 * Ações de navegação (goToSection, startCombat, startTest, endStory) devem ser
 * tratadas pelo storyEngine, que orquestra a transição de seção.
 */
export function applyActions(
  actions: Action[] | undefined,
  character: Character,
  flags: Record<string, boolean>,
  book: GameBook
): ActionResult {
  const nextCharacter: Character = {
    ...character,
    stats: { ...character.stats },
    inventory: [...character.inventory],
    activeEffects: [...character.activeEffects],
  };
  const nextFlags = { ...flags };
  const logEntries: LogEntry[] = [];

  for (const action of actions ?? []) {
    switch (action.type) {
      case "addItem": {
        nextCharacter.inventory.push(action.itemId);
        const item = book.items.find((i) => i.id === action.itemId);
        logEntries.push(
          createLogEntry("itemGained", `Item recebido: ${item?.name ?? action.itemId}`)
        );
        break;
      }
      case "removeItem": {
        const index = nextCharacter.inventory.indexOf(action.itemId);
        if (index !== -1) {
          nextCharacter.inventory.splice(index, 1);
          const item = book.items.find((i) => i.id === action.itemId);
          logEntries.push(
            createLogEntry("itemRemoved", `Item removido: ${item?.name ?? action.itemId}`)
          );
        }
        break;
      }
      case "modifyStat": {
        const maxKey = `max${capitalize(action.stat)}` as keyof typeof nextCharacter.stats;
        const current = nextCharacter.stats[action.stat];
        const max = nextCharacter.stats[maxKey];
        const updated = clampStat(current + action.value, max);
        nextCharacter.stats = { ...nextCharacter.stats, [action.stat]: updated };
        logEntries.push(
          createLogEntry(
            "statChange",
            `${statLabel(action.stat)} ${action.value >= 0 ? "+" : ""}${action.value} (agora ${updated})`
          )
        );
        break;
      }
      case "restoreStat": {
        const maxKey = `max${capitalize(action.stat)}` as keyof typeof nextCharacter.stats;
        const max = nextCharacter.stats[maxKey];
        const updated = action.value !== undefined ? clampStat(action.value, max) : max;
        nextCharacter.stats = { ...nextCharacter.stats, [action.stat]: updated };
        logEntries.push(createLogEntry("statChange", `${statLabel(action.stat)} restaurado para ${updated}`));
        break;
      }
      case "addGold": {
        nextCharacter.gold += action.value;
        logEntries.push(createLogEntry("statChange", `Ouro +${action.value} (agora ${nextCharacter.gold})`));
        break;
      }
      case "removeGold": {
        nextCharacter.gold = Math.max(0, nextCharacter.gold - action.value);
        logEntries.push(createLogEntry("statChange", `Ouro -${action.value} (agora ${nextCharacter.gold})`));
        break;
      }
      case "addProvisions": {
        nextCharacter.provisions += action.value;
        logEntries.push(
          createLogEntry("statChange", `Provisões +${action.value} (agora ${nextCharacter.provisions})`)
        );
        break;
      }
      case "removeProvisions": {
        nextCharacter.provisions = Math.max(0, nextCharacter.provisions - action.value);
        logEntries.push(
          createLogEntry("statChange", `Provisões -${action.value} (agora ${nextCharacter.provisions})`)
        );
        break;
      }
      case "setFlag": {
        nextFlags[action.flag] = true;
        break;
      }
      case "clearFlag": {
        nextFlags[action.flag] = false;
        break;
      }
      case "logEvent": {
        logEntries.push(createLogEntry("custom", action.message));
        break;
      }
      // goToSection, startCombat, startTest, endStory são tratados pelo storyEngine
      case "goToSection":
      case "startCombat":
      case "startTest":
      case "endStory":
        break;
      default: {
        const exhaustiveCheck: never = action;
        void exhaustiveCheck;
      }
    }
  }

  return { character: nextCharacter, flags: nextFlags, logEntries };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statLabel(stat: string): string {
  switch (stat) {
    case "skill":
      return "Habilidade";
    case "stamina":
      return "Energia";
    case "luck":
      return "Sorte";
    default:
      return stat;
  }
}
