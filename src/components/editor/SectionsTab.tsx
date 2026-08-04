import { useState } from "react";
import { Pencil, Plus, ScrollText, Trash2 } from "lucide-react";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import type { StorySection } from "@/types/story";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { SectionFormModal } from "./SectionFormModal";

export function SectionsTab() {
  const sections = useBookEditorStore((s) => s.book.sections);
  const startSection = useBookEditorStore((s) => s.book.startSection);
  const removeSection = useBookEditorStore((s) => s.removeSection);
  const [editing, setEditing] = useState<StorySection | null | undefined>(undefined);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);

  const sectionList = Object.values(sections);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-wide text-ember-400">Seções</h3>
        <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nova seção
        </button>
      </div>

      {sectionList.length === 0 && (
        <p className="flex flex-col items-center gap-2 rounded-md border border-dashed border-parchment-700/40 py-8 text-center text-sm text-parchment-400">
          <ScrollText className="h-6 w-6" aria-hidden="true" /> Nenhuma seção criada ainda.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {sectionList.map((section) => (
          <li key={section.id} className="flex items-center justify-between gap-3 rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-3">
            <div>
              <p className="font-display text-parchment-50">
                {section.title || section.id}
                {section.id === startSection && (
                  <span className="ml-2 rounded-full bg-ember-600/30 px-2 py-0.5 text-xs text-ember-300">Inicial</span>
                )}
              </p>
              <p className="text-xs text-parchment-400">
                {section.id} · {section.choices.length} escolha{section.choices.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary px-2.5 py-2" onClick={() => setEditing(section)} aria-label="Editar seção">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn-secondary px-2.5 py-2 text-red-300"
                onClick={() => setRemoveTargetId(section.id)}
                aria-label="Remover seção"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <SectionFormModal open={editing !== undefined} initialSection={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={removeTargetId !== null}
        title="Remover seção"
        message="Isso remove a seção do livro. Escolhas de outras seções que apontam para ela vão parar de funcionar até serem ajustadas. Continuar?"
        confirmLabel="Remover"
        danger
        onCancel={() => setRemoveTargetId(null)}
        onConfirm={() => {
          if (removeTargetId) removeSection(removeTargetId);
          setRemoveTargetId(null);
        }}
      />
    </div>
  );
}
