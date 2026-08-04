import type { Action, Choice, GameBook, RulesConfig, StorySection } from "@/types/story";
import type { Character, CombatState, GameSave, LogEntry, PendingTest } from "@/types/game";
import { evaluateConditions, type ConditionContext } from "./conditionEngine";
import { applyActions } from "./actionEngine";
import { createCombatState } from "./combatEngine";
import { createLogEntry } from "@/utils/log";

export function getSection(book: GameBook, sectionId: string): StorySection {
  const section = book.sections[sectionId];
  if (!section) {
    throw new Error(`Seção "${sectionId}" não encontrada na história "${book.id}".`);
  }
  return section;
}

/** Lê uma flag de `book.rules`, com default `true` quando omitida (regras padrão ativas). */
export function isRuleEnabled(book: GameBook, key: keyof RulesConfig): boolean {
  return book.rules?.[key] ?? true;
}

/**
 * Determina se uma escolha está disponível para o estado atual do jogo: falso
 * se já foi feita e a seção não permite repetição (`canRepeat`), senão segue
 * as `conditions` normalmente.
 */
export function isChoiceAvailable(choice: Choice, section: StorySection, ctx: ConditionContext): boolean {
  if (!section.canRepeat && ctx.choicesMade.includes(choice.id)) return false;
  return evaluateConditions(choice.conditions, ctx);
}

const REPEAT_LOCK_MESSAGE = "Você já seguiu por este caminho e não pode repeti-lo.";

/** Motivo a exibir quando uma escolha está bloqueada: mensagem de repetição, `lockedReason` do autor, ou nada se habilitada. */
export function getChoiceLockReason(choice: Choice, section: StorySection, ctx: ConditionContext): string | undefined {
  if (!section.canRepeat && ctx.choicesMade.includes(choice.id)) return REPEAT_LOCK_MESSAGE;
  if (!evaluateConditions(choice.conditions, ctx)) return choice.lockedReason;
  return undefined;
}

const FATIGUE_EXHAUSTION_MESSAGE =
  "A longa jornada começa a cobrar seu preço. Sem descanso e alimentação suficientes, seu corpo enfraquece.";

/**
 * Incrementa a fadiga em 1 (se `fatigueSystem` estiver ativo) e sorteia um
 * limiar entre 7 e 10; ao atingi-lo, dispara a exaustão automática (-2 de
 * Energia, fadiga zerada). Chamada uma vez por transição real de seção.
 */
export function applyFatigueTick(book: GameBook, character: Character): { character: Character; logEntries: LogEntry[] } {
  if (!isRuleEnabled(book, "fatigueSystem")) {
    return { character, logEntries: [] };
  }

  const nextFatigue = (character.fatigue ?? 0) + 1;
  const threshold = 7 + Math.floor(Math.random() * 4); // 7..10

  if (nextFatigue >= threshold) {
    return {
      character: {
        ...character,
        fatigue: 0,
        stats: { ...character.stats, stamina: Math.max(0, character.stats.stamina - 2) },
      },
      logEntries: [
        createLogEntry("custom", FATIGUE_EXHAUSTION_MESSAGE),
        createLogEntry("statChange", "Exaustão: -2 de Energia. Fadiga zerada."),
      ],
    };
  }

  return {
    character: { ...character, fatigue: nextFatigue },
    logEntries: [],
  };
}

/** Descansar: consome 1 Provisão, restaura 4 de Energia (nunca acima do máximo), zera a Fadiga. */
export function restAtSection(character: Character): { character: Character; logEntries: LogEntry[] } {
  if (character.provisions <= 0) return { character, logEntries: [] };
  return {
    character: {
      ...character,
      provisions: character.provisions - 1,
      fatigue: 0,
      stats: {
        ...character.stats,
        stamina: Math.min(character.stats.maxStamina, character.stats.stamina + 4),
      },
    },
    logEntries: [createLogEntry("rest", "Você descansou: -1 Provisão, +4 de Energia, Fadiga zerada.")],
  };
}

/** Comer: consome 1 Provisão, zera a Fadiga. */
export function eatAtSection(character: Character): { character: Character; logEntries: LogEntry[] } {
  if (character.provisions <= 0) return { character, logEntries: [] };
  return {
    character: { ...character, provisions: character.provisions - 1, fatigue: 0 },
    logEntries: [createLogEntry("eat", "Você comeu: -1 Provisão, Fadiga zerada.")],
  };
}

export interface SectionEntryResult {
  character: Character;
  flags: Record<string, boolean>;
  logEntries: LogEntry[];
  combat: CombatState | null;
  pendingTest: PendingTest | null;
  ending: GameSave["ending"];
  /** Se onEnter redirecionar para outra seção (goToSection/endStory), o id é retornado aqui */
  redirectSectionId: string | null;
}

/**
 * Processa as ações `onEnter` de uma seção. Pode desencadear combate, teste
 * pendente, redirecionamento imediato ou finalização da história.
 */
export function processSectionEntry(
  book: GameBook,
  section: StorySection,
  character: Character,
  flags: Record<string, boolean>
): SectionEntryResult {
  const simpleActions = (section.onEnter ?? []).filter(
    (a): a is Exclude<Action, { type: "goToSection" | "startCombat" | "startTest" | "endStory" }> =>
      !["goToSection", "startCombat", "startTest", "endStory"].includes(a.type)
  );

  const { character: nextCharacter, flags: nextFlags, logEntries } = applyActions(
    simpleActions,
    character,
    flags,
    book
  );

  let combat: CombatState | null = null;
  let pendingTest: PendingTest | null = null;
  let ending: GameSave["ending"] = null;
  let redirectSectionId: string | null = null;

  for (const action of section.onEnter ?? []) {
    if (action.type === "startCombat") {
      const enemies = action.enemyIds
        .map((id) => book.enemies.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e));
      combat = createCombatState(enemies, action.onVictory, action.onDefeat, action.onFlee);
      logEntries.push(createLogEntry("combatResult", `Combate iniciado: ${enemies.map((e) => e.name).join(", ")}`));
    } else if (action.type === "startTest") {
      pendingTest = {
        testType: action.testType,
        stat: action.stat,
        fixedValue: action.fixedValue,
        onSuccess: action.onSuccess,
        onFailure: action.onFailure,
      };
    } else if (action.type === "goToSection") {
      redirectSectionId = action.sectionId;
    } else if (action.type === "endStory") {
      ending = { type: action.ending, title: action.title, text: action.text };
      logEntries.push(createLogEntry("custom", `Final alcançado: ${action.title}`));
    }
  }

  return {
    character: nextCharacter,
    flags: nextFlags,
    logEntries,
    combat,
    pendingTest,
    ending,
    redirectSectionId,
  };
}

export interface ChoiceExecutionResult {
  character: Character;
  flags: Record<string, boolean>;
  logEntries: LogEntry[];
  targetSectionId: string;
}

/** Executa as ações associadas a uma escolha e determina a seção de destino. */
export function executeChoice(
  book: GameBook,
  choice: Choice,
  character: Character,
  flags: Record<string, boolean>
): ChoiceExecutionResult {
  const { character: nextCharacter, flags: nextFlags, logEntries } = applyActions(
    choice.actions,
    character,
    flags,
    book
  );

  logEntries.unshift(createLogEntry("choice", `Escolha: ${choice.text}`));

  // Uma ação goToSection explícita sobrepõe o `target` padrão da escolha.
  const redirect = (choice.actions ?? []).find((a) => a.type === "goToSection");
  const targetSectionId =
    redirect && redirect.type === "goToSection" ? redirect.sectionId : choice.target;

  return { character: nextCharacter, flags: nextFlags, logEntries, targetSectionId };
}

/** Cria o personagem inicial a partir das regras de criação da história e dos valores rolados. */
export function buildInitialCharacter(
  name: string,
  stats: { skill: number; stamina: number; luck: number },
  gold: number,
  provisions: number
): Character {
  return {
    name: name.trim() || "Aventureiro",
    stats: {
      skill: stats.skill,
      maxSkill: stats.skill,
      stamina: stats.stamina,
      maxStamina: stats.stamina,
      luck: stats.luck,
      maxLuck: stats.luck,
    },
    gold,
    provisions,
    inventory: [],
    activeEffects: [],
    score: 0,
    fatigue: 0,
  };
}
