import { useState } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import { resolveItemIcon } from "@/lib/itemIcons";
import type { StoryItem } from "@/types/story";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { ItemFormModal } from "./ItemFormModal";

export function ItemsTab() {
  const items = useBookEditorStore((s) => s.book.items);
  const removeItem = useBookEditorStore((s) => s.removeItem);
  const [editing, setEditing] = useState<StoryItem | null | undefined>(undefined);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-wide text-ember-400">Itens</h3>
        <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo item
        </button>
      </div>

      {items.length === 0 && (
        <p className="flex flex-col items-center gap-2 rounded-md border border-dashed border-parchment-700/40 py-8 text-center text-sm text-parchment-400">
          <Package className="h-6 w-6" aria-hidden="true" /> Nenhum item criado ainda.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = resolveItemIcon(item);
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-3">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0 text-ember-400" aria-hidden="true" />
                <div>
                  <p className="font-display text-parchment-50">{item.name || item.id}</p>
                  <p className="text-xs text-parchment-400">{item.kind}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary px-2.5 py-2" onClick={() => setEditing(item)} aria-label="Editar item">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn-secondary px-2.5 py-2 text-red-300"
                  onClick={() => setRemoveTargetId(item.id)}
                  aria-label="Remover item"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ItemFormModal open={editing !== undefined} initialItem={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={removeTargetId !== null}
        title="Remover item"
        message="Isso remove o item do livro. Escolhas/condições que o referenciam vão parar de funcionar até serem ajustadas. Continuar?"
        confirmLabel="Remover"
        danger
        onCancel={() => setRemoveTargetId(null)}
        onConfirm={() => {
          if (removeTargetId) removeItem(removeTargetId);
          setRemoveTargetId(null);
        }}
      />
    </div>
  );
}
