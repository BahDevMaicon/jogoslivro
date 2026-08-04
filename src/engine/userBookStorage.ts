import type { GameBook } from "@/types/story";
import { BOOK_REGISTRY } from "@/stories/registry";
import { loadBookFromData, type BookLoadResult } from "@/engine/bookLoader";
import { supabase } from "@/lib/supabaseClient";

function collectReferencedBasenames(book: GameBook): Set<string> {
  const basenames = new Set<string>();
  const add = (path: string | undefined) => {
    if (!path) return;
    const basename = path.split("/").pop()?.toLowerCase();
    if (basename) basenames.add(basename);
  };
  add(book.cover);
  for (const item of book.items) add(item.examineImage);
  for (const enemy of book.enemies) add(enemy.image);
  for (const section of Object.values(book.sections)) add(section.image);
  return basenames;
}

/**
 * Persistência de livros-jogo adicionados pelo usuário via upload de pasta,
 * usando IndexedDB (localStorage seria pequeno demais para imagens). O
 * `story.json` fica salvo como texto; cada outro arquivo da pasta é salvo
 * como Blob, indexado pelo nome do arquivo (minúsculo) prefixado pelo id do
 * livro. Ao carregar, `cover`/`section.image` que casem com o nome de um
 * arquivo enviado são reescritos para uma URL `blob:` local.
 */

const DB_NAME = "livro-jogo:user-books";
const DB_VERSION = 1;
const META_STORE = "meta";
const ASSET_STORE = "assets";

interface UserBookMeta {
  id: string;
  storyJson: string;
  addedAt: string;
}

interface AssetRecord {
  key: string; // `${bookId}:${basenameLowercase}`
  blob: Blob;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ASSET_STORE)) {
        db.createObjectStore(ASSET_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbTxDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function listUserBookIds(): Promise<string[]> {
  const db = await openDB();
  const tx = db.transaction(META_STORE, "readonly");
  const metas = await idbRequest<UserBookMeta[]>(tx.objectStore(META_STORE).getAll());
  return metas.map((m) => m.id);
}

/** true se `id` já pertence a um livro embutido (`BOOK_REGISTRY`) ou salvo localmente. */
export async function bookIdExists(id: string): Promise<boolean> {
  const existingIds = new Set([...BOOK_REGISTRY.map((e) => e.id), ...(await listUserBookIds())]);
  return existingIds.has(id);
}

export interface SaveUserBookResult {
  success: boolean;
  id?: string;
  /** Forma crua do livro salvo (mesmo objeto validado, sem URLs `blob:`) — usada para sincronizar com o Supabase. */
  book?: GameBook;
  errors?: string[];
}

/** Recebe os arquivos de uma pasta (via <input webkitdirectory>) e salva o livro localmente. */
export async function saveUserBook(files: File[]): Promise<SaveUserBookResult> {
  const storyFile = files.find((f) => f.name.toLowerCase() === "story.json");
  if (!storyFile) {
    return { success: false, errors: ['Nenhum arquivo "story.json" foi encontrado na pasta selecionada.'] };
  }

  let data: unknown;
  try {
    data = JSON.parse(await storyFile.text());
  } catch {
    return { success: false, errors: ['O arquivo "story.json" não contém um JSON válido.'] };
  }

  const result = loadBookFromData(data);
  if (!result.success || !result.book) {
    return { success: false, errors: result.errors ?? ["Livro inválido."] };
  }

  const id = result.book.id;
  if (await bookIdExists(id)) {
    return {
      success: false,
      errors: [`Já existe um livro com o id "${id}". Altere o campo "id" no story.json e tente novamente.`],
    };
  }

  const db = await openDB();
  const tx = db.transaction([META_STORE, ASSET_STORE], "readwrite");
  const meta: UserBookMeta = { id, storyJson: JSON.stringify(data), addedAt: new Date().toISOString() };
  tx.objectStore(META_STORE).put(meta);

  const assetStore = tx.objectStore(ASSET_STORE);
  for (const file of files) {
    if (file === storyFile) continue;
    const record: AssetRecord = { key: `${id}:${file.name.toLowerCase()}`, blob: file };
    assetStore.put(record);
  }

  await idbTxDone(tx);
  return { success: true, id, book: result.book };
}

function resolveAssetPath(path: string | undefined, assets: Map<string, Blob>): string | undefined {
  if (!path) return path;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  const basename = path.split("/").pop()?.toLowerCase();
  const blob = basename ? assets.get(basename) : undefined;
  return blob ? URL.createObjectURL(blob) : path;
}

export async function loadUserBook(id: string): Promise<BookLoadResult> {
  const db = await openDB();

  const metaTx = db.transaction(META_STORE, "readonly");
  const meta = await idbRequest<UserBookMeta | undefined>(metaTx.objectStore(META_STORE).get(id));
  if (!meta) {
    return { success: false, errors: ["Livro não encontrado no armazenamento local."] };
  }

  let data: unknown;
  try {
    data = JSON.parse(meta.storyJson);
  } catch {
    return { success: false, errors: ["O JSON salvo localmente está corrompido."] };
  }

  const result = loadBookFromData(data);
  if (!result.success || !result.book) return result;

  const assetTx = db.transaction(ASSET_STORE, "readonly");
  const allAssets = await idbRequest<AssetRecord[]>(assetTx.objectStore(ASSET_STORE).getAll());
  const prefix = `${id}:`;
  const assets = new Map<string, Blob>();
  for (const rec of allAssets) {
    if (rec.key.startsWith(prefix)) assets.set(rec.key.slice(prefix.length), rec.blob);
  }

  const book: GameBook = {
    ...result.book,
    cover: resolveAssetPath(result.book.cover, assets),
    items: result.book.items.map((item) =>
      item.examineImage ? { ...item, examineImage: resolveAssetPath(item.examineImage, assets) } : item
    ),
    enemies: result.book.enemies.map((enemy) =>
      enemy.image ? { ...enemy, image: resolveAssetPath(enemy.image, assets) } : enemy
    ),
    sections: Object.fromEntries(
      Object.entries(result.book.sections).map(([sectionId, section]) => [
        sectionId,
        section.image ? { ...section, image: resolveAssetPath(section.image, assets) } : section,
      ])
    ),
  };

  return { success: true, book };
}

/**
 * Como `loadUserBook`, mas devolve o livro "cru" (caminhos de imagem como
 * basenames, sem reescrever para `blob:`) junto com o mapa de blobs
 * disponíveis — usado pelo editor para popular o formulário e decidir se
 * mantém a imagem atual (sem reenviar) ou substitui por um novo upload.
 */
export async function loadUserBookRaw(
  id: string
): Promise<{ book: GameBook; assets: Map<string, Blob> } | null> {
  const db = await openDB();

  const metaTx = db.transaction(META_STORE, "readonly");
  const meta = await idbRequest<UserBookMeta | undefined>(metaTx.objectStore(META_STORE).get(id));
  if (!meta) return null;

  let data: unknown;
  try {
    data = JSON.parse(meta.storyJson);
  } catch {
    return null;
  }

  const result = loadBookFromData(data);
  if (!result.success || !result.book) return null;

  const assetTx = db.transaction(ASSET_STORE, "readonly");
  const allAssets = await idbRequest<AssetRecord[]>(assetTx.objectStore(ASSET_STORE).getAll());
  const prefix = `${id}:`;
  const assets = new Map<string, Blob>();
  for (const rec of allAssets) {
    if (rec.key.startsWith(prefix)) assets.set(rec.key.slice(prefix.length), rec.blob);
  }

  return { book: result.book, assets };
}

export interface SaveEditorBookResult {
  success: boolean;
  errors?: string[];
}

/**
 * Grava um livro montado pelo editor visual (`bookEditorStore`). Valida com
 * as mesmas regras de `saveUserBook`/`loadUserBook` (`loadBookFromData`),
 * recusa ids duplicados na criação, e mantém `ASSET_STORE` sincronizado com
 * as imagens realmente referenciadas pelo livro (remove blobs órfãos antes
 * de gravar os novos/atuais).
 */
export async function saveEditorBook(
  id: string,
  book: GameBook,
  assets: Map<string, Blob>,
  options: { isNew: boolean }
): Promise<SaveEditorBookResult> {
  const result = loadBookFromData(book);
  if (!result.success || !result.book) {
    return { success: false, errors: result.errors ?? ["Livro inválido."] };
  }

  if (options.isNew && (await bookIdExists(id))) {
    return {
      success: false,
      errors: [`Já existe um livro com o id "${id}". Escolha outro id e tente novamente.`],
    };
  }

  const db = await openDB();
  const tx = db.transaction([META_STORE, ASSET_STORE], "readwrite");
  const meta: UserBookMeta = { id, storyJson: JSON.stringify(result.book), addedAt: new Date().toISOString() };
  tx.objectStore(META_STORE).put(meta);

  const assetStore = tx.objectStore(ASSET_STORE);
  const prefix = `${id}:`;
  const existingKeys = await idbRequest<IDBValidKey[]>(assetStore.getAllKeys());
  const referenced = collectReferencedBasenames(result.book);
  for (const key of existingKeys) {
    if (typeof key !== "string" || !key.startsWith(prefix)) continue;
    const basename = key.slice(prefix.length);
    if (!referenced.has(basename)) assetStore.delete(key);
  }

  for (const [basename, blob] of assets) {
    if (!referenced.has(basename.toLowerCase())) continue;
    const record: AssetRecord = { key: `${id}:${basename.toLowerCase()}`, blob };
    assetStore.put(record);
  }

  await idbTxDone(tx);
  return { success: true };
}

export interface SyncBookResult {
  success: boolean;
  error?: string;
}

function randomSlugSuffix(): string {
  return Math.random().toString(16).slice(2, 8);
}

/**
 * Espelha o livro (forma crua, com basenames de imagem — nunca URLs `blob:`,
 * que não fazem sentido fora da aba que as criou) na tabela `books` do
 * Supabase. Isso é o que fecha de vez a garantia "todo escrito protegido é
 * validado no servidor" para criação/edição de livro: a política de RLS
 * (`books: premium/admin cria, dono do registro`) passa a governar essa
 * escrita de verdade, não só a UI. `status`/`visibility` ficam fora do
 * payload de propósito: no insert, valem os defaults da coluna
 * (`draft`/`private`); num re-save (upsert), uma aprovação/publicação feita
 * depois por um admin não é sobrescrita de volta para rascunho.
 *
 * Best-effort: nunca lança, nunca bloqueia nem desfaz a gravação local no
 * IndexedDB (que continua sendo a cópia autoritativa neste navegador).
 *
 * Colisão de `slug` (dois usuários usando o mesmo `book.id`): tenta uma vez
 * com um sufixo aleatório antes de desistir. Isso evita o erro duro, mas não
 * é um sistema anti-colisão completo — o `content_data.id` continua sendo o
 * `id` original, então a entrada sincronizada com sufixo ainda pode colidir
 * no app com a de outro usuário; aceito como limitação conhecida.
 */
export async function syncBookToSupabase(book: GameBook, ownerId: string): Promise<SyncBookResult> {
  if (!supabase) return { success: false, error: "Backend não configurado." };

  const payload = {
    owner_id: ownerId,
    slug: book.id,
    title: book.title,
    short_description: book.description.slice(0, 200),
    description: book.description,
    cover_url: book.cover ?? null,
    genre: book.genre ?? null,
    age_rating: book.ageRating ?? null,
    content_data: book,
    estimated_sections: Object.keys(book.sections).length,
    estimated_reading_time: book.estimatedDuration ?? null,
  };

  const { error } = await supabase.from("books").upsert(payload, { onConflict: "slug" });
  if (!error) return { success: true };

  const { error: retryError } = await supabase
    .from("books")
    .insert({ ...payload, slug: `${book.id}-${randomSlugSuffix()}` });
  if (!retryError) return { success: true };

  return { success: false, error: retryError.message };
}

/** Apaga a linha correspondente em `books` no Supabase (política `books: dono ou admin apaga` já cobre). Best-effort — erro é engolido, quem chama decide o que fazer com o resultado. */
export async function deleteBookFromSupabase(supabaseBookId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const { error } = await supabase.from("books").delete().eq("id", supabaseBookId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteUserBook(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([META_STORE, ASSET_STORE], "readwrite");
  tx.objectStore(META_STORE).delete(id);

  const assetStore = tx.objectStore(ASSET_STORE);
  const keys = await idbRequest<IDBValidKey[]>(assetStore.getAllKeys());
  const prefix = `${id}:`;
  for (const key of keys) {
    if (typeof key === "string" && key.startsWith(prefix)) assetStore.delete(key);
  }

  await idbTxDone(tx);
}
