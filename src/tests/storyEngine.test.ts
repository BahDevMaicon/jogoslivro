import { describe, expect, it, vi } from "vitest";
import {
  applyFatigueTick,
  buildInitialCharacter,
  eatAtSection,
  executeChoice,
  getChoiceLockReason,
  getSection,
  isChoiceAvailable,
  isRuleEnabled,
  processSectionEntry,
  restAtSection,
} from "@/engine/storyEngine";
import type { GameBook } from "@/types/story";

function makeBook(): GameBook {
  return {
    id: "book-1",
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
    items: [{ id: "key", name: "Chave", description: "", kind: "key" }],
    enemies: [{ id: "goblin", name: "Goblin", skill: 5, stamina: 6 }],
    sections: {
      "1": {
        id: "1",
        paragraphs: ["Início."],
        choices: [
          { id: "go-2", text: "Ir para 2", target: "2" },
          {
            id: "go-locked",
            text: "Ir para o cofre",
            target: "3",
            conditions: [{ type: "hasItem", itemId: "key" }],
            lockedReason: "Precisa da chave.",
          },
        ],
      },
      "2": {
        id: "2",
        paragraphs: ["Sala 2."],
        onEnter: [{ type: "addItem", itemId: "key" }],
        choices: [{ id: "go-3", text: "Ir para 3", target: "3" }],
      },
      "3": { id: "3", paragraphs: ["Sala 3."], choices: [] },
      "hub": {
        id: "hub",
        paragraphs: ["Uma praça segura."],
        canRepeat: true,
        choices: [{ id: "hub-look-around", text: "Olhar ao redor", target: "3" }],
      },
    },
  };
}

describe("storyEngine", () => {
  it("getSection returns the requested section or throws for unknown ids", () => {
    const book = makeBook();
    expect(getSection(book, "1").id).toBe("1");
    expect(() => getSection(book, "unknown")).toThrow();
  });

  it("buildInitialCharacter sets current stats equal to max stats", () => {
    const character = buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 5, 10);
    expect(character.stats.skill).toBe(character.stats.maxSkill);
    expect(character.stats.stamina).toBe(character.stats.maxStamina);
    expect(character.gold).toBe(5);
    expect(character.provisions).toBe(10);
    expect(character.inventory).toEqual([]);
  });

  it("buildInitialCharacter falls back to a default name when blank", () => {
    const character = buildInitialCharacter("   ", { skill: 8, stamina: 16, luck: 7 }, 0, 0);
    expect(character.name).toBe("Aventureiro");
  });

  it("isChoiceAvailable respects the choice's conditions", () => {
    const book = makeBook();
    const character = buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 0);
    const section = getSection(book, "1");
    const lockedChoice = section.choices.find((c) => c.id === "go-locked")!;
    const ctx = { character, flags: {}, visitedSections: [], choicesMade: [], defeatedEnemies: [] };
    expect(isChoiceAvailable(lockedChoice, section, ctx)).toBe(false);

    const withKey = { ...character, inventory: ["key"] };
    expect(isChoiceAvailable(lockedChoice, section, { ...ctx, character: withKey })).toBe(true);
  });

  it("isChoiceAvailable disables an already-made choice unless the section allows repeats", () => {
    const book = makeBook();
    const character = buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 0);
    const normalSection = getSection(book, "1");
    const choice = normalSection.choices.find((c) => c.id === "go-2")!;
    const ctxAlreadyMade = { character, flags: {}, visitedSections: [], choicesMade: ["go-2"], defeatedEnemies: [] };
    expect(isChoiceAvailable(choice, normalSection, ctxAlreadyMade)).toBe(false);

    const hub = getSection(book, "hub");
    const hubChoice = hub.choices[0];
    const ctxHubMade = { character, flags: {}, visitedSections: [], choicesMade: [hubChoice.id], defeatedEnemies: [] };
    expect(isChoiceAvailable(hubChoice, hub, ctxHubMade)).toBe(true);
  });

  it("getChoiceLockReason distinguishes repeat-lock, condition-lock, and available", () => {
    const book = makeBook();
    const character = buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 0);
    const section = getSection(book, "1");
    const goChoice = section.choices.find((c) => c.id === "go-2")!;
    const lockedChoice = section.choices.find((c) => c.id === "go-locked")!;

    const freshCtx = { character, flags: {}, visitedSections: [], choicesMade: [], defeatedEnemies: [] };
    expect(getChoiceLockReason(goChoice, section, freshCtx)).toBeUndefined();
    expect(getChoiceLockReason(lockedChoice, section, freshCtx)).toBe("Precisa da chave.");

    const madeCtx = { ...freshCtx, choicesMade: ["go-2"] };
    expect(getChoiceLockReason(goChoice, section, madeCtx)).toBe(
      "Você já seguiu por este caminho e não pode repeti-lo."
    );
  });

  it("isRuleEnabled defaults to true when rules/flag is omitted", () => {
    const book = makeBook();
    expect(isRuleEnabled(book, "fatigueSystem")).toBe(true);
    const bookWithFlag = { ...book, rules: { fatigueSystem: false } };
    expect(isRuleEnabled(bookWithFlag, "fatigueSystem")).toBe(false);
    expect(isRuleEnabled(bookWithFlag, "restSystem")).toBe(true);
  });

  it("applyFatigueTick increments fatigue and does nothing when fatigueSystem is disabled", () => {
    const book = { ...makeBook(), rules: { fatigueSystem: false } };
    const character = buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 0);
    const result = applyFatigueTick(book, character);
    expect(result.character.fatigue).toBe(0);
    expect(result.logEntries).toEqual([]);
  });

  it("applyFatigueTick triggers exhaustion once fatigue reaches the rolled threshold", () => {
    const book = makeBook();
    const character = { ...buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 0), fatigue: 6 };
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0); // limiar mínimo: 7
    const result = applyFatigueTick(book, character);
    randomSpy.mockRestore();
    expect(result.character.fatigue).toBe(0);
    expect(result.character.stats.stamina).toBe(14);
    expect(result.logEntries).toHaveLength(2);
  });

  it("restAtSection consumes a provision, restores stamina up to the max, and clears fatigue", () => {
    const character = {
      ...buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 3),
      stats: { skill: 8, maxSkill: 8, stamina: 10, maxStamina: 16, luck: 7, maxLuck: 7 },
      fatigue: 5,
    };
    const result = restAtSection(character);
    expect(result.character.provisions).toBe(2);
    expect(result.character.stats.stamina).toBe(14);
    expect(result.character.fatigue).toBe(0);
    expect(result.logEntries[0].type).toBe("rest");

    const noProvisions = restAtSection({ ...character, provisions: 0 });
    expect(noProvisions.character.provisions).toBe(0);
    expect(noProvisions.logEntries).toEqual([]);
  });

  it("eatAtSection consumes a provision and clears fatigue without touching stamina", () => {
    const character = { ...buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 2), fatigue: 4 };
    const result = eatAtSection(character);
    expect(result.character.provisions).toBe(1);
    expect(result.character.stats.stamina).toBe(16);
    expect(result.character.fatigue).toBe(0);
    expect(result.logEntries[0].type).toBe("eat");
  });

  it("processSectionEntry applies onEnter actions and updates the character", () => {
    const book = makeBook();
    const character = buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 0);
    const section = getSection(book, "2");
    const result = processSectionEntry(book, section, character, {});
    expect(result.character.inventory).toContain("key");
    expect(result.combat).toBeNull();
    expect(result.pendingTest).toBeNull();
    expect(result.ending).toBeNull();
  });

  it("executeChoice runs the choice's actions and resolves the target section", () => {
    const book = makeBook();
    const character = buildInitialCharacter("Herói", { skill: 8, stamina: 16, luck: 7 }, 0, 0);
    const section = getSection(book, "1");
    const choice = section.choices.find((c) => c.id === "go-2")!;
    const result = executeChoice(book, choice, character, {});
    expect(result.targetSectionId).toBe("2");
    expect(result.logEntries[0].type).toBe("choice");
  });
});
