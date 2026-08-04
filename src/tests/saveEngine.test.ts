import { describe, expect, it, beforeEach } from "vitest";
import { deleteSave, exportSave, hasSave, importSave, loadGame, saveGame } from "@/engine/saveEngine";
import { SAVE_FORMAT_VERSION, type GameSave } from "@/types/game";
import { DEFAULT_SETTINGS } from "@/types/game";

function makeSave(overrides: Partial<GameSave> = {}): GameSave {
  return {
    formatVersion: SAVE_FORMAT_VERSION,
    bookId: "test-book",
    bookVersion: "1.0.0",
    currentSectionId: "3",
    character: {
      name: "Herói",
      stats: { skill: 8, maxSkill: 10, stamina: 15, maxStamina: 20, luck: 7, maxLuck: 8 },
      gold: 5,
      provisions: 3,
      inventory: ["sword"],
      activeEffects: [],
      score: 0,
      fatigue: 0,
    },
    flags: { "met-king": true },
    visitedSections: ["1", "2", "3"],
    choicesMade: ["choice-1"],
    defeatedEnemies: [],
    combat: null,
    pendingTest: null,
    log: [],
    settings: DEFAULT_SETTINGS,
    isFinished: false,
    ending: null,
    rulesAcknowledged: false,
    previousSectionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("saveEngine", () => {
  it("saveGame persists a save that loadGame can retrieve", () => {
    const save = makeSave();
    saveGame(save);
    const loaded = loadGame(save.bookId);
    expect(loaded).not.toBeNull();
    expect(loaded?.currentSectionId).toBe("3");
    expect(loaded?.character.name).toBe("Herói");
  });

  it("hasSave reflects whether a save exists for a given book", () => {
    expect(hasSave("test-book")).toBe(false);
    saveGame(makeSave());
    expect(hasSave("test-book")).toBe(true);
  });

  it("deleteSave removes the persisted save", () => {
    saveGame(makeSave());
    deleteSave("test-book");
    expect(hasSave("test-book")).toBe(false);
    expect(loadGame("test-book")).toBeNull();
  });

  it("loadGame returns null when no save exists", () => {
    expect(loadGame("unknown-book")).toBeNull();
  });

  it("exportSave produces valid JSON that importSave can parse back", () => {
    const save = makeSave();
    const json = exportSave(save);
    const result = importSave(json);
    expect(result.success).toBe(true);
    expect(result.save?.bookId).toBe("test-book");
    expect(result.save?.character.inventory).toContain("sword");
  });

  it("importSave rejects malformed JSON", () => {
    const result = importSave("{ not valid json");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("importSave rejects an object missing required fields", () => {
    const result = importSave(JSON.stringify({ foo: "bar" }));
    expect(result.success).toBe(false);
  });
});
