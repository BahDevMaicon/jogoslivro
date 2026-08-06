import type { DiceFormula, RulesConfig, StatKey } from "@/types/story";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import { FieldGroup, NumberField, SelectField, TextareaField, TextField, ToggleField } from "./fields";
import { ImageUrlField } from "./ImageUrlField";

const DICE_STATS: { key: StatKey; label: string }[] = [
  { key: "skill", label: "Habilidade" },
  { key: "stamina", label: "Energia" },
  { key: "luck", label: "Sorte" },
];

const AGE_RATING_OPTIONS = [
  { value: "Livre", label: "Livre" },
  { value: "10+", label: "10+" },
  { value: "12+", label: "12+" },
  { value: "14+", label: "14+" },
  { value: "16+", label: "16+" },
  { value: "18+", label: "18+" },
];

const RULE_TOGGLES: { key: keyof RulesConfig; label: string }[] = [
  { key: "useDefaultRules", label: "Usar explicações padrão da engine na tela de Regras" },
  { key: "fatigueSystem", label: "Sistema de fadiga" },
  { key: "restSystem", label: "Sistema de descanso" },
  { key: "provisions", label: "Ênfase em gerenciamento de provisões" },
  { key: "combatLuck", label: "Testar a Sorte em combate" },
];

export function BookInfoTab() {
  const mode = useBookEditorStore((s) => s.mode);
  const book = useBookEditorStore((s) => s.book);
  const updateMeta = useBookEditorStore((s) => s.updateMeta);
  const updateCharacterCreation = useBookEditorStore((s) => s.updateCharacterCreation);

  const sectionOptions = Object.values(book.sections).map((s) => ({ value: s.id, label: s.title || s.id }));

  function updateDiceFormula(stat: StatKey, patch: Partial<DiceFormula>) {
    updateCharacterCreation({ [stat]: { ...book.characterCreation[stat], ...patch } });
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup title="Identificação">
        <TextField
          label="Id (único, kebab-case)"
          value={book.id}
          disabled={mode === "edit"}
          hint={mode === "edit" ? "O id não pode ser alterado depois de criado." : "ex.: torre-do-feiticeiro"}
          onChange={(v) => updateMeta({ id: v })}
          required
        />
        <TextField label="Título" value={book.title} onChange={(v) => updateMeta({ title: v })} required />
        <TextField label="Autor" value={book.author} onChange={(v) => updateMeta({ author: v })} required />
        <TextareaField label="Descrição" value={book.description} onChange={(v) => updateMeta({ description: v })} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TextField label="Gênero (opcional)" value={book.genre ?? ""} onChange={(v) => updateMeta({ genre: v || undefined })} />
          <TextField
            label="Duração estimada (opcional)"
            value={book.estimatedDuration ?? ""}
            placeholder="ex.: 20-30 minutos"
            onChange={(v) => updateMeta({ estimatedDuration: v || undefined })}
          />
          <SelectField
            label="Classificação indicativa (opcional)"
            value={book.ageRating ?? ""}
            placeholder="— não definida —"
            options={AGE_RATING_OPTIONS}
            onChange={(v) => updateMeta({ ageRating: v || undefined })}
          />
        </div>
        <ImageUrlField label="Capa" value={book.cover ?? ""} onChange={(v) => updateMeta({ cover: v || undefined })} />
        <TextareaField
          label="Regras especiais (opcional, aparece nos detalhes e na tela de Regras)"
          value={book.rulesText ?? ""}
          onChange={(v) => updateMeta({ rulesText: v || undefined })}
        />
        <SelectField
          label="Seção inicial"
          value={book.startSection}
          options={sectionOptions}
          placeholder="— selecionar —"
          onChange={(v) => updateMeta({ startSection: v })}
        />
        {sectionOptions.length === 0 && (
          <p className="text-xs text-parchment-400/70">Crie ao menos uma seção na aba Seções para poder escolher a seção inicial.</p>
        )}
      </FieldGroup>

      <FieldGroup title="Criação de personagem">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DICE_STATS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2 rounded-md border border-parchment-700/30 bg-nightwood-950/40 p-3">
              <span className="text-sm text-parchment-200">{label}</span>
              <NumberField label="Dados" min={0} max={10} value={book.characterCreation[key].dice} onChange={(v) => updateDiceFormula(key, { dice: v })} />
              <NumberField label="Lados" min={2} max={100} value={book.characterCreation[key].sides} onChange={(v) => updateDiceFormula(key, { sides: v })} />
              <NumberField label="Modificador" value={book.characterCreation[key].modifier} onChange={(v) => updateDiceFormula(key, { modifier: v })} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Ouro inicial" min={0} value={book.characterCreation.gold} onChange={(v) => updateCharacterCreation({ gold: v })} />
          <NumberField label="Provisões iniciais" min={0} value={book.characterCreation.provisions} onChange={(v) => updateCharacterCreation({ provisions: v })} />
        </div>
      </FieldGroup>

      <FieldGroup title="Sistemas da engine">
        {RULE_TOGGLES.map(({ key, label }) => (
          <ToggleField
            key={key}
            label={label}
            checked={book.rules?.[key] ?? true}
            onChange={(v) => updateMeta({ rules: { ...book.rules, [key]: v } })}
          />
        ))}
      </FieldGroup>
    </div>
  );
}
