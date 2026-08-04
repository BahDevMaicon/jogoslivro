import type { ReactNode } from "react";
import { BookBackground } from "./BookBackground";
import { PaperTexture } from "./PaperTexture";

interface BookProps {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Moldura central da experiência de leitura: fundo de mesa, textura de papel montada uma vez, cabeçalho/página/rodapé. */
export function Book({ header, footer, children }: BookProps) {
  return (
    <div className="relative min-h-screen">
      <BookBackground />
      <PaperTexture />
      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6">
        {header}
        <div className="flex-1">{children}</div>
        {footer}
      </div>
    </div>
  );
}
