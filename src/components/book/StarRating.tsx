import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  /** Média (pode ser fracionária) ou, em modo interativo, a nota já escolhida. */
  value: number;
  /** Quando definido, mostra a contagem de avaliações ao lado das estrelas. */
  count?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

/**
 * Somente-leitura por padrão (usado no card da Biblioteca e na aba
 * Informações); `interactive` liga o modo de avaliar (clique define 1-5,
 * hover faz preview) — nunca renderiza `<button>` em modo leitura, porque o
 * card inteiro da Biblioteca já é um `<button>` e botão dentro de botão é
 * HTML inválido.
 */
export function StarRating({ value, count, size = "md", interactive = false, onChange, className }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const displayValue = hover ?? value;
  const rounded = Math.round(displayValue);
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <div className="flex items-center gap-0.5" onMouseLeave={() => interactive && setHover(null)}>
        {[1, 2, 3, 4, 5].map((n) =>
          interactive ? (
            <button
              key={n}
              type="button"
              className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400"
              onClick={() => onChange?.(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            >
              <Star className={`${starSize} ${n <= rounded ? "fill-amber-400 text-amber-400" : "text-parchment-600"}`} aria-hidden="true" />
            </button>
          ) : (
            <Star
              key={n}
              className={`${starSize} ${n <= rounded ? "fill-amber-400 text-amber-400" : "text-parchment-600"}`}
              aria-hidden="true"
            />
          )
        )}
      </div>
      {count !== undefined && (
        <span className="text-xs text-parchment-400">
          {value > 0 && `(${value.toFixed(1).replace(".", ",")}) `}
          {count === 0 ? "Sem avaliações ainda" : `${count} ${count === 1 ? "avaliação" : "avaliações"}`}
        </span>
      )}
    </div>
  );
}
