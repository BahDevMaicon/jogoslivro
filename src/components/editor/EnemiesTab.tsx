import { useState } from "react";
import { Pencil, Plus, Skull, Trash2 } from "lucide-react";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import type { StoryEnemy } from "@/types/story";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { EnemyFormModal } from "./EnemyFormModal";

export function EnemiesTab() {
  const enemies = useBookEditorStore((s) => s.book.enemies);
  const removeEnemy = useBookEditorStore((s) => s.removeEnemy);
  const [editing, setEditing] = useState<StoryEnemy | null | undefined>(undefined);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-wide text-ember-400">Inimigos</h3>
        <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo inimigo
        </button>
      </div>

      {enemies.length === 0 && (
        <p className="flex flex-col items-center gap-2 rounded-md border border-dashed border-parchment-700/40 py-8 text-center text-sm text-parchment-400">
          <Skull className="h-6 w-6" aria-hidden="true" /> Nenhum inimigo criado ainda.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {enemies.map((enemy) => (
          <li key={enemy.id} className="flex items-center justify-between gap-3 rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-3">
            <div>
              <p className="font-display text-parchment-50">{enemy.name || enemy.id}</p>
              <p className="text-xs text-parchment-400">
                Habilidade {enemy.skill} · Energia {enemy.stamina}
                {enemy.points ? ` · ${enemy.points} pts` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary px-2.5 py-2" onClick={() => setEditing(enemy)} aria-label="Editar inimigo">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-secondary px-2.5 py-2 text-red-300"
                onClick={() => setRemoveTargetId(enemy.id)}
                aria-label="Remover inimigo"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <EnemyFormModal open={editing !== undefined} initialEnemy={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={removeTargetId !== null}
        title="Remover inimigo"
        message="Isso remove o inimigo do livro. Combates/condições que o referenciam vão parar de funcionar até serem ajustados. Continuar?"
        confirmLabel="Remover"
        danger
        onCancel={() => setRemoveTargetId(null)}
        onConfirm={() => {
          if (removeTargetId) removeEnemy(removeTargetId);
          setRemoveTargetId(null);
        }}
      />
    </div>
  );
}
