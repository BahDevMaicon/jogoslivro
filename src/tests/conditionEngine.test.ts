import { describe, expect, it } from "vitest";
import { evaluateCondition, evaluateConditions, type ConditionContext } from "@/engine/conditionEngine";
import type { Character } from "@/types/game";

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Testador",
    stats: { skill: 8, maxSkill: 8, stamina: 20, maxStamina: 20, luck: 7, maxLuck: 7 },
    gold: 10,
    provisions: 5,
    inventory: ["sword"],
    activeEffects: [],
    score: 0,
    fatigue: 0,
    ...overrides,
  };
}

function makeContext(overrides: Partial<ConditionContext> = {}): ConditionContext {
  return {
    character: makeCharacter(),
    flags: { "met-king": true },
    visitedSections: ["1", "2"],
    choicesMade: ["choice-a"],
    defeatedEnemies: ["goblin"],
    ...overrides,
  };
}

describe("conditionEngine", () => {
  it("hasItem returns true when the item is in the inventory", () => {
    const ctx = makeContext();
    expect(evaluateCondition({ type: "hasItem", itemId: "sword" }, ctx)).toBe(true);
    expect(evaluateCondition({ type: "hasItem", itemId: "shield" }, ctx)).toBe(false);
  });

  it("notHasItem is the inverse of hasItem", () => {
    const ctx = makeContext();
    expect(evaluateCondition({ type: "notHasItem", itemId: "shield" }, ctx)).toBe(true);
    expect(evaluateCondition({ type: "notHasItem", itemId: "sword" }, ctx)).toBe(false);
  });

  it("statGreater, statLess and statEqual compare the correct stat", () => {
    const ctx = makeContext();
    expect(evaluateCondition({ type: "statGreater", stat: "skill", value: 5 }, ctx)).toBe(true);
    expect(evaluateCondition({ type: "statLess", stat: "skill", value: 5 }, ctx)).toBe(false);
    expect(evaluateCondition({ type: "statEqual", stat: "luck", value: 7 }, ctx)).toBe(true);
  });

  it("flagActive and flagInactive read from the flags map", () => {
    const ctx = makeContext();
    expect(evaluateCondition({ type: "flagActive", flag: "met-king" }, ctx)).toBe(true);
    expect(evaluateCondition({ type: "flagInactive", flag: "met-king" }, ctx)).toBe(false);
    expect(evaluateCondition({ type: "flagInactive", flag: "unknown-flag" }, ctx)).toBe(true);
  });

  it("minGold compares against the character's gold", () => {
    const ctx = makeContext();
    expect(evaluateCondition({ type: "minGold", value: 10 }, ctx)).toBe(true);
    expect(evaluateCondition({ type: "minGold", value: 11 }, ctx)).toBe(false);
  });

  it("enemyDefeated, sectionVisited and choiceMade check the corresponding lists", () => {
    const ctx = makeContext();
    expect(evaluateCondition({ type: "enemyDefeated", enemyId: "goblin" }, ctx)).toBe(true);
    expect(evaluateCondition({ type: "sectionVisited", sectionId: "2" }, ctx)).toBe(true);
    expect(evaluateCondition({ type: "sectionVisited", sectionId: "99" }, ctx)).toBe(false);
    expect(evaluateCondition({ type: "choiceMade", choiceId: "choice-a" }, ctx)).toBe(true);
  });

  it("negate flips the result of any condition", () => {
    const ctx = makeContext();
    expect(evaluateCondition({ type: "hasItem", itemId: "sword", negate: true }, ctx)).toBe(false);
  });

  it("evaluateConditions requires all conditions to be true (AND logic)", () => {
    const ctx = makeContext();
    expect(
      evaluateConditions(
        [
          { type: "hasItem", itemId: "sword" },
          { type: "minGold", value: 5 },
        ],
        ctx
      )
    ).toBe(true);

    expect(
      evaluateConditions(
        [
          { type: "hasItem", itemId: "sword" },
          { type: "minGold", value: 999 },
        ],
        ctx
      )
    ).toBe(false);
  });

  it("evaluateConditions returns true for an empty or undefined list", () => {
    const ctx = makeContext();
    expect(evaluateConditions(undefined, ctx)).toBe(true);
    expect(evaluateConditions([], ctx)).toBe(true);
  });
});
