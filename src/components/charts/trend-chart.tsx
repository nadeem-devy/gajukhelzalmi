"use client";

import { formatCompact } from "./chart-utils";
import type { TrendPoint } from "./chart-utils";

interface TrendChartProps {
  data: TrendPoint[];
  title: string;
  incomeLabel: string;
  expenseLabel: string;
}

export default function TrendChart({ data, title, incomeLabel, expenseLabel }: TrendChartProps) {
  if (data.length < 2) return null;

  const chartH = 160;
  const padding = { top: 16, bottom: 28, left: 44, right: 8 };
  const w = Math.max(data.length * 48, 300);
  const svgW = w + padding.left + padding.right;
  const svgH = chartH + padding.top + padding.bottom;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.cumulativeIncome, d.cumulativeExpenses)),
    1
  );

  const getX = (i: number) => padding.left + (i / (data.length - 1)) * w;
  const getY = (v: number) => padding.top + chartH - (v / maxVal) * chartH;

  const incomeLine = data.map((d, i) => `${getX(i)},${getY(d.cumulativeIncome)}`).join(" ");
  const expenseLine = data.map((d, i) => `${getX(i)},${getY(d.cumulativeExpenses)}`).join(" ");

  // Fill area between income and expense lines
  const areaPath = [
    ...data.map((d, i) => `${getX(i)},${getY(d.cumulativeIncome)}`),
    ...data.map((d, i) => `${getX(data.length - 1 - i)},${getY(d.cumulativeExpenses)}`).reverse(),
  ].join(" ");

  // Y-axis ticks
  const ticks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-warmgray-900 mb-1">{title}</h3>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-2xs text-warmgray-500">{incomeLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-2xs text-warmgray-500">{expenseLabel}</span>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <svg width={svgW} height={svgH} className="block">
          {/* Grid lines */}
          {ticks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgW - padding.right}
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

          {/* Balance area fill */}
          <polygon points={areaPath} fill="#22c55e" fillOpacity={0.08} />

          {/* Income line */}
          <polyline
            points={incomeLine}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Expense line */}
          <polyline
            points={expenseLine}
            fill="none"
            stroke="#eab308"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <g key={d.month}>
              <circle cx={getX(i)} cy={getY(d.cumulativeIncome)} r={3} fill="#22c55e" />
              <circle cx={getX(i)} cy={getY(d.cumulativeExpenses)} r={3} fill="#eab308" />
              {/* X label */}
              <text
                x={getX(i)}
                y={svgH - 6}
                textAnchor="middle"
                className="fill-warmgray-500"
                fontSize={9}
              >
                {d.label}
              </text>
            </g>
          ))}

          {/* Base line */}
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={svgW - padding.right}
            y2={padding.top + chartH}
            stroke="#d6d3d1"
          />
        </svg>
      </div>
    </div>
  );
}
