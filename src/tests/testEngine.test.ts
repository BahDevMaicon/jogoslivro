import { describe, expect, it, vi, afterEach } from "vitest";
import * as diceEngine from "@/engine/diceEngine";
import { resolveLuckTest, resolveAttributeTest, resolveTest } from "@/engine/testEngine";
import type { Character } from "@/types/game";

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Testador",
    stats: { skill: 8, maxSkill: 10, stamina: 15, maxStamina: 20, luck: 7, maxLuck: 8 },
    gold: 0,
    provisions: 0,
    inventory: [],
    activeEffects: [],
    score: 0,
    fatigue: 0,
    ...overrides,
  };
}

function mockRoll2d6(total: number, rolls: [number, number]) {
  vi.spyOn(diceEngine, "roll2d6").mockReturnValue({ rolls, sides: 6, modifier: 0, total });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("testEngine", () => {
  it("resolveLuckTest succeeds when the roll is less than or equal to Luck", () => {
    mockRoll2d6(6, [3, 3]);
    const character = makeCharacter({ stats: { ...makeCharacter().stats, luck: 7 } });
    const outcome = resolveLuckTest(character, { testType: "luck", onSuccess: "A", onFailure: "B" });
    expect(outcome.success).toBe(true);
    expect(outcome.nextSectionId).toBe("A");
    expect(outcome.luckPenaltyApplied).toBe(true);
  });

  it("resolveLuckTest fails when the roll exceeds Luck", () => {
    mockRoll2d6(11, [6, 5]);
    const character = makeCharacter({ stats: { ...makeCharacter().stats, luck: 7 } });
    const outcome = resolveLuckTest(character, { testType: "luck", onSuccess: "A", onFailure: "B" });
    expect(outcome.success).toBe(false);
    expect(outcome.nextSectionId).toBe("B");
  });

  it("resolveAttributeTest succeeds when the roll is within the tested attribute", () => {
    mockRoll2d6(5, [2, 3]);
    const character = makeCharacter({ stats: { ...makeCharacter().stats, skill: 8 } });
    const outcome = resolveAttributeTest(character, {
      testType: "skill",
      stat: "skill",
      onSuccess: "A",
      onFailure: "B",
    });
    expect(outcome.success).toBe(true);
    expect(outcome.luckPenaltyApplied).toBe(false);
  });

  it("resolveAttributeTest with a fixed value succeeds when the roll meets or exceeds the target", () => {
    mockRoll2d6(9, [5, 4]);
    const character = makeCharacter();
    const outcome = resolveAttributeTest(character, {
      testType: "fixed",
      fixedValue: 8,
      onSuccess: "A",
      onFailure: "B",
    });
    expect(outcome.success).toBe(true);
  });

  it("resolveTest dispatches to the luck test for testType 'luck'", () => {
    mockRoll2d6(4, [2, 2]);
    const character = makeCharacter({ stats: { ...makeCharacter().stats, luck: 7 } });
    const outcome = resolveTest(character, { testType: "luck", onSuccess: "A", onFailure: "B" });
    expect(outcome.luckPenaltyApplied).toBe(true);
  });

  it("resolveTest dispatches to the attribute test for other test types", () => {
    mockRoll2d6(4, [2, 2]);
    const character = makeCharacter();
    const outcome = resolveTest(character, { testType: "skill", stat: "skill", onSuccess: "A", onFailure: "B" });
    expect(outcome.luckPenaltyApplied).toBe(false);
  });
});
