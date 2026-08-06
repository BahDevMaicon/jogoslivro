import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/layout/Modal";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import type { ItemEffect, ItemKind, StatKey, StoryItem } from "@/types/story";
import { NumberField, SelectField, TextareaField, TextField, ToggleField } from "./fields";
import { STAT_OPTIONS } from "./constants";
import { IconPicker } from "./IconPicker";
import { ImageUrlField } from "./ImageUrlField";

const KIND_OPTIONS: { value: ItemKind; label: string }[] = [
  { value: "weapon", label: "Arma" },
  { value: "armor", label: "Armadura" },
  { value: "consumable", label: "Consumível" },
  { value: "key", label: "Chave / item de enredo" },
  { value: "misc", label: "Diversos" },
];

function blankItem(): StoryItem {
  return { id: "", name: "", description: "", kind: "misc", discardable: true };
}

interface ItemFormModalProps {
  open: boolean;
  initialItem: StoryItem | null;
  onClose: () => void;
}

export function ItemFormModal({ open, initialItem, onClose }: ItemFormModalProps) {
  const upsertItem = useBookEditorStore((s) => s.upsertItem);

  const [item, setItem] = useState<StoryItem>(initialItem ?? blankItem());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setItem(initialItem ?? blankItem());
      setError(null);
    }
  }, [open, initialItem]);

  function updateEffect(index: number, patch: Partial<ItemEffect>) {
    setItem((prev) => ({
      ...prev,
      onUseEffects: (prev.onUseEffects ?? []).map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));
  }

  function handleSubmit() {
    if (!item.id.trim() || !item.name.trim()) {
      setError("Preencha ao menos o id e o nome do item.");
      return;
    }
    upsertItem(item);
    onClose();
  }

  return (
    <Modal open={open} title={initialItem ? "Editar item" : "Novo item"} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {error && <p className="rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">{error}</p>}

        <TextField
          label="Id (único)"
          value={item.id}
          disabled={Boolean(initialItem)}
          hint={initialItem ? "O id não pode ser alterado depois de criado." : "ex.: ancient-sword"}
          onChange={(v) => setItem((p) => ({ ...p, id: v }))}
          required
        />
        <TextField label="Nome" value={item.name} onChange={(v) => setItem((p) => ({ ...p, name: v }))} required />
        <TextareaField label="Descrição" value={item.description} onChange={(v) => setItem((p) => ({ ...p, description: v }))} />
        <SelectField label="Categoria" value={item.kind} options={KIND_OPTIONS} onChange={(v) => setItem((p) => ({ ...p, kind: v as ItemKind }))} />

        <IconPicker value={item.icon} onChange={(icon) => setItem((p) => ({ ...p, icon }))} />

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Bônus de dano (armas)"
            value={item.damageBonus ?? 0}
            onChange={(v) => setItem((p) => ({ ...p, damageBonus: v || undefined }))}
          />
          <NumberField
            label="Bônus de defesa (armaduras)"
            value={item.defenseBonus ?? 0}
            onChange={(v) => setItem((p) => ({ ...p, defenseBonus: v || undefined }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-parchment-400">Efeitos ao usar</span>
          {(item.onUseEffects ?? []).map((effect, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <SelectField
                  label="Atributo"
                  value={effect.stat}
                  options={[...STAT_OPTIONS, { value: "gold", label: "Ouro" }, { value: "provisions", label: "Provisões" }]}
                  onChange={(v) => updateEffect(index, { stat: v as StatKey | "gold" | "provisions" })}
                />
              </div>
              <div className="flex-1">
                <NumberField label="Valor" value={effect.value} onChange={(v) => updateEffect(index, { value: v })} />
              </div>
              <button
                type="button"
                className="btn-secondary px-2.5 py-2 text-red-300"
                onClick={() => setItem((p) => ({ ...p, onUseEffects: (p.onUseEffects ?? []).filter((_, i) => i !== index) }))}
                aria-label="Remover efeito"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary self-start px-3 py-1.5 text-xs"
            onClick={() => setItem((p) => ({ ...p, onUseEffects: [...(p.onUseEffects ?? []), { stat: "stamina", value: 0 }] }))}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Adicionar efeito
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ToggleField label="Consumível (some ao usar)" checked={item.consumable ?? false} onChange={(v) => setItem((p) => ({ ...p, consumable: v }))} />
          <ToggleField label="Pode ser descartado" checked={item.discardable ?? true} onChange={(v) => setItem((p) => ({ ...p, discardable: v }))} />
        </div>

        <TextareaField
          label="Texto ao olhar (opcional)"
          value={item.examineText ?? ""}
          onChange={(v) => setItem((p) => ({ ...p, examineText: v || undefined }))}
        />
        <ImageUrlField
          label="Imagem ao olhar (opcional)"
          value={item.examineImage ?? ""}
          onChange={(v) => setItem((p) => ({ ...p, examineImage: v || undefined }))}
        />

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            Salvar item
          </button>
        </div>
      </div>
    </Modal>
  );
}
