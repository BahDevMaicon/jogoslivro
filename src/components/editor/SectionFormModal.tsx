import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/layout/Modal";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import type { Choice, StorySection } from "@/types/story";
import { FieldGroup, NumberField, SelectField, TextareaField, TextField, ToggleField } from "./fields";
import { ImageUrlField } from "./ImageUrlField";
import { ActionEditor } from "./ActionEditor";
import { ConditionEditor } from "./ConditionEditor";

function blankSection(suggestedId: string): StorySection {
  return { id: suggestedId, title: "", paragraphs: [""], choices: [] };
}

function nextSectionId(existingIds: string[]): string {
  let n = existingIds.length + 1;
  while (existingIds.includes(`secao-${n}`)) n++;
  return `secao-${n}`;
}

function nextChoiceId(sectionId: string, existing: Choice[]): string {
  let n = existing.length + 1;
  const ids = new Set(existing.map((c) => c.id));
  while (ids.has(`${sectionId}-escolha-${n}`)) n++;
  return `${sectionId}-escolha-${n}`;
}

interface SectionFormModalProps {
  open: boolean;
  initialSection: StorySection | null;
  onClose: () => void;
}

export function SectionFormModal({ open, initialSection, onClose }: SectionFormModalProps) {
  const book = useBookEditorStore((s) => s.book);
  const upsertSection = useBookEditorStore((s) => s.upsertSection);

  const [section, setSection] = useState<StorySection>(
    initialSection ?? blankSection(nextSectionId(Object.keys(book.sections)))
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSection(initialSection ?? blankSection(nextSectionId(Object.keys(book.sections))));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSection]);

  const itemOptions = book.items.map((i) => ({ value: i.id, label: i.name }));
  const enemyOptions = book.enemies.map((e) => ({ value: e.id, label: e.name }));
  const sectionOptions = Object.values(book.sections).map((s) => ({ value: s.id, label: s.title || s.id }));

  function updateParagraph(index: number, text: string) {
    setSection((p) => ({ ...p, paragraphs: p.paragraphs.map((par, i) => (i === index ? text : par)) }));
  }
  function moveParagraph(index: number, dir: -1 | 1) {
    setSection((p) => {
      const next = [...p.paragraphs];
      const target = index + dir;
      if (target < 0 || target >= next.length) return p;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...p, paragraphs: next };
    });
  }

  function updateChoice(index: number, next: Choice) {
    setSection((p) => ({ ...p, choices: p.choices.map((c, i) => (i === index ? next : c)) }));
  }
  function removeChoice(index: number) {
    setSection((p) => ({ ...p, choices: p.choices.filter((_, i) => i !== index) }));
  }
  function addChoice() {
    setSection((p) => ({
      ...p,
      choices: [...p.choices, { id: nextChoiceId(p.id, p.choices), text: "", target: "" }],
    }));
  }

  function handleSubmit() {
    if (!section.id.trim() || section.paragraphs.length === 0 || !section.paragraphs.some((p) => p.trim())) {
      setError("Preencha o id da seção e ao menos um parágrafo.");
      return;
    }
    upsertSection(section);
    onClose();
  }

  return (
    <Modal open={open} title={initialSection ? "Editar seção" : "Nova seção"} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        {error && <p className="rounded-md border border-red-800/50 bg-red-950/30 p-2 text-sm text-red-200">{error}</p>}

        <TextField
          label="Id (único)"
          value={section.id}
          disabled={Boolean(initialSection)}
          hint={initialSection ? "O id não pode ser alterado depois de criado." : undefined}
          onChange={(v) => setSection((p) => ({ ...p, id: v }))}
          required
        />
        <TextField label="Título (opcional)" value={section.title ?? ""} onChange={(v) => setSection((p) => ({ ...p, title: v || undefined }))} />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ToggleField
            label="Permite repetir escolhas"
            checked={section.canRepeat ?? false}
            onChange={(v) => setSection((p) => ({ ...p, canRepeat: v }))}
          />
          <ToggleField
            label="Permite descansar"
            checked={section.allowRest ?? false}
            onChange={(v) => setSection((p) => ({ ...p, allowRest: v, restEncounter: v ? p.restEncounter : undefined }))}
          />
          <ToggleField
            label="Permite comer"
            checked={section.allowEat ?? false}
            onChange={(v) => setSection((p) => ({ ...p, allowEat: v }))}
          />
        </div>

        {section.allowRest && (
          <FieldGroup title="Encontro durante o descanso (opcional)">
            <ToggleField
              label="Chance de emboscada ao tentar descansar"
              checked={Boolean(section.restEncounter)}
              onChange={(v) =>
                setSection((p) => ({
                  ...p,
                  restEncounter: v ? { chancePercent: 20, enemyIds: [], onVictory: "", onDefeat: "" } : undefined,
                }))
              }
            />
            {section.restEncounter && (
              <>
                <p className="text-xs text-parchment-400/70">
                  Se a emboscada ocorrer, o descanso é interrompido sem custo (nenhuma provisão é gasta, nenhum benefício é aplicado) e o combate começa.
                </p>
                <NumberField
                  label="Chance (%)"
                  min={0}
                  max={100}
                  value={section.restEncounter.chancePercent}
                  onChange={(v) => setSection((p) => ({ ...p, restEncounter: { ...p.restEncounter!, chancePercent: v } }))}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-parchment-400">Inimigos</span>
                  <div className="flex flex-wrap gap-2">
                    {enemyOptions.length === 0 && (
                      <span className="text-xs text-parchment-500">Crie inimigos na aba Inimigos primeiro.</span>
                    )}
                    {enemyOptions.map((opt) => {
                      const checked = section.restEncounter!.enemyIds.includes(opt.value);
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
                              setSection((p) => ({
                                ...p,
                                restEncounter: {
                                  ...p.restEncounter!,
                                  enemyIds: e.target.checked
                                    ? [...p.restEncounter!.enemyIds, opt.value]
                                    : p.restEncounter!.enemyIds.filter((id) => id !== opt.value),
                                },
                              }))
                            }
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <SelectField
                    label="Ao vencer, ir para"
                    value={section.restEncounter.onVictory}
                    options={sectionOptions}
                    placeholder="— selecionar —"
                    onChange={(v) => setSection((p) => ({ ...p, restEncounter: { ...p.restEncounter!, onVictory: v } }))}
                  />
                  <SelectField
                    label="Ao perder, ir para"
                    value={section.restEncounter.onDefeat}
                    options={sectionOptions}
                    placeholder="— selecionar —"
                    onChange={(v) => setSection((p) => ({ ...p, restEncounter: { ...p.restEncounter!, onDefeat: v } }))}
                  />
                  <SelectField
                    label="Ao fugir, ir para (opcional)"
                    value={section.restEncounter.onFlee ?? ""}
                    options={sectionOptions}
                    placeholder="Fuga não permitida"
                    onChange={(v) =>
                      setSection((p) => ({ ...p, restEncounter: { ...p.restEncounter!, onFlee: v || undefined } }))
                    }
                  />
                </div>
              </>
            )}
          </FieldGroup>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-parchment-400">Parágrafos</span>
          {section.paragraphs.map((par, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <TextareaField label={`Parágrafo ${index + 1}`} value={par} onChange={(v) => updateParagraph(index, v)} />
              </div>
              <div className="flex flex-col gap-1 pt-6">
                <button type="button" className="btn-secondary px-2 py-1" disabled={index === 0} onClick={() => moveParagraph(index, -1)} aria-label="Mover para cima">
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn-secondary px-2 py-1"
                  disabled={index === section.paragraphs.length - 1}
                  onClick={() => moveParagraph(index, 1)}
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn-secondary px-2 py-1 text-red-300"
                  onClick={() => setSection((p) => ({ ...p, paragraphs: p.paragraphs.filter((_, i) => i !== index) }))}
                  aria-label="Remover parágrafo"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary self-start px-3 py-1.5 text-xs"
            onClick={() => setSection((p) => ({ ...p, paragraphs: [...p.paragraphs, ""] }))}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Adicionar parágrafo
          </button>
        </div>

        <ImageUrlField
          label="Imagem da seção (opcional)"
          value={section.image ?? ""}
          onChange={(v) => setSection((p) => ({ ...p, image: v || undefined }))}
        />

        <FieldGroup title="Ações ao entrar na seção (opcional)">
          <ActionEditor
            actions={section.onEnter ?? []}
            onChange={(actions) => setSection((p) => ({ ...p, onEnter: actions.length > 0 ? actions : undefined }))}
            itemOptions={itemOptions}
            enemyOptions={enemyOptions}
            sectionOptions={sectionOptions}
          />
        </FieldGroup>

        <FieldGroup title="Escolhas">
          <p className="text-xs text-parchment-400/70">
            O destino de cada escolha só pode ser uma seção já existente — crie a seção de destino antes de referenciá-la aqui.
          </p>
          <div className="flex flex-col gap-3">
            {section.choices.map((choice, index) => (
              <div key={choice.id} className="flex flex-col gap-2 rounded-md border border-parchment-700/30 bg-nightwood-950/40 p-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <TextField label="Texto da escolha" value={choice.text} onChange={(v) => updateChoice(index, { ...choice, text: v })} required />
                  </div>
                  <button type="button" className="btn-secondary px-2.5 py-2 text-red-300" onClick={() => removeChoice(index)} aria-label="Remover escolha">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <TextField label="Id (único)" value={choice.id} onChange={(v) => updateChoice(index, { ...choice, id: v })} />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-parchment-400">Levar para</span>
                    <select
                      className="rounded-md border border-parchment-700/40 bg-nightwood-900 px-3 py-2 text-parchment-50"
                      value={choice.target}
                      onChange={(e) => updateChoice(index, { ...choice, target: e.target.value })}
                    >
                      <option value="">— selecionar —</option>
                      {sectionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <TextField
                  label="Texto quando bloqueada (opcional)"
                  value={choice.lockedReason ?? ""}
                  onChange={(v) => updateChoice(index, { ...choice, lockedReason: v || undefined })}
                />

                <div>
                  <span className="mb-1 block text-xs uppercase tracking-wide text-parchment-400">Condições para aparecer habilitada</span>
                  <ConditionEditor
                    conditions={choice.conditions ?? []}
                    onChange={(conditions) => updateChoice(index, { ...choice, conditions: conditions.length > 0 ? conditions : undefined })}
                    itemOptions={itemOptions}
                    enemyOptions={enemyOptions}
                    sectionOptions={sectionOptions}
                  />
                </div>

                <div>
                  <span className="mb-1 block text-xs uppercase tracking-wide text-parchment-400">Ações ao escolher</span>
                  <ActionEditor
                    actions={choice.actions ?? []}
                    onChange={(actions) => updateChoice(index, { ...choice, actions: actions.length > 0 ? actions : undefined })}
                    itemOptions={itemOptions}
                    enemyOptions={enemyOptions}
                    sectionOptions={sectionOptions}
                  />
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary self-start px-3 py-1.5 text-xs" onClick={addChoice}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Adicionar escolha
          </button>
        </FieldGroup>

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            Salvar seção
          </button>
        </div>
      </div>
    </Modal>
  );
}
