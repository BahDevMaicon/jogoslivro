/**
 * Define o filtro SVG de grão de papel usado pela classe utilitária `.paper-texture`.
 * Deve ser montado uma única vez (ex.: dentro de `Book.tsx`) — o próprio componente
 * não renderiza nada visível, só a definição do filtro referenciada via `url(#paper-grain)`.
 */
export function PaperTexture() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute" }}>
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
      </filter>
    </svg>
  );
}
