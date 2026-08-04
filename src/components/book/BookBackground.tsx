/** Fundo fixo de "mesa"/madeira escura atrás do livro aberto, com vinheta suave. */
export function BookBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(90,65,35,0.22), transparent 62%)," +
          "linear-gradient(180deg, #120d08 0%, #0e0a06 55%, #070504 100%)",
      }}
    />
  );
}
