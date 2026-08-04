interface BrandMarkProps {
  className?: string;
}

/**
 * Marca do LivroQuest: livro aberto + um brilho de "busca/quest" no canto —
 * mesma composição do favicon (`public/favicon.svg`), aqui em `currentColor`
 * para herdar a cor do texto ao redor (inclusive no hover do nav).
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path d="M14 10.2c-2-1.3-4.5-1.3-6.5 0v9c2-1.3 4.5-1.3 6.5 0v-9z" fill="currentColor" fillOpacity="0.92" />
      <path d="M14 10.2c2-1.3 4.5-1.3 6.5 0v9c-2-1.3-4.5-1.3-6.5 0v-9z" fill="currentColor" fillOpacity="0.92" />
      <path d="M20.5 3l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" fill="currentColor" />
    </svg>
  );
}
