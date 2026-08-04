export interface BookRegistryEntry {
  id: string;
  /** Caminho público para o arquivo JSON da história (servido de /public) */
  url: string;
}

/**
 * Registro estático dos livros disponíveis na biblioteca.
 * Para adicionar um novo livro-jogo, coloque o arquivo `.json` em
 * `public/stories/<id>/story.json` e adicione uma entrada aqui.
 */
export const BOOK_REGISTRY: BookRegistryEntry[] = [
  { id: "fortaleza-das-sombras", url: "/stories/fortaleza-das-sombras/story.json" },
  { id: "veu-de-vaelbrook", url: "/stories/veu-de-vaelbrook/story.json" },
  { id: "estacao-corvo-9", url: "/stories/estacao-corvo-9/story.json" },
];
