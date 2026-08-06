import { useState } from "react";
import { ImageOff, ImagePlus, X } from "lucide-react";

interface ImageUrlFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ImageUrlField({ label, value, onChange, placeholder }: ImageUrlFieldProps) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-parchment-400">{label}</span>
      <div className="flex items-center gap-3">
        {value && !broken ? (
          <img
            src={value}
            alt=""
            className="h-16 w-16 rounded-md border border-parchment-700/40 object-cover"
            onError={() => setBroken(true)}
            onLoad={() => setBroken(false)}
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-parchment-700/40 text-parchment-500">
            {value && broken ? (
              <ImageOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1.5">
          <input
            type="url"
            className="rounded-md border border-parchment-700/40 bg-nightwood-900 px-3 py-2 text-parchment-50 placeholder:text-parchment-500/50"
            value={value}
            placeholder={placeholder ?? "https://..."}
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
          />
          {value && broken && <p className="text-xs text-red-300">Não foi possível carregar essa imagem.</p>}
          {value && (
            <button
              type="button"
              className="btn-secondary self-start px-3 py-1.5 text-xs text-red-300"
              onClick={() => onChange("")}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
