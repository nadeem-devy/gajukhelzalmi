"use client";

import { formatCurrency } from "@/lib/utils";

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarsProps {
  data: BarItem[];
  title: string;
  maxItems?: number;
}

const COLORS = [
  "bg-primary-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-red-400",
  "bg-orange-400",
];

export default function HorizontalBars({ data, title, maxItems = 7 }: HorizontalBarsProps) {
  if (data.length === 0) return null;

  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map((d) => d.value));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-warmgray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-warmgray-700 truncate max-w-[60%]">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-warmgray-900">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-2.5 bg-warmgray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${COLORS[i % COLORS.length]}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
