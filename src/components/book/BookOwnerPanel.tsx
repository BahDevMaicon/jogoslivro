import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, EyeOff, Image, Lock, Pencil, ShieldAlert, Tag, Tags, Trash2, Unlock } from "lucide-react";
import type { LibraryBookEntry } from "@/stores/libraryStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { supabase } from "@/lib/supabaseClient";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { TextField, ToggleField, NumberField } from "@/components/editor/fields";
import { ImageUrlField } from "@/components/editor/ImageUrlField";

interface BookOwnerPanelProps {
  entry: LibraryBookEntry;
  onDeleted: () => void;
}

/**
 * Painel de gestão do livro, visível só para dono ou admin (checado por
 * `canManageBook` em quem monta este componente). Publicar/despublicar,
 * visibilidade, preço e capa só fazem sentido para livros já sincronizados
 * com o Supabase (`entry.supabaseBookId`) — um rascunho ainda só local não
 * tem nada disso para editar aqui ainda.
 */
export function BookOwnerPanel({ entry, onDeleted }: BookOwnerPanelProps) {
  const navigate = useNavigate();
  const removeUserBook = useLibraryStore((s) => s.removeUserBook);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFree, setIsFree] = useState(entry.isFree);
  const [price, setPrice] = useState(entry.price);
  const [coverUrl, setCoverUrl] = useState(entry.book.cover ?? "");
  const [tagsText, setTagsText] = useState(entry.tags.join(", "));
  const [saved, setSaved] = useState<"price" | "cover" | "tags" | null>(null);

  const synced = Boolean(entry.supabaseBookId);

  async function updateBook(patch: Record<string, unknown>) {
    if (!supabase || !entry.supabaseBookId) return false;
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase.from("books").update(patch).eq("id", entry.supabaseBookId);
    setBusy(false);
    if (updateError) {
      setError("Não foi possível salvar a alteração.");
      return false;
    }
    return true;
  }

  async function handlePublishToggle() {
    if (entry.status === "published") {
      await updateBook({ status: "unpublished", visibility: "private" });
    } else {
      await updateBook({ status: "published", visibility: "public", published_at: new Date().toISOString() });
    }
    await useLibraryStore.getState().loadLibrary();
  }

  async function handleVisibilityToggle() {
    await updateBook({ visibility: entry.visibility === "public" ? "private" : "public" });
    await useLibraryStore.getState().loadLibrary();
  }

  async function handleSavePrice() {
    const ok = await updateBook({ is_free: isFree, price: isFree ? 0 : price });
    if (ok) {
      setSaved("price");
      setTimeout(() => setSaved(null), 2000);
    }
  }

  async function handleSaveCover() {
    // A capa exibida vem sempre de `content_data.cover` (o `story.json`), não
    // da coluna `cover_url` — atualiza os dois para não deixar a coluna
    // desatualizada, mas o que realmente muda a imagem é o `content_data`.
    const trimmed = coverUrl.trim();
    const updatedBook = { ...entry.book, cover: trimmed || undefined };
    const ok = await updateBook({ cover_url: trimmed || null, content_data: updatedBook });
    if (ok) {
      setSaved("cover");
      setTimeout(() => setSaved(null), 2000);
      await useLibraryStore.getState().loadLibrary();
    }
  }

  async function handleSaveTags() {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const ok = await updateBook({ tags });
    if (ok) {
      setSaved("tags");
      setTimeout(() => setSaved(null), 2000);
      await useLibraryStore.getState().loadLibrary();
    }
  }

  async function handleDelete() {
    setDeleteOpen(false);
    await removeUserBook(entry.book.id);
    onDeleted();
  }

  return (
    <div>
      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => navigate(`/edit-book/${entry.book.id}`)}>
          <Pencil className="h-4 w-4" aria-hidden="true" /> Editar livro
        </button>
        {synced && (
          <>
            <button type="button" className="btn-secondary" disabled={busy} onClick={handlePublishToggle}>
              {entry.status === "published" ? (
                <>
                  <EyeOff className="h-4 w-4" aria-hidden="true" /> Despublicar
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Publicar
                </>
              )}
            </button>
            <button type="button" className="btn-secondary" disabled={busy} onClick={handleVisibilityToggle}>
              {entry.visibility === "public" ? (
                <>
                  <Lock className="h-4 w-4" aria-hidden="true" /> Tornar privado
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" aria-hidden="true" /> Tornar público
                </>
              )}
            </button>
          </>
        )}
        <button type="button" className="btn-secondary text-red-300" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Excluir
        </button>
      </div>

      {synced && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-ember-400">
              <Tag className="h-4 w-4" aria-hidden="true" /> Preço
            </h3>
            <ToggleField label="Livro gratuito" checked={isFree} onChange={setIsFree} />
            {!isFree && (
              <div className="mt-2">
                <NumberField label="Preço (R$)" value={price} onChange={setPrice} min={0} />
              </div>
            )}
            <button type="button" className="btn-secondary mt-3" disabled={busy} onClick={handleSavePrice}>
              {saved === "price" ? "Salvo!" : "Salvar preço"}
            </button>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-ember-400">
              <Image className="h-4 w-4" aria-hidden="true" /> Capa
            </h3>
            <ImageUrlField label="URL da imagem" value={coverUrl} onChange={setCoverUrl} />
            <button type="button" className="btn-secondary mt-3" disabled={busy} onClick={handleSaveCover}>
              {saved === "cover" ? "Salvo!" : "Salvar capa"}
            </button>
          </div>

          <div className="sm:col-span-2">
            <h3 className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-ember-400">
              <Tags className="h-4 w-4" aria-hidden="true" /> Tags
            </h3>
            <TextField label="Separadas por vírgula" value={tagsText} onChange={setTagsText} placeholder="ex.: fantasia, combate, exploração" />
            <button type="button" className="btn-secondary mt-3" disabled={busy} onClick={handleSaveTags}>
              {saved === "tags" ? "Salvo!" : "Salvar tags"}
            </button>
          </div>
        </div>
      )}

      {!synced && (
        <p className="text-sm text-parchment-300/70">
          Este livro ainda não foi sincronizado com o servidor — salve-o no editor para liberar publicação, preço e capa.
        </p>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir livro"
        message="Isso remove o livro deste navegador e, se já estiver sincronizado, também do servidor. Não afeta o arquivo original na sua pasta. Continuar?"
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
