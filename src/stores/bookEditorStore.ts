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

/** "cover" | `item:${itemId}:examineImage` | `enemy:${enemyId}:image` | `section:${sectionId}:image` */
export type ImageAssetKey = string;

interface ImageAssetEntry {
  source: "existing" | "new";
  file?: File;
  blob?: Blob;
  basename?: string;
  previewUrl?: string;
}

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

function extensionOf(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : "png";
}

function basenameForKey(key: ImageAssetKey, filename: string): string {
  const safeKey = key.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return `${safeKey}.${extensionOf(filename)}`;
}

function applyImageKeyToBook(book: GameBook, key: ImageAssetKey, value: string | undefined): GameBook {
  if (key === "cover") return { ...book, cover: value };
  const [kind, refId, field] = key.split(":");
  if (kind === "item") {
    return { ...book, items: book.items.map((i) => (i.id === refId ? { ...i, [field]: value } : i)) };
  }
  if (kind === "enemy") {
    return { ...book, enemies: book.enemies.map((e) => (e.id === refId ? { ...e, [field]: value } : e)) };
  }
  if (kind === "section") {
    const section = book.sections[refId];
    if (!section) return book;
    return { ...book, sections: { ...book.sections, [refId]: { ...section, [field]: value } } };
  }
  return book;
}

function revoke(entry: ImageAssetEntry | undefined) {
  if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
}

interface BookEditorState {
  mode: "create" | "edit";
  originalId: string | null;
  book: GameBook;
  imageAssets: Map<ImageAssetKey, ImageAssetEntry>;
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
  setImage: (key: ImageAssetKey, file: File | null) => void;
  imagePreviewUrl: (key: ImageAssetKey) => string | undefined;
  save: () => Promise<{ success: boolean; id?: string }>;
}

export const useBookEditorStore = create<BookEditorState>((set, get) => ({
  mode: "create",
  originalId: null,
  book: blankBook(),
  imageAssets: new Map(),
  errors: [],
  saving: false,
  loading: false,
  loadError: null,
  syncError: null,

  loadForCreate: () => {
    get().imageAssets.forEach(revoke);
    set({
      mode: "create",
      originalId: null,
      book: blankBook(),
      imageAssets: new Map(),
      errors: [],
      loading: false,
      loadError: null,
    });
  },

  loadForEdit: async (id: string) => {
    get().imageAssets.forEach(revoke);
    set({ loading: true, loadError: null, imageAssets: new Map() });
    const raw = await loadUserBookRaw(id);
    if (!raw) {
      set({ loading: false, loadError: "Livro não encontrado ou não pôde ser carregado para edição." });
      return;
    }

    const imageAssets = new Map<ImageAssetKey, ImageAssetEntry>();
    const seed = (key: ImageAssetKey, path: string | undefined) => {
      if (!path) return;
      const basename = path.split("/").pop()!.toLowerCase();
      const blob = raw.assets.get(basename);
      imageAssets.set(key, {
        source: "existing",
        blob,
        basename,
        previewUrl: blob ? URL.createObjectURL(blob) : undefined,
      });
    };
    seed("cover", raw.book.cover);
    for (const item of raw.book.items) seed(`item:${item.id}:examineImage`, item.examineImage);
    for (const enemy of raw.book.enemies) seed(`enemy:${enemy.id}:image`, enemy.image);
    for (const section of Object.values(raw.book.sections)) seed(`section:${section.id}:image`, section.image);

    set({ mode: "edit", originalId: id, book: raw.book, imageAssets, errors: [], loading: false, loadError: null });
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

  removeItem: (id) =>
    set((s) => {
      const key = `item:${id}:examineImage`;
      const imageAssets = new Map(s.imageAssets);
      revoke(imageAssets.get(key));
      imageAssets.delete(key);
      return { book: { ...s.book, items: s.book.items.filter((i) => i.id !== id) }, imageAssets };
    }),

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

  removeEnemy: (id) =>
    set((s) => {
      const key = `enemy:${id}:image`;
      const imageAssets = new Map(s.imageAssets);
      revoke(imageAssets.get(key));
      imageAssets.delete(key);
      return { book: { ...s.book, enemies: s.book.enemies.filter((e) => e.id !== id) }, imageAssets };
    }),

  upsertSection: (section) =>
    set((s) => ({ book: { ...s.book, sections: { ...s.book.sections, [section.id]: section } } })),

  removeSection: (id) =>
    set((s) => {
      const key = `section:${id}:image`;
      const imageAssets = new Map(s.imageAssets);
      revoke(imageAssets.get(key));
      imageAssets.delete(key);
      const sections = { ...s.book.sections };
      delete sections[id];
      return { book: { ...s.book, sections }, imageAssets };
    }),

  setImage: (key, file) =>
    set((s) => {
      const imageAssets = new Map(s.imageAssets);
      revoke(imageAssets.get(key));
      if (!file) {
        imageAssets.delete(key);
        return { imageAssets, book: applyImageKeyToBook(s.book, key, undefined) };
      }
      const basename = basenameForKey(key, file.name);
      const previewUrl = URL.createObjectURL(file);
      imageAssets.set(key, { source: "new", file, basename, previewUrl });
      return { imageAssets, book: applyImageKeyToBook(s.book, key, basename) };
    }),

  imagePreviewUrl: (key) => get().imageAssets.get(key)?.previewUrl,

  save: async () => {
    set({ saving: true, errors: [], syncError: null });
    const state = get();
    const id = state.book.id.trim();
    if (!id) {
      set({ saving: false, errors: ["Informe um id para o livro (aba Informações)."] });
      return { success: false };
    }

    const assets = new Map<string, Blob>();
    for (const entry of state.imageAssets.values()) {
      const blob = entry.file ?? entry.blob;
      if (entry.basename && blob) assets.set(entry.basename, blob);
    }

    const book = { ...state.book, id };
    const result = await saveEditorBook(id, book, assets, { isNew: state.mode === "create" });
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
