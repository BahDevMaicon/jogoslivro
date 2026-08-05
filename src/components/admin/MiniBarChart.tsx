interface MiniBarChartProps {
  data: { label: string; value: number }[];
}

/** Mini gráfico de barras em SVG puro, sem dependência externa — só o suficiente para mostrar uma tendência. */
export function MiniBarChart({ data }: MiniBarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-parchment-400/70">Sem dados no período.</p>;
  }

  const width = 600;
  const height = 140;
  const paddingBottom = 24;
  const chartHeight = height - paddingBottom;
  const barGap = 4;
  const barWidth = Math.max(4, width / data.length - barGap);
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Acessos por dia">
      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * (chartHeight - 8);
        const x = i * (barWidth + barGap);
        const y = chartHeight - barHeight;
        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={y} width={barWidth} height={Math.max(1, barHeight)} className="fill-ember-500" rx={2}>
              <title>
                {d.label}: {d.value}
              </title>
            </rect>
            {(i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0) && (
              <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" className="fill-parchment-400 text-[9px]">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
