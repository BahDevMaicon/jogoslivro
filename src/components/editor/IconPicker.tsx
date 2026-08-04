import { ITEM_ICONS } from "@/lib/itemIcons";

interface IconPickerProps {
  value: string | undefined;
  onChange: (icon: string) => void;
}

/** Grade de ícones padrão reconhecidos pelo inventário (mesma fonte usada em jogo, `src/lib/itemIcons.ts`). */
export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-parchment-400">Ícone</span>
      <div className="flex flex-wrap gap-2">
        {Object.entries(ITEM_ICONS).map(([key, Icon]) => (
          <button
            key={key}
            type="button"
            title={key}
            className={`flex h-11 w-11 items-center justify-center rounded-md border transition ${
              value === key
                ? "border-ember-400 bg-ember-600/20 text-ember-300"
                : "border-parchment-700/40 bg-nightwood-900 text-parchment-300 hover:border-parchment-500"
            }`}
            onClick={() => onChange(key)}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
