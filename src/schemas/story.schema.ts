import { z } from "zod";

export const diceFormulaSchema = z.object({
  dice: z.number().int().min(0).max(10),
  sides: z.number().int().min(2).max(100),
  modifier: z.number().int(),
});

export const characterCreationRulesSchema = z.object({
  skill: diceFormulaSchema,
  stamina: diceFormulaSchema,
  luck: diceFormulaSchema,
  gold: z.number().int().min(0),
  provisions: z.number().int().min(0),
});

export const itemKindSchema = z.enum(["weapon", "armor", "consumable", "key", "misc"]);

export const itemEffectSchema = z.object({
  stat: z.enum(["skill", "stamina", "luck", "gold", "provisions"]),
  value: z.number().int(),
});

export const storyItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  kind: itemKindSchema,
  damageBonus: z.number().int().optional(),
  defenseBonus: z.number().int().optional(),
  onUseEffects: z.array(itemEffectSchema).optional(),
  consumable: z.boolean().optional(),
  discardable: z.boolean().optional(),
  icon: z.string().optional(),
  examineText: z.string().optional(),
  examineImage: z.string().optional(),
});

export const storyEnemySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  skill: z.number().int(),
  stamina: z.number().int().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  defeatText: z.string().optional(),
  points: z.number().int().min(0).optional(),
  lootItemId: z.string().optional(),
  lootChancePercent: z.number().min(0).max(100).optional(),
});

const baseConditionFields = { negate: z.boolean().optional() };

export const conditionSchema: z.ZodType = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hasItem"), itemId: z.string(), ...baseConditionFields }),
  z.object({ type: z.literal("notHasItem"), itemId: z.string(), ...baseConditionFields }),
  z.object({
    type: z.enum(["statGreater", "statLess", "statEqual"]),
    stat: z.enum(["skill", "stamina", "luck"]),
    value: z.number().int(),
    ...baseConditionFields,
  }),
  z.object({ type: z.literal("flagActive"), flag: z.string(), ...baseConditionFields }),
  z.object({ type: z.literal("flagInactive"), flag: z.string(), ...baseConditionFields }),
  z.object({ type: z.literal("minGold"), value: z.number().int(), ...baseConditionFields }),
  z.object({ type: z.literal("enemyDefeated"), enemyId: z.string(), ...baseConditionFields }),
  z.object({ type: z.literal("sectionVisited"), sectionId: z.string(), ...baseConditionFields }),
  z.object({ type: z.literal("choiceMade"), choiceId: z.string(), ...baseConditionFields }),
]);

export const actionSchema: z.ZodType = z.discriminatedUnion("type", [
  z.object({ type: z.literal("addItem"), itemId: z.string() }),
  z.object({ type: z.literal("removeItem"), itemId: z.string() }),
  z.object({
    type: z.literal("modifyStat"),
    stat: z.enum(["skill", "stamina", "luck"]),
    value: z.number().int(),
  }),
  z.object({
    type: z.literal("restoreStat"),
    stat: z.enum(["skill", "stamina", "luck"]),
    value: z.number().int().optional(),
  }),
  z.object({ type: z.literal("addGold"), value: z.number().int().min(0) }),
  z.object({ type: z.literal("removeGold"), value: z.number().int().min(0) }),
  z.object({ type: z.literal("addProvisions"), value: z.number().int().min(0) }),
  z.object({ type: z.literal("removeProvisions"), value: z.number().int().min(0) }),
  z.object({ type: z.literal("setFlag"), flag: z.string() }),
  z.object({ type: z.literal("clearFlag"), flag: z.string() }),
  z.object({ type: z.literal("logEvent"), message: z.string() }),
  z.object({
    type: z.literal("startCombat"),
    enemyIds: z.array(z.string()).min(1),
    onVictory: z.string(),
    onDefeat: z.string(),
    onFlee: z.string().optional(),
  }),
  z.object({
    type: z.literal("startTest"),
    testType: z.enum(["luck", "skill", "attribute", "fixed"]),
    stat: z.enum(["skill", "stamina", "luck"]).optional(),
    fixedValue: z.number().int().optional(),
    onSuccess: z.string(),
    onFailure: z.string(),
  }),
  z.object({ type: z.literal("goToSection"), sectionId: z.string() }),
  z.object({
    type: z.literal("endStory"),
    ending: z.enum(["victory", "defeat", "neutral"]),
    title: z.string(),
    text: z.string(),
  }),
]);

export const choiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  target: z.string().min(1),
  conditions: z.array(conditionSchema).optional(),
  lockedReason: z.string().optional(),
  actions: z.array(actionSchema).optional(),
});

export const restEncounterSchema = z.object({
  chancePercent: z.number().min(0).max(100),
  enemyIds: z.array(z.string()).min(1),
  onVictory: z.string(),
  onDefeat: z.string(),
  onFlee: z.string().optional(),
});

export const storySectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  paragraphs: z.array(z.string()).min(1),
  image: z.string().optional(),
  onEnter: z.array(actionSchema).optional(),
  choices: z.array(choiceSchema),
  canRepeat: z.boolean().optional(),
  allowRest: z.boolean().optional(),
  allowEat: z.boolean().optional(),
  restEncounter: restEncounterSchema.optional(),
});

export const rulesConfigSchema = z.object({
  useDefaultRules: z.boolean().optional(),
  fatigueSystem: z.boolean().optional(),
  provisions: z.boolean().optional(),
  restSystem: z.boolean().optional(),
  combatLuck: z.boolean().optional(),
});

export const gameBookSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1),
  genre: z.string().optional(),
  estimatedDuration: z.string().optional(),
  ageRating: z.string().optional(),
  cover: z.string().optional(),
  rulesText: z.string().optional(),
  rules: rulesConfigSchema.optional(),
  startSection: z.string().min(1),
  characterCreation: characterCreationRulesSchema,
  items: z.array(storyItemSchema),
  enemies: z.array(storyEnemySchema),
  sections: z.record(storySectionSchema),
});

export type GameBookParsed = z.infer<typeof gameBookSchema>;

/**
 * Valida um objeto desconhecido (ex.: vindo de fetch/import de JSON) contra o
 * schema de livro-jogo. Retorna um resultado discriminado, nunca lança.
 */
export function validateGameBook(data: unknown) {
  const result = gameBookSchema.safeParse(data);
  if (!result.success) {
    return { success: false as const, error: result.error };
  }

  const book = result.data;
  const errors: string[] = [];

  // Validações estruturais adicionais que o Zod sozinho não cobre bem:
  if (!book.sections[book.startSection]) {
    errors.push(`Seção inicial "${book.startSection}" não existe em "sections".`);
  }

  const itemIds = new Set(book.items.map((i) => i.id));
  const enemyIds = new Set(book.enemies.map((e) => e.id));
  const sectionIds = new Set(Object.keys(book.sections));

  for (const enemy of book.enemies) {
    if (enemy.lootItemId && !itemIds.has(enemy.lootItemId)) {
      errors.push(`Inimigo "${enemy.id}": lootItemId referencia item inexistente "${enemy.lootItemId}".`);
    }
  }

  for (const section of Object.values(book.sections)) {
    for (const choice of section.choices) {
      if (!sectionIds.has(choice.target)) {
        errors.push(
          `Seção "${section.id}": escolha "${choice.id}" aponta para seção inexistente "${choice.target}".`
        );
      }
      for (const cond of choice.conditions ?? []) {
        if (cond.type === "hasItem" || cond.type === "notHasItem") {
          if (!itemIds.has(cond.itemId)) {
            errors.push(`Seção "${section.id}": condição referencia item inexistente "${cond.itemId}".`);
          }
        }
        if (cond.type === "enemyDefeated" && !enemyIds.has(cond.enemyId)) {
          errors.push(`Seção "${section.id}": condição referencia inimigo inexistente "${cond.enemyId}".`);
        }
      }
      for (const action of choice.actions ?? []) {
        if (action.type === "startCombat") {
          for (const enemyId of action.enemyIds) {
            if (!enemyIds.has(enemyId)) {
              errors.push(`Seção "${section.id}": combate referencia inimigo inexistente "${enemyId}".`);
            }
          }
        }
      }
    }

    if (section.restEncounter) {
      const { enemyIds: restEnemyIds, onVictory, onDefeat, onFlee } = section.restEncounter;
      for (const enemyId of restEnemyIds) {
        if (!enemyIds.has(enemyId)) {
          errors.push(`Seção "${section.id}": restEncounter referencia inimigo inexistente "${enemyId}".`);
        }
      }
      for (const target of [onVictory, onDefeat, onFlee]) {
        if (target && !sectionIds.has(target)) {
          errors.push(`Seção "${section.id}": restEncounter referencia seção inexistente "${target}".`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return { success: false as const, error: errors };
  }

  return { success: true as const, data: book };
}
