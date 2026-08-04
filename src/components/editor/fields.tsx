import type { ReactNode } from "react";

const inputClass =
  "rounded-md border border-parchment-700/40 bg-nightwood-900 px-3 py-2 text-parchment-50 placeholder:text-parchment-500/50 disabled:opacity-50";
const inputClassCompact =
  "rounded-md border border-parchment-700/40 bg-nightwood-900 px-2.5 py-1.5 text-sm text-parchment-50 placeholder:text-parchment-500/50 disabled:opacity-50";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  hint,
  compact,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={compact ? "text-[10px] uppercase tracking-wide text-parchment-400" : "text-xs uppercase tracking-wide text-parchment-400"}>
        {label}
        {required && " *"}
      </span>
      <input
        type="text"
        className={compact ? inputClassCompact : inputClass}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="text-xs text-parchment-400/70">{hint}</span>}
    </label>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-parchment-400">{label}</span>
      <textarea
        className={inputClass}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-parchment-400">{label}</span>
      <input
        type="number"
        className={inputClass}
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  compact,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={compact ? "text-[10px] uppercase tracking-wide text-parchment-400" : "text-xs uppercase tracking-wide text-parchment-400"}>
        {label}
      </span>
      <select
        className={compact ? inputClassCompact : inputClass}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-parchment-200">{label}</span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-ember-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-4">
      <legend className="px-1 font-display text-sm uppercase tracking-wide text-ember-400">{title}</legend>
      {children}
    </fieldset>
  );
}
