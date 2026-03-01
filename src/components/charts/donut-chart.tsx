"use client";

import { formatCurrency } from "@/lib/utils";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Segment[];
  title: string;
  centerLabel?: string;
}

export default function DonutChart({ data, title, centerLabel }: DonutChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 55;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.value / total;
    const dashArray = pct * circumference;
    const dashOffset = -offset * circumference;
    offset += pct;
    return { ...d, pct, dashArray, dashOffset };
  });

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-warmgray-900 mb-4">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#e7e5e4"
              strokeWidth={strokeWidth}
            />
            {/* Data segments */}
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                className="transition-all duration-700 ease-out"
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-extrabold text-warmgray-900">
              {formatCurrency(total)}
            </span>
            {centerLabel && (
              <span className="text-2xs text-warmgray-500">{centerLabel}</span>
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-0">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-warmgray-600 truncate">{seg.label}</span>
              <span className="text-xs font-bold text-warmgray-900 ml-auto whitespace-nowrap">
                {Math.round(seg.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
