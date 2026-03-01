import type { Donation, Expense } from "@/lib/types";

export interface MonthlyData {
  month: string;
  label: string;
  income: number;
  expenses: number;
}

export interface SourceBreakdown {
  source: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function getMonthlyComparison(
  donations: Donation[],
  expenses: Expense[],
  months = 6
): MonthlyData[] {
  const incomeMap: Record<string, number> = {};
  const expenseMap: Record<string, number> = {};

  for (const d of donations) {
    if (d.status !== "approved") continue;
    const key = getMonthKey(d.date);
    incomeMap[key] = (incomeMap[key] || 0) + d.amount;
  }

  for (const e of expenses) {
    if (e.status !== "approved") continue;
    const key = getMonthKey(e.date);
    expenseMap[key] = (expenseMap[key] || 0) + e.amount;
  }

  const allMonths = new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)]);
  const sorted = Array.from(allMonths).sort();
  const recent = sorted.slice(-months);

  return recent.map((month) => ({
    month,
    label: getMonthLabel(month),
    income: incomeMap[month] || 0,
    expenses: expenseMap[month] || 0,
  }));
}

const SOURCE_COLORS: Record<string, string> = {
  cash: "#22c55e",
  bank: "#3b82f6",
  jazzcash: "#ef4444",
  easypaisa: "#10b981",
};

export function getDonationsBySource(donations: Donation[]): SourceBreakdown[] {
  const map: Record<string, number> = {};

  for (const d of donations) {
    if (d.status !== "approved") continue;
    map[d.source] = (map[d.source] || 0) + d.amount;
  }

  const total = Object.values(map).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([source, amount]) => ({
      source,
      amount,
      percentage: Math.round((amount / total) * 100),
      color: SOURCE_COLORS[source] || "#a8a29e",
    }));
}

export function getExpensesByCategory(expenses: Expense[]): CategoryBreakdown[] {
  const map: Record<string, number> = {};

  for (const e of expenses) {
    if (e.status !== "approved") continue;
    map[e.category] = (map[e.category] || 0) + e.amount;
  }

  const total = Object.values(map).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100),
    }));
}

export interface TrendPoint {
  month: string;
  label: string;
  cumulativeIncome: number;
  cumulativeExpenses: number;
}

export function getCumulativeTrend(
  donations: Donation[],
  expenses: Expense[]
): TrendPoint[] {
  const monthly = getMonthlyComparison(donations, expenses, 24);
  let cumIncome = 0;
  let cumExpense = 0;

  return monthly.map((m) => {
    cumIncome += m.income;
    cumExpense += m.expenses;
    return {
      month: m.month,
      label: m.label,
      cumulativeIncome: cumIncome,
      cumulativeExpenses: cumExpense,
    };
  });
}

export function formatCompact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}
