import { describe, expect, it } from "vitest";
import { validateGameBook } from "@/schemas/story.schema";
import fortalezaDasSombras from "../../public/stories/fortaleza-das-sombras/story.json";
import veuDeVaelbrook from "../../public/stories/veu-de-vaelbrook/story.json";
import estacaoCorvo9 from "../../public/stories/estacao-corvo-9/story.json";

function baseBook() {
  return {
    id: "book-1",
    version: "1.0.0",
    title: "Livro de Teste",
    author: "Autor",
    description: "Uma história de teste.",
    startSection: "1",
    characterCreation: {
      skill: { dice: 1, sides: 6, modifier: 6 },
      stamina: { dice: 2, sides: 6, modifier: 12 },
      luck: { dice: 1, sides: 6, modifier: 6 },
      gold: 0,
      provisions: 0,
    },
    items: [],
    enemies: [],
    sections: {
      "1": { id: "1", paragraphs: ["Você está em uma sala."], choices: [] },
    },
  };
}

describe("validateGameBook", () => {
  it("accepts a minimal, well-formed story", () => {
    const result = validateGameBook(baseBook());
    expect(result.success).toBe(true);
  });

  it("rejects a story missing required top-level fields", () => {
    const invalid = { ...baseBook(), title: undefined };
    const result = validateGameBook(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a story whose startSection does not exist", () => {
    const invalid = { ...baseBook(), startSection: "does-not-exist" };
    const result = validateGameBook(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a choice pointing to a non-existent target section", () => {
    const book = baseBook();
    book.sections["1"].choices.push({ id: "go", text: "Ir", target: "99" } as never);
    const result = validateGameBook(book);
    expect(result.success).toBe(false);
  });

  it("rejects a condition referencing a non-existent item", () => {
    const book = baseBook();
    book.sections["1"].choices.push({
      id: "go",
      text: "Ir",
      target: "1",
      conditions: [{ type: "hasItem", itemId: "ghost-item" }],
    } as never);
    const result = validateGameBook(book);
    expect(result.success).toBe(false);
  });

  it("accepts a story using the new rules/canRepeat/allowRest/allowEat fields", () => {
    const book = baseBook();
    (book as Record<string, unknown>).rulesText = "Regra especial: nada de magia aqui.";
    (book as Record<string, unknown>).rules = {
      useDefaultRules: true,
      fatigueSystem: true,
      provisions: true,
      restSystem: false,
      combatLuck: true,
    };
    book.sections["1"] = { ...book.sections["1"], canRepeat: true, allowRest: true, allowEat: true } as never;
    const result = validateGameBook(book);
    expect(result.success).toBe(true);
  });

  it("rejects a non-boolean value in a rules flag", () => {
    const book = baseBook();
    (book as Record<string, unknown>).rules = { fatigueSystem: "yes" };
    const result = validateGameBook(book);
    expect(result.success).toBe(false);
  });

  it("accepts a section with a valid restEncounter", () => {
    const book = baseBook();
    book.enemies.push({ id: "wolf", name: "Lobo", skill: 5, stamina: 6 } as never);
    (book.sections as Record<string, unknown>)["2"] = { id: "2", paragraphs: ["Fuga."], choices: [] };
    book.sections["1"] = {
      ...book.sections["1"],
      allowRest: true,
      restEncounter: { chancePercent: 25, enemyIds: ["wolf"], onVictory: "1", onDefeat: "2" },
    } as never;
    const result = validateGameBook(book);
    expect(result.success).toBe(true);
  });

  it("rejects a restEncounter referencing a non-existent enemy or section", () => {
    const book = baseBook();
    book.sections["1"] = {
      ...book.sections["1"],
      allowRest: true,
      restEncounter: { chancePercent: 25, enemyIds: ["ghost-wolf"], onVictory: "does-not-exist", onDefeat: "1" },
    } as never;
    const result = validateGameBook(book);
    expect(result.success).toBe(false);
  });

  it("validates the bundled demo story 'A Fortaleza das Sombras' successfully", () => {
    const result = validateGameBook(fortalezaDasSombras);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data.sections).length).toBeGreaterThanOrEqual(15);
      expect(result.data.items.length).toBeGreaterThanOrEqual(3);
      expect(result.data.enemies.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("validates 'O Véu de Vaelbrook' (Ato I, obra em construção) successfully", () => {
    const result = validateGameBook(veuDeVaelbrook);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sections[result.data.startSection]).toBeDefined();
      expect(Object.keys(result.data.sections).length).toBeGreaterThanOrEqual(95);
      expect(result.data.items.length).toBeGreaterThanOrEqual(20);
      expect(result.data.enemies.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("validates 'Estação Corvo-9' (livro curto de teste, ficção científica) successfully", () => {
    const result = validateGameBook(estacaoCorvo9);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sections[result.data.startSection]).toBeDefined();
      expect(Object.keys(result.data.sections).length).toBeGreaterThanOrEqual(30);
      expect(result.data.items.length).toBeGreaterThanOrEqual(8);
      expect(result.data.enemies.length).toBeGreaterThanOrEqual(4);
    }
  });
});
