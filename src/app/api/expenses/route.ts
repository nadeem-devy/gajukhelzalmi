import { NextResponse } from "next/server";
import { loadExpenses } from "@/lib/google-sheets";
import { getCached, setCache } from "@/lib/cache";
import type { Expense } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<Expense[]>("expenses");
    if (cached) return NextResponse.json(cached);

    const expenses = await loadExpenses();
    setCache("expenses", expenses);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to load expenses:", error);
    return NextResponse.json({ error: "Failed to load expenses" }, { status: 500 });
  }
}
