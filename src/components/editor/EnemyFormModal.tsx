import { useEffect, useState } from "react";
import { Modal } from "@/components/layout/Modal";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import type { StoryEnemy } from "@/types/story";
import { NumberField, SelectField, TextareaField, TextField } from "./fields";
import { ImageUploadField } from "./ImageUploadField";

function blankEnemy(): StoryEnemy {
  return { id: "", name: "", skill: 6, stamina: 6 };
}

interface EnemyFormModalProps {
  open: boolean;
  initialEnemy: StoryEnemy | null;
  onClose: () => void;
}

export function EnemyFormModal({ open, initialEnemy, onClose }: EnemyFormModalProps) {
  const items = useBookEditorStore((s) => s.book.items);
  const upsertEnemy = useBookEditorStore((s) => s.upsertEnemy);
  const setImage = useBookEditorStore((s) => s.setImage);
  const existingPreview = useBookEditorStore((s) =>
    initialEnemy ? s.imageAssets.get(`enemy:${initialEnemy.id}:image`)?.previewUrl : undefined
  );

  const [enemy, setEnemy] = useState<StoryEnemy>(initialEnemy ?? blankEnemy());
  const [imageChange, setImageChange] = useState<File | null | "keep">("keep");
  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEnemy(initialEnemy ?? blankEnemy());
      setImageChange("keep");
      setError(null);
    }
  }, [open, initialEnemy]);

  useEffect(() => {
    if (imageChange === "keep" || imageChange === null) {
      setLocalPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(imageChange);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageChange]);

  const previewUrl = imageChange === "keep" ? existingPreview : imageChange === null ? undefined : localPreview;
  const itemOptions = items.map((i) => ({ value: i.id, label: i.name }));

  function handleSubmit() {
    if (!enemy.id.trim() || !enemy.name.trim()) {
      setError("Preencha ao menos o id e o nome do inimigo.");
      return;
    }
    upsertEnemy(enemy);
    if (imageChange !== "keep") {
      setImage(`enemy:${enemy.id}:image`, imageChange);
    }
    onClose();
  }

  return (
    <Modal open={open} title={initialEnemy ? "Editar inimigo" : "Novo inimigo"} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {error && <p className="rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">{error}</p>}

        <TextField
          label="Id (único)"
          value={enemy.id}
          disabled={Boolean(initialEnemy)}
          hint={initialEnemy ? "O id não pode ser alterado depois de criado." : "ex.: goblin"}
          onChange={(v) => setEnemy((p) => ({ ...p, id: v }))}
          required
        />
        <TextField label="Nome" value={enemy.name} onChange={(v) => setEnemy((p) => ({ ...p, name: v }))} required />

        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Habilidade" value={enemy.skill} onChange={(v) => setEnemy((p) => ({ ...p, skill: v }))} />
          <NumberField label="Energia" min={1} value={enemy.stamina} onChange={(v) => setEnemy((p) => ({ ...p, stamina: v }))} />
        </div>

        <TextareaField label="Descrição (opcional)" value={enemy.description ?? ""} onChange={(v) => setEnemy((p) => ({ ...p, description: v || undefined }))} />
        <ImageUploadField label="Imagem (opcional)" previewUrl={previewUrl} onChange={setImageChange} />
        <TextareaField
          label="Texto ao derrotar (opcional)"
          value={enemy.defeatText ?? ""}
          onChange={(v) => setEnemy((p) => ({ ...p, defeatText: v || undefined }))}
        />
        <NumberField label="Pontos ao derrotar" min={0} value={enemy.points ?? 0} onChange={(v) => setEnemy((p) => ({ ...p, points: v || undefined }))} />

        <SelectField
          label="Item de loot (opcional)"
          value={enemy.lootItemId ?? ""}
          options={itemOptions}
          placeholder="Nenhum"
          onChange={(v) => setEnemy((p) => ({ ...p, lootItemId: v || undefined, lootChancePercent: v ? p.lootChancePercent : undefined }))}
        />
        {enemy.lootItemId && (
          <NumberField
            label="Chance de deixar o item (%)"
            min={0}
            max={100}
            value={enemy.lootChancePercent ?? 0}
            onChange={(v) => setEnemy((p) => ({ ...p, lootChancePercent: v }))}
          />
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            Salvar inimigo
          </button>
        </div>
      </div>
    </Modal>
  );
}
