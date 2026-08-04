import type { ReactNode } from "react";
import { PageShadow } from "./PageShadow";

interface BookPageProps {
  children: ReactNode;
  className?: string;
}

/** A superfície de papel de uma página aberta: textura, bordas envelhecidas, sombra, luz lateral. */
export function BookPage({ children, className = "" }: BookPageProps) {
  return (
    <div
      className={`book-page parchment-page-bg relative overflow-hidden rounded-md border-transparent px-8 py-14 sm:px-10 sm:py-16 md:p-14 ${className}`}
    >
      <PageShadow />
      <div className="relative">{children}</div>
    </div>
  );
}
