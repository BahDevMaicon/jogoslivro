/** Fundo fixo com leve degradê/vinheta, usado fora da tela de leitura (que tem seu próprio `BookBackground`) para o app não parecer uma cor chapada. */
export function AppBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(207,143,44,0.07), transparent 60%)," +
          "linear-gradient(180deg, #17120b 0%, #120d08 45%, #0c0906 100%)",
      }}
    />
  );
}
