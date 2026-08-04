import type { Condition } from "@/types/story";
import type { Character } from "@/types/game";

export interface ConditionContext {
  character: Character;
  flags: Record<string, boolean>;
  visitedSections: string[];
  choicesMade: string[];
  defeatedEnemies: string[];
}

function evaluateSingle(condition: Condition, ctx: ConditionContext): boolean {
  switch (condition.type) {
    case "hasItem":
      return ctx.character.inventory.includes(condition.itemId);
    case "notHasItem":
      return !ctx.character.inventory.includes(condition.itemId);
    case "statGreater":
      return ctx.character.stats[condition.stat] > condition.value;
    case "statLess":
      return ctx.character.stats[condition.stat] < condition.value;
    case "statEqual":
      return ctx.character.stats[condition.stat] === condition.value;
    case "flagActive":
      return Boolean(ctx.flags[condition.flag]);
    case "flagInactive":
      return !ctx.flags[condition.flag];
    case "minGold":
      return ctx.character.gold >= condition.value;
    case "enemyDefeated":
      return ctx.defeatedEnemies.includes(condition.enemyId);
    case "sectionVisited":
      return ctx.visitedSections.includes(condition.sectionId);
    case "choiceMade":
      return ctx.choicesMade.includes(condition.choiceId);
    default: {
      const exhaustiveCheck: never = condition;
      return exhaustiveCheck;
    }
  }
}

/** Avalia uma única condição, respeitando a flag `negate`. */
export function evaluateCondition(condition: Condition, ctx: ConditionContext): boolean {
  const result = evaluateSingle(condition, ctx);
  return condition.negate ? !result : result;
}

/** Avalia uma lista de condições em modo E lógico (todas devem ser verdadeiras). */
export function evaluateConditions(
  conditions: Condition[] | undefined,
  ctx: ConditionContext
): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, ctx));
}
