"use client";

import { formatCompact } from "./chart-utils";

interface BarGroup {
  label: string;
  income: number;
  expenses: number;
}

interface BarChartProps {
  data: BarGroup[];
  title: string;
  incomeLabel: string;
  expenseLabel: string;
}

export default function BarChart({ data, title, incomeLabel, expenseLabel }: BarChartProps) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);
  const chartH = 160;
  const barW = 14;
  const groupGap = 4;
  const groupW = barW * 2 + groupGap;
  const padding = { top: 20, bottom: 28, left: 44, right: 8 };
  const chartW = padding.left + padding.right + data.length * (groupW + 16);

  // Y-axis ticks
  const ticks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-warmgray-900 mb-1">{title}</h3>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
          <span className="text-2xs text-warmgray-500">{incomeLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
          <span className="text-2xs text-warmgray-500">{expenseLabel}</span>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <svg
          width={Math.max(chartW, 280)}
          height={chartH + padding.top + padding.bottom}
          className="block"
        >
          {/* Grid lines */}
          {ticks.map((tick) => {
            const y = padding.top + chartH - (tick / maxVal) * chartH;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartW - padding.right}
                  y2={y}
                  stroke="#e7e5e4"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-warmgray-400"
                  fontSize={9}
                >
                  {formatCompact(tick)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const x = padding.left + i * (groupW + 16) + 8;
            const incH = (d.income / maxVal) * chartH;
            const expH = (d.expenses / maxVal) * chartH;
            return (
              <g key={d.label}>
                {/* Income bar */}
                <rect
                  x={x}
                  y={padding.top + chartH - incH}
                  width={barW}
                  height={Math.max(incH, 1)}
                  rx={3}
                  fill="#22c55e"
                  className="transition-all duration-500"
                />
                {/* Expense bar */}
                <rect
                  x={x + barW + groupGap}
                  y={padding.top + chartH - expH}
                  width={barW}
                  height={Math.max(expH, 1)}
                  rx={3}
                  fill="#eab308"
                  className="transition-all duration-500"
                />
                {/* X label */}
                <text
                  x={x + groupW / 2}
                  y={padding.top + chartH + 16}
                  textAnchor="middle"
                  className="fill-warmgray-500"
                  fontSize={9}
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Base line */}
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={chartW - padding.right}
            y2={padding.top + chartH}
            stroke="#d6d3d1"
          />
        </svg>
      </div>
    </div>
  );
}
