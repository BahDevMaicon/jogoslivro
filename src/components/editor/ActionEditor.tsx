import { Plus, Trash2 } from "lucide-react";
import type { Action, EndStoryAction, StartTestAction, StatKey } from "@/types/story";
import { NumberField, SelectField, TextareaField, TextField } from "./fields";
import { STAT_OPTIONS } from "./constants";

type Option = { value: string; label: string };

interface ActionEditorProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
  itemOptions: Option[];
  enemyOptions: Option[];
  sectionOptions: Option[];
}

const ACTION_TYPE_OPTIONS: { value: Action["type"]; label: string }[] = [
  { value: "addItem", label: "Adicionar item" },
  { value: "removeItem", label: "Remover item" },
  { value: "modifyStat", label: "Modificar atributo" },
  { value: "restoreStat", label: "Restaurar atributo" },
  { value: "addGold", label: "Adicionar ouro" },
  { value: "removeGold", label: "Remover ouro" },
  { value: "addProvisions", label: "Adicionar provisões" },
  { value: "removeProvisions", label: "Remover provisões" },
  { value: "setFlag", label: "Ativar flag" },
  { value: "clearFlag", label: "Desativar flag" },
  { value: "logEvent", label: "Registrar evento no histórico" },
  { value: "startCombat", label: "Iniciar combate" },
  { value: "startTest", label: "Iniciar teste de dados" },
  { value: "goToSection", label: "Ir para seção" },
  { value: "endStory", label: "Finalizar história" },
];

function defaultAction(type: Action["type"]): Action {
  switch (type) {
    case "addItem":
    case "removeItem":
      return { type, itemId: "" };
    case "modifyStat":
      return { type, stat: "skill", value: 0 };
    case "restoreStat":
      return { type, stat: "skill" };
    case "addGold":
    case "removeGold":
    case "addProvisions":
    case "removeProvisions":
      return { type, value: 0 };
    case "setFlag":
    case "clearFlag":
      return { type, flag: "" };
    case "logEvent":
      return { type, message: "" };
    case "startCombat":
      return { type, enemyIds: [], onVictory: "", onDefeat: "" };
    case "startTest":
      return { type, testType: "luck", onSuccess: "", onFailure: "" };
    case "goToSection":
      return { type, sectionId: "" };
    case "endStory":
      return { type, ending: "victory", title: "", text: "" };
  }
}

export function ActionEditor({ actions, onChange, itemOptions, enemyOptions, sectionOptions }: ActionEditorProps) {
  function update(index: number, next: Action) {
    onChange(actions.map((a, i) => (i === index ? next : a)));
  }
  function remove(index: number) {
    onChange(actions.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-md border border-parchment-700/30 bg-nightwood-950/40 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SelectField
                label="Tipo de ação"
                value={action.type}
                options={ACTION_TYPE_OPTIONS}
                onChange={(v) => update(index, defaultAction(v as Action["type"]))}
              />
            </div>
            <button type="button" className="btn-secondary px-2.5 py-2 text-red-300" onClick={() => remove(index)} aria-label="Remover ação">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {(action.type === "addItem" || action.type === "removeItem") && (
            <SelectField label="Item" value={action.itemId} options={itemOptions} placeholder="— selecionar —" onChange={(v) => update(index, { ...action, itemId: v })} />
          )}

          {action.type === "modifyStat" && (
            <div className="grid grid-cols-2 gap-2">
              <SelectField label="Atributo" value={action.stat} options={STAT_OPTIONS} onChange={(v) => update(index, { ...action, stat: v as StatKey })} />
              <NumberField label="Valor (pode ser negativo)" value={action.value} onChange={(v) => update(index, { ...action, value: v })} />
            </div>
          )}

          {action.type === "restoreStat" && (
            <div className="grid grid-cols-2 gap-2">
              <SelectField label="Atributo" value={action.stat} options={STAT_OPTIONS} onChange={(v) => update(index, { ...action, stat: v as StatKey })} />
              <NumberField
                label="Valor (vazio = máximo)"
                value={action.value ?? 0}
                onChange={(v) => update(index, { ...action, value: v })}
              />
            </div>
          )}

          {(action.type === "addGold" || action.type === "removeGold" || action.type === "addProvisions" || action.type === "removeProvisions") && (
            <NumberField label="Valor" min={0} value={action.value} onChange={(v) => update(index, { ...action, value: v })} />
          )}

          {(action.type === "setFlag" || action.type === "clearFlag") && (
            <TextField label="Flag" value={action.flag} onChange={(v) => update(index, { ...action, flag: v })} placeholder="ex.: ajudou-o-ferreiro" />
          )}

          {action.type === "logEvent" && (
            <TextField label="Mensagem" value={action.message} onChange={(v) => update(index, { ...action, message: v })} />
          )}

          {action.type === "startCombat" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-parchment-400">Inimigos</span>
              <div className="flex flex-wrap gap-2">
                {enemyOptions.length === 0 && <span className="text-xs text-parchment-500">Crie inimigos na aba Inimigos primeiro.</span>}
                {enemyOptions.map((opt) => {
                  const checked = action.enemyIds.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${checked ? "border-ember-400 bg-ember-600/20 text-ember-300" : "border-parchment-700/40 text-parchment-300"}`}
                    >
                      <input
                        type="checkbox"
                        className="mr-1.5 accent-ember-500"
                        checked={checked}
                        onChange={(e) =>
                          update(index, {
                            ...action,
                            enemyIds: e.target.checked ? [...action.enemyIds, opt.value] : action.enemyIds.filter((id) => id !== opt.value),
                          })
                        }
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <SelectField label="Ao vencer, ir para" value={action.onVictory} options={sectionOptions} placeholder="— selecionar —" onChange={(v) => update(index, { ...action, onVictory: v })} />
                <SelectField label="Ao perder, ir para" value={action.onDefeat} options={sectionOptions} placeholder="— selecionar —" onChange={(v) => update(index, { ...action, onDefeat: v })} />
                <SelectField
                  label="Ao fugir, ir para (opcional)"
                  value={action.onFlee ?? ""}
                  options={sectionOptions}
                  placeholder="Fuga não permitida"
                  onChange={(v) => update(index, { ...action, onFlee: v || undefined })}
                />
              </div>
            </div>
          )}

          {action.type === "startTest" && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label="Tipo de teste"
                  value={action.testType}
                  options={[
                    { value: "luck", label: "Sorte" },
                    { value: "skill", label: "Habilidade" },
                    { value: "attribute", label: "Atributo específico" },
                    { value: "fixed", label: "Valor fixo" },
                  ]}
                  onChange={(v) => update(index, { ...action, testType: v as StartTestAction["testType"] })}
                />
                {action.testType === "attribute" && (
                  <SelectField label="Atributo" value={action.stat ?? "skill"} options={STAT_OPTIONS} onChange={(v) => update(index, { ...action, stat: v as StatKey })} />
                )}
                {action.testType === "fixed" && (
                  <NumberField label="Valor fixo" value={action.fixedValue ?? 0} onChange={(v) => update(index, { ...action, fixedValue: v })} />
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <SelectField label="Se sucesso, ir para" value={action.onSuccess} options={sectionOptions} placeholder="— selecionar —" onChange={(v) => update(index, { ...action, onSuccess: v })} />
                <SelectField label="Se falha, ir para" value={action.onFailure} options={sectionOptions} placeholder="— selecionar —" onChange={(v) => update(index, { ...action, onFailure: v })} />
              </div>
            </div>
          )}

          {action.type === "goToSection" && (
            <SelectField label="Seção" value={action.sectionId} options={sectionOptions} placeholder="— selecionar —" onChange={(v) => update(index, { ...action, sectionId: v })} />
          )}

          {action.type === "endStory" && (
            <div className="flex flex-col gap-2">
              <SelectField
                label="Tipo de final"
                value={action.ending}
                options={[
                  { value: "victory", label: "Vitória" },
                  { value: "defeat", label: "Derrota" },
                  { value: "neutral", label: "Neutro" },
                ]}
                onChange={(v) => update(index, { ...action, ending: v as EndStoryAction["ending"] })}
              />
              <TextField label="Título do final" value={action.title} onChange={(v) => update(index, { ...action, title: v })} />
              <TextareaField label="Texto do final" value={action.text} onChange={(v) => update(index, { ...action, text: v })} />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn-secondary self-start px-3 py-1.5 text-xs"
        onClick={() => onChange([...actions, defaultAction("logEvent")])}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Adicionar ação
      </button>
    </div>
  );
}
