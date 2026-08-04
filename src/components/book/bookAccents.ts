export type BookAccent = "ember" | "moss" | "azure" | "wine" | "amethyst";

export const BOOK_ACCENTS: BookAccent[] = ["ember", "moss", "azure", "wine", "amethyst"];

/** Cor de capa estável por livro (independente de posição na lista), para não mudar ao filtrar/ordenar. */
export function accentForBookId(id: string): BookAccent {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return BOOK_ACCENTS[Math.abs(hash) % BOOK_ACCENTS.length];
}
