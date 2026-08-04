import { describe, expect, it, vi, afterEach } from "vitest";
import * as diceEngine from "@/engine/diceEngine";
import {
  applyRoundDamage,
  calculateAttackStrength,
  createCombatState,
  evaluateCombatOutcome,
  resolveCombatLuckBonus,
  resolveCombatRound,
} from "@/engine/combatEngine";
import type { Character, EnemyState } from "@/types/game";
import type { StoryEnemy } from "@/types/story";

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Testador",
    stats: { skill: 8, maxSkill: 10, stamina: 10, maxStamina: 20, luck: 7, maxLuck: 8 },
    gold: 0,
    provisions: 0,
    inventory: [],
    activeEffects: [],
    score: 0,
    fatigue: 0,
    ...overrides,
  };
}

function makeEnemy(overrides: Partial<EnemyState> = {}): EnemyState {
  return { id: "goblin", name: "Goblin", skill: 5, stamina: 6, maxStamina: 6, ...overrides };
}

function mockRolls(...totals: number[]) {
  const spy = vi.spyOn(diceEngine, "roll2d6");
  totals.forEach((total) => {
    spy.mockReturnValueOnce({ rolls: [Math.ceil(total / 2), Math.floor(total / 2)], sides: 6, modifier: 0, total });
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("combatEngine", () => {
  it("createCombatState builds enemy states from story enemies", () => {
    const storyEnemies: StoryEnemy[] = [{ id: "goblin", name: "Goblin", skill: 5, stamina: 6 }];
    const combat = createCombatState(storyEnemies, "victory-section", "defeat-section", "flee-section");
    expect(combat.enemies).toHaveLength(1);
    expect(combat.enemies[0]).toMatchObject({ id: "goblin", stamina: 6, maxStamina: 6 });
    expect(combat.round).toBe(1);
    expect(combat.isActive).toBe(true);
  });

  it("calculateAttackStrength adds the roll total to the skill and modifier", () => {
    mockRolls(7);
    const result = calculateAttackStrength(5, 1);
    expect(result.attackStrength).toBe(7 + 5 + 1);
  });

  it("resolveCombatRound: higher attack strength wins and causes default damage", () => {
    mockRolls(10, 4); // player total 10 + skill 8 = 18; enemy total 4 + skill 5 = 9
    const round = resolveCombatRound(8, 5);
    expect(round.winner).toBe("player");
    expect(round.damage).toBe(2);
  });

  it("resolveCombatRound: a tie causes no damage", () => {
    mockRolls(5, 8); // player total 5 + skill 8 = 13; enemy total 8 + skill 5 = 13
    const round = resolveCombatRound(8, 5);
    expect(round.winner).toBe("tie");
    expect(round.damage).toBe(0);
  });

  it("applyRoundDamage reduces the enemy's stamina when the player wins", () => {
    const character = makeCharacter();
    const enemy = makeEnemy();
    const round = resolveCombatRoundStub("player", 2);
    const result = applyRoundDamage(round, character, enemy);
    expect(result.enemy.stamina).toBe(4);
    expect(result.character.stats.stamina).toBe(character.stats.stamina);
    expect(result.damageDealt).toBe(2);
  });

  it("applyRoundDamage reduces the character's stamina when the enemy wins", () => {
    const character = makeCharacter();
    const enemy = makeEnemy();
    const round = resolveCombatRoundStub("enemy", 2);
    const result = applyRoundDamage(round, character, enemy);
    expect(result.character.stats.stamina).toBe(8);
    expect(result.enemy.stamina).toBe(enemy.stamina);
    expect(result.damageDealt).toBe(2);
  });

  it("applyRoundDamage adds the attacker's weapon damage bonus to the damage dealt", () => {
    const character = makeCharacter();
    const enemy = makeEnemy();
    const round = resolveCombatRoundStub("player", 2);
    const result = applyRoundDamage(round, character, enemy, { attackerDamageBonus: 3 });
    expect(result.damageDealt).toBe(5);
    expect(result.enemy.stamina).toBe(1);
  });

  it("applyRoundDamage subtracts the defender's armor defense bonus from the damage received", () => {
    const character = makeCharacter();
    const enemy = makeEnemy();
    const round = resolveCombatRoundStub("enemy", 2);
    const result = applyRoundDamage(round, character, enemy, { defenderDefenseBonus: 1 });
    expect(result.damageDealt).toBe(1);
    expect(result.character.stats.stamina).toBe(9);
  });

  it("applyRoundDamage floors damage at 0 when defense bonus exceeds the base damage", () => {
    const character = makeCharacter();
    const enemy = makeEnemy();
    const round = resolveCombatRoundStub("enemy", 2);
    const result = applyRoundDamage(round, character, enemy, { defenderDefenseBonus: 10 });
    expect(result.damageDealt).toBe(0);
    expect(result.character.stats.stamina).toBe(character.stats.stamina);
  });

  it("applyRoundDamage deals no damage on a tie regardless of modifiers", () => {
    const character = makeCharacter();
    const enemy = makeEnemy();
    const round = resolveCombatRoundStub("tie", 0);
    const result = applyRoundDamage(round, character, enemy, { attackerDamageBonus: 5 });
    expect(result.damageDealt).toBe(0);
    expect(result.enemy.stamina).toBe(enemy.stamina);
    expect(result.character.stats.stamina).toBe(character.stats.stamina);
  });

  it("resolveCombatLuckBonus succeeds when the roll is less than or equal to luck", () => {
    mockRolls(6);
    const result = resolveCombatLuckBonus(makeCharacter({ stats: { ...makeCharacter().stats, luck: 7 } }));
    expect(result.success).toBe(true);
    expect(result.roll.total).toBe(6);
  });

  it("resolveCombatLuckBonus fails when the roll exceeds luck", () => {
    mockRolls(9);
    const result = resolveCombatLuckBonus(makeCharacter({ stats: { ...makeCharacter().stats, luck: 7 } }));
    expect(result.success).toBe(false);
  });

  it("evaluateCombatOutcome detects victory, defeat and ongoing states", () => {
    const character = makeCharacter();
    expect(evaluateCombatOutcome(character, [makeEnemy({ stamina: 0 })])).toBe("victory");
    expect(evaluateCombatOutcome(makeCharacter({ stats: { ...character.stats, stamina: 0 } }), [makeEnemy()])).toBe(
      "defeat"
    );
    expect(evaluateCombatOutcome(character, [makeEnemy()])).toBe("ongoing");
  });
});

function resolveCombatRoundStub(winner: "player" | "enemy" | "tie", damage: number) {
  return {
    playerRoll: { rolls: [1, 1], sides: 6, modifier: 0, total: 2 },
    playerAttackStrength: 10,
    enemyRoll: { rolls: [1, 1], sides: 6, modifier: 0, total: 2 },
    enemyAttackStrength: 8,
    winner,
    damage,
  };
}
