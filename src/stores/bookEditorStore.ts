import { create } from "zustand";
import type {
  CharacterCreationRules,
  GameBook,
  StoryEnemy,
  StoryItem,
  StorySection,
} from "@/types/story";
import { loadUserBookRaw, saveEditorBook, syncBookToSupabase } from "@/engine/userBookStorage";
import { useLibraryStore } from "@/stores/libraryStore";
import { useAuthStore } from "@/stores/authStore";

function blankBook(): GameBook {
  return {
    id: "",
    version: "1.0.0",
    title: "",
    author: "",
    description: "",
    startSection: "",
    characterCreation: {
      skill: { dice: 1, sides: 6, modifier: 6 },
      stamina: { dice: 2, sides: 6, modifier: 12 },
      luck: { dice: 1, sides: 6, modifier: 6 },
      gold: 5,
      provisions: 10,
    },
    items: [],
    enemies: [],
    sections: {},
  };
}

interface BookEditorState {
  mode: "create" | "edit";
  originalId: string | null;
  book: GameBook;
  errors: string[];
  saving: boolean;
  loading: boolean;
  loadError: string | null;
  /** Aviso (não bloqueante) quando a gravação local funciona mas a cópia no Supabase falha. */
  syncError: string | null;

  loadForCreate: () => void;
  loadForEdit: (id: string) => Promise<void>;
  updateMeta: (patch: Partial<GameBook>) => void;
  updateCharacterCreation: (patch: Partial<CharacterCreationRules>) => void;
  upsertItem: (item: StoryItem) => void;
  removeItem: (id: string) => void;
  upsertEnemy: (enemy: StoryEnemy) => void;
  removeEnemy: (id: string) => void;
  upsertSection: (section: StorySection) => void;
  removeSection: (id: string) => void;
  save: () => Promise<{ success: boolean; id?: string }>;
}

export const useBookEditorStore = create<BookEditorState>((set, get) => ({
  mode: "create",
  originalId: null,
  book: blankBook(),
  errors: [],
  saving: false,
  loading: false,
  loadError: null,
  syncError: null,

  loadForCreate: () => {
    set({
      mode: "create",
      originalId: null,
      book: blankBook(),
      errors: [],
      loading: false,
      loadError: null,
    });
  },

  loadForEdit: async (id: string) => {
    set({ loading: true, loadError: null });
    const raw = await loadUserBookRaw(id);
    if (!raw) {
      set({ loading: false, loadError: "Livro não encontrado ou não pôde ser carregado para edição." });
      return;
    }

    set({ mode: "edit", originalId: id, book: raw.book, errors: [], loading: false, loadError: null });
  },

  updateMeta: (patch) => set((s) => ({ book: { ...s.book, ...patch } })),

  updateCharacterCreation: (patch) =>
    set((s) => ({ book: { ...s.book, characterCreation: { ...s.book.characterCreation, ...patch } } })),

  upsertItem: (item) =>
    set((s) => {
      const exists = s.book.items.some((i) => i.id === item.id);
      return {
        book: {
          ...s.book,
          items: exists ? s.book.items.map((i) => (i.id === item.id ? item : i)) : [...s.book.items, item],
        },
      };
    }),

  removeItem: (id) => set((s) => ({ book: { ...s.book, items: s.book.items.filter((i) => i.id !== id) } })),

  upsertEnemy: (enemy) =>
    set((s) => {
      const exists = s.book.enemies.some((e) => e.id === enemy.id);
      return {
        book: {
          ...s.book,
          enemies: exists ? s.book.enemies.map((e) => (e.id === enemy.id ? enemy : e)) : [...s.book.enemies, enemy],
        },
      };
    }),

  removeEnemy: (id) => set((s) => ({ book: { ...s.book, enemies: s.book.enemies.filter((e) => e.id !== id) } })),

  upsertSection: (section) =>
    set((s) => ({ book: { ...s.book, sections: { ...s.book.sections, [section.id]: section } } })),

  removeSection: (id) =>
    set((s) => {
      const sections = { ...s.book.sections };
      delete sections[id];
      return { book: { ...s.book, sections } };
    }),

  save: async () => {
    set({ saving: true, errors: [], syncError: null });
    const state = get();
    const id = state.book.id.trim();
    if (!id) {
      set({ saving: false, errors: ["Informe um id para o livro (aba Informações)."] });
      return { success: false };
    }

    const book = { ...state.book, id };
    const result = await saveEditorBook(id, book, { isNew: state.mode === "create" });
    if (!result.success) {
      set({ saving: false, errors: result.errors ?? ["Não foi possível salvar o livro."] });
      return { success: false };
    }

    set({ saving: false, errors: [] });
    await useLibraryStore.getState().loadLibrary();

    const currentUser = useAuthStore.getState().currentUser;
    if (currentUser) {
      const sync = await syncBookToSupabase(book, currentUser.id);
      if (!sync.success) {
        set({
          syncError: `Livro salvo neste navegador. A cópia no servidor falhou (${sync.error ?? "erro desconhecido"}) — ele pode não aparecer em outros dispositivos ainda.`,
        });
      }
    }

    return { success: true, id };
  },
}));
