import { describe, expect, it } from "vitest";
import { applyActions } from "@/engine/actionEngine";
import type { Character } from "@/types/game";
import type { GameBook } from "@/types/story";

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Testador",
    stats: { skill: 8, maxSkill: 10, stamina: 15, maxStamina: 20, luck: 5, maxLuck: 8 },
    gold: 10,
    provisions: 3,
    inventory: [],
    activeEffects: [],
    score: 0,
    fatigue: 0,
    ...overrides,
  };
}

function makeBook(): GameBook {
  return {
    id: "test-book",
    version: "1.0.0",
    title: "Livro de Teste",
    author: "Autor",
    description: "desc",
    startSection: "1",
    characterCreation: {
      skill: { dice: 1, sides: 6, modifier: 6 },
      stamina: { dice: 2, sides: 6, modifier: 12 },
      luck: { dice: 1, sides: 6, modifier: 6 },
      gold: 0,
      provisions: 0,
    },
    items: [{ id: "potion", name: "Poção", description: "", kind: "consumable" }],
    enemies: [],
    sections: {},
  };
}

describe("actionEngine", () => {
  it("addItem and removeItem modify the inventory", () => {
    const book = makeBook();
    const character = makeCharacter();
    const afterAdd = applyActions([{ type: "addItem", itemId: "potion" }], character, {}, book);
    expect(afterAdd.character.inventory).toContain("potion");

    const afterRemove = applyActions([{ type: "removeItem", itemId: "potion" }], afterAdd.character, {}, book);
    expect(afterRemove.character.inventory).not.toContain("potion");
  });

  it("modifyStat clamps the value between 0 and the stat's max", () => {
    const book = makeBook();
    const character = makeCharacter();

    const damaged = applyActions([{ type: "modifyStat", stat: "stamina", value: -100 }], character, {}, book);
    expect(damaged.character.stats.stamina).toBe(0);

    const healed = applyActions([{ type: "modifyStat", stat: "stamina", value: 100 }], character, {}, book);
    expect(healed.character.stats.stamina).toBe(character.stats.maxStamina);
  });

  it("restoreStat restores to max when no value is given", () => {
    const book = makeBook();
    const character = makeCharacter({ stats: { ...makeCharacter().stats, stamina: 2 } });
    const result = applyActions([{ type: "restoreStat", stat: "stamina" }], character, {}, book);
    expect(result.character.stats.stamina).toBe(character.stats.maxStamina);
  });

  it("addGold/removeGold and addProvisions/removeProvisions never go negative", () => {
    const book = makeBook();
    const character = makeCharacter({ gold: 5, provisions: 2 });

    const goldResult = applyActions([{ type: "removeGold", value: 100 }], character, {}, book);
    expect(goldResult.character.gold).toBe(0);

    const provResult = applyActions([{ type: "removeProvisions", value: 100 }], character, {}, book);
    expect(provResult.character.provisions).toBe(0);

    const goldGain = applyActions([{ type: "addGold", value: 5 }], character, {}, book);
    expect(goldGain.character.gold).toBe(10);
  });

  it("setFlag and clearFlag toggle boolean flags", () => {
    const book = makeBook();
    const character = makeCharacter();
    const set = applyActions([{ type: "setFlag", flag: "met-npc" }], character, {}, book);
    expect(set.flags["met-npc"]).toBe(true);

    const cleared = applyActions([{ type: "clearFlag", flag: "met-npc" }], character, set.flags, book);
    expect(cleared.flags["met-npc"]).toBe(false);
  });

  it("logEvent produces a custom log entry with the given message", () => {
    const book = makeBook();
    const character = makeCharacter();
    const result = applyActions([{ type: "logEvent", message: "Algo aconteceu" }], character, {}, book);
    expect(result.logEntries.some((e) => e.message === "Algo aconteceu" && e.type === "custom")).toBe(true);
  });

  it("does not mutate the original character or flags objects", () => {
    const book = makeBook();
    const character = makeCharacter();
    const originalInventory = character.inventory;
    applyActions([{ type: "addItem", itemId: "potion" }], character, {}, book);
    expect(character.inventory).toBe(originalInventory);
    expect(character.inventory).toHaveLength(0);
  });
});
