import type { GameBook } from "@/types/story";
import { validateGameBook } from "@/schemas/story.schema";

export interface BookLoadResult {
  success: boolean;
  book?: GameBook;
  errors?: string[];
}

/**
 * Carrega e valida um livro-jogo a partir de uma URL (ex.: um arquivo em
 * `public/stories/...`) ou de um objeto já parseado.
 */
export async function loadBookFromUrl(url: string): Promise<BookLoadResult> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, errors: [`Falha ao buscar "${url}": HTTP ${response.status}`] };
    }
    const data = await response.json();
    return loadBookFromData(data);
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Erro desconhecido ao carregar a história."],
    };
  }
}

export function loadBookFromData(data: unknown): BookLoadResult {
  const result = validateGameBook(data);
  if (!result.success) {
    const errors = Array.isArray(result.error)
      ? result.error
      : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return { success: false, errors };
  }
  return { success: true, book: result.data as GameBook };
}
