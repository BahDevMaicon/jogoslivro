import { Plus, Trash2 } from "lucide-react";
import type { Condition, StatKey } from "@/types/story";
import { NumberField, SelectField, TextField, ToggleField } from "./fields";
import { STAT_OPTIONS } from "./constants";

type Option = { value: string; label: string };

interface ConditionEditorProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  itemOptions: Option[];
  enemyOptions: Option[];
  sectionOptions: Option[];
}

const CONDITION_TYPE_OPTIONS: { value: Condition["type"]; label: string }[] = [
  { value: "hasItem", label: "Tem item" },
  { value: "notHasItem", label: "Não tem item" },
  { value: "statGreater", label: "Atributo maior que" },
  { value: "statLess", label: "Atributo menor que" },
  { value: "statEqual", label: "Atributo igual a" },
  { value: "flagActive", label: "Flag ativa" },
  { value: "flagInactive", label: "Flag inativa" },
  { value: "minGold", label: "Ouro mínimo" },
  { value: "enemyDefeated", label: "Inimigo derrotado" },
  { value: "sectionVisited", label: "Seção visitada" },
  { value: "choiceMade", label: "Escolha feita" },
];

function defaultCondition(type: Condition["type"]): Condition {
  switch (type) {
    case "hasItem":
    case "notHasItem":
      return { type, itemId: "" };
    case "statGreater":
    case "statLess":
    case "statEqual":
      return { type, stat: "skill", value: 0 };
    case "flagActive":
    case "flagInactive":
      return { type, flag: "" };
    case "minGold":
      return { type, value: 0 };
    case "enemyDefeated":
      return { type, enemyId: "" };
    case "sectionVisited":
      return { type, sectionId: "" };
    case "choiceMade":
      return { type, choiceId: "" };
  }
}

export function ConditionEditor({ conditions, onChange, itemOptions, enemyOptions, sectionOptions }: ConditionEditorProps) {
  function update(index: number, next: Condition) {
    onChange(conditions.map((c, i) => (i === index ? next : c)));
  }
  function remove(index: number) {
    onChange(conditions.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {conditions.map((cond, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-md border border-parchment-700/30 bg-nightwood-950/40 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SelectField
                label="Tipo de condição"
                value={cond.type}
                options={CONDITION_TYPE_OPTIONS}
                onChange={(v) => update(index, defaultCondition(v as Condition["type"]))}
              />
            </div>
            <button type="button" className="btn-secondary px-2.5 py-2 text-red-300" onClick={() => remove(index)} aria-label="Remover condição">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {(cond.type === "hasItem" || cond.type === "notHasItem") && (
            <SelectField
              label="Item"
              value={cond.itemId}
              options={itemOptions}
              placeholder="— selecionar —"
              onChange={(v) => update(index, { ...cond, itemId: v })}
            />
          )}

          {(cond.type === "statGreater" || cond.type === "statLess" || cond.type === "statEqual") && (
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Atributo"
                value={cond.stat}
                options={STAT_OPTIONS}
                onChange={(v) => update(index, { ...cond, stat: v as StatKey })}
              />
              <NumberField label="Valor" value={cond.value} onChange={(v) => update(index, { ...cond, value: v })} />
            </div>
          )}

          {(cond.type === "flagActive" || cond.type === "flagInactive") && (
            <TextField label="Flag" value={cond.flag} onChange={(v) => update(index, { ...cond, flag: v })} placeholder="ex.: ajudou-o-ferreiro" />
          )}

          {cond.type === "minGold" && (
            <NumberField label="Ouro mínimo" value={cond.value} min={0} onChange={(v) => update(index, { ...cond, value: v })} />
          )}

          {cond.type === "enemyDefeated" && (
            <SelectField
              label="Inimigo"
              value={cond.enemyId}
              options={enemyOptions}
              placeholder="— selecionar —"
              onChange={(v) => update(index, { ...cond, enemyId: v })}
            />
          )}

          {cond.type === "sectionVisited" && (
            <SelectField
              label="Seção"
              value={cond.sectionId}
              options={sectionOptions}
              placeholder="— selecionar —"
              onChange={(v) => update(index, { ...cond, sectionId: v })}
            />
          )}

          {cond.type === "choiceMade" && (
            <TextField label="Id da escolha" value={cond.choiceId} onChange={(v) => update(index, { ...cond, choiceId: v })} />
          )}

          <ToggleField label="Negar (NOT)" checked={cond.negate ?? false} onChange={(v) => update(index, { ...cond, negate: v })} />
        </div>
      ))}

      <button
        type="button"
        className="btn-secondary self-start px-3 py-1.5 text-xs"
        onClick={() => onChange([...conditions, defaultCondition("hasItem")])}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Adicionar condição
      </button>
    </div>
  );
}
