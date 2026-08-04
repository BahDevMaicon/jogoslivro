import type { ReactNode } from "react";
import type { BookAccent } from "./bookAccents";

const ACCENT_CLASSES: Record<BookAccent, { spine: string; frame: string; icon: string }> = {
  ember: {
    spine: "from-ember-500 via-ember-600 to-nightwood-950",
    frame: "border-ember-400/40",
    icon: "text-ember-400",
  },
  moss: {
    spine: "from-moss-500 via-moss-600 to-nightwood-950",
    frame: "border-moss-400/40",
    icon: "text-moss-400",
  },
  azure: {
    spine: "from-azure-500 via-azure-600 to-nightwood-950",
    frame: "border-azure-400/40",
    icon: "text-azure-400",
  },
  wine: {
    spine: "from-wine-500 via-wine-600 to-nightwood-950",
    frame: "border-wine-400/40",
    icon: "text-wine-400",
  },
  amethyst: {
    spine: "from-amethyst-500 via-amethyst-600 to-nightwood-950",
    frame: "border-amethyst-400/40",
    icon: "text-amethyst-400",
  },
};

interface BookCoverProps {
  title: string;
  accent?: BookAccent;
  icon?: ReactNode;
  className?: string;
  imageUrl?: string;
}

export function BookCover({ title, accent = "ember", icon, className = "", imageUrl }: BookCoverProps) {
  const c = ACCENT_CLASSES[accent];

  return (
    <div className={`relative aspect-[2/3] w-full ${className}`}>
      {/* páginas espiadas do lado direito, simulando um livro fechado */}
      <div className="absolute inset-y-1 -right-px w-2 rounded-r-sm bg-parchment-100/90" aria-hidden="true" />
      <div className="absolute inset-y-1.5 right-0 w-1.5 rounded-r-sm bg-parchment-200/80" aria-hidden="true" />
      <div className="absolute inset-y-2 right-0.5 w-1 rounded-r-sm bg-parchment-300/60" aria-hidden="true" />

      {/* capa */}
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-r-md rounded-l-[3px] border ${c.frame} bg-gradient-to-br from-nightwood-800 to-nightwood-900 shadow-lg`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={`Capa de ${title}`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div
            className={`m-3 ml-[18px] flex flex-1 flex-col items-center justify-center gap-3 rounded border ${c.frame} px-3 py-4 text-center`}
          >
            {icon && <span className={c.icon}>{icon}</span>}
            <p className="line-clamp-4 font-display text-sm leading-snug text-parchment-50">{title}</p>
          </div>
        )}

        {/* lombada */}
        <div className={`absolute inset-y-0 left-0 w-[10px] bg-gradient-to-b ${c.spine}`} aria-hidden="true">
          <div className="absolute inset-y-2 left-1 w-px bg-nightwood-950/40" />
        </div>
      </div>
    </div>
  );
}
