import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  previewUrl: string | undefined;
  onChange: (file: File | null) => void;
}

export function ImageUploadField({ label, previewUrl, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-parchment-400">{label}</span>
      <div className="flex items-center gap-3">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="h-16 w-16 rounded-md border border-parchment-700/40 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-parchment-700/40 text-parchment-500">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => inputRef.current?.click()}>
            <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" /> {previewUrl ? "Trocar imagem" : "Enviar imagem"}
          </button>
          {previewUrl && (
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs text-red-300"
              onClick={() => onChange(null)}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Remover
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onChange(file);
        }}
      />
    </div>
  );
}
