import { describe, expect, it } from "vitest";
import { rollDie, rollDice, roll2d6, rollFormula } from "@/engine/diceEngine";

describe("diceEngine", () => {
  it("rollDie returns a value within [1, sides]", () => {
    for (let i = 0; i < 200; i++) {
      const value = rollDie(6);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    }
  });

  it("rollDice returns the correct number of rolls and a consistent total", () => {
    const result = rollDice(3, 6, 2);
    expect(result.rolls).toHaveLength(3);
    const sum = result.rolls.reduce((a, b) => a + b, 0);
    expect(result.total).toBe(sum + 2);
  });

  it("rollDice with count 0 returns an empty roll list and total equal to modifier", () => {
    const result = rollDice(0, 6, 5);
    expect(result.rolls).toHaveLength(0);
    expect(result.total).toBe(5);
  });

  it("roll2d6 always rolls exactly two six-sided dice", () => {
    const result = roll2d6();
    expect(result.rolls).toHaveLength(2);
    expect(result.sides).toBe(6);
    result.rolls.forEach((r) => {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    });
  });

  it("rollFormula applies the dice formula correctly", () => {
    const result = rollFormula({ dice: 2, sides: 6, modifier: 12 });
    expect(result.rolls).toHaveLength(2);
    expect(result.total).toBeGreaterThanOrEqual(2 + 12);
    expect(result.total).toBeLessThanOrEqual(12 + 12);
  });
});
