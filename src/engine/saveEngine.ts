import type { GameSave } from "@/types/game";
import { SAVE_FORMAT_VERSION } from "@/types/game";

const SAVE_KEY_PREFIX = "livro-jogo:save:";
const LEGACY_VERSIONS_HANDLED = new Set([1]);

function saveKey(bookId: string): string {
  return `${SAVE_KEY_PREFIX}${bookId}`;
}

/** Migra saves de versões antigas do formato para a versão atual, se necessário. */
export function migrateSave(raw: GameSave): GameSave {
  if (raw.formatVersion === SAVE_FORMAT_VERSION) return raw;

  if (!LEGACY_VERSIONS_HANDLED.has(raw.formatVersion)) {
    // Versão desconhecida: retorna como está, mas marca a versão atual para
    // evitar loops de migração. Estratégias de migração específicas devem ser
    // adicionadas aqui conforme o formato evoluir.
    return { ...raw, formatVersion: SAVE_FORMAT_VERSION };
  }

  return raw;
}

export function saveGame(save: GameSave): void {
  try {
    const payload: GameSave = { ...save, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(saveKey(save.bookId), JSON.stringify(payload));
  } catch (error) {
    console.error("Falha ao salvar o jogo:", error);
  }
}

export function loadGame(bookId: string): GameSave | null {
  try {
    const raw = window.localStorage.getItem(saveKey(bookId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameSave;
    return migrateSave(parsed);
  } catch (error) {
    console.error("Falha ao carregar o jogo:", error);
    return null;
  }
}

export function hasSave(bookId: string): boolean {
  return window.localStorage.getItem(saveKey(bookId)) !== null;
}

export function deleteSave(bookId: string): void {
  window.localStorage.removeItem(saveKey(bookId));
}

export function exportSave(save: GameSave): string {
  return JSON.stringify(save, null, 2);
}

export interface ImportResult {
  success: boolean;
  save?: GameSave;
  error?: string;
}

/** Importa um save exportado anteriormente, validando a estrutura mínima. */
export function importSave(jsonText: string): ImportResult {
  try {
    const parsed = JSON.parse(jsonText) as Partial<GameSave>;
    if (
      !parsed.bookId ||
      !parsed.character ||
      !parsed.currentSectionId ||
      typeof parsed.formatVersion !== "number"
    ) {
      return { success: false, error: "Arquivo de save inválido: campos obrigatórios ausentes." };
    }
    const migrated = migrateSave(parsed as GameSave);
    return { success: true, save: migrated };
  } catch {
    return { success: false, error: "Não foi possível interpretar o arquivo JSON de save." };
  }
}
