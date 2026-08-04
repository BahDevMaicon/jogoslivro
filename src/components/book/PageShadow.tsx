/** Sombra estática na dobra do livro. */
export function PageShadow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-10 rounded-l-[inherit] bg-gradient-to-r from-black/35 to-transparent"
    />
  );
}
