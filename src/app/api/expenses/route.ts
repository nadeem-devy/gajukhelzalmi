import { NextResponse } from "next/server";
import { loadExpenses, appendRow, expenseToRow } from "@/lib/google-sheets";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import { generateId } from "@/lib/utils";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, amount, category, campaignId, submittedBy } = body;

    const newExpense: Expense = {
      id: generateId(),
      description,
      amount: Number(amount),
      category,
      date: new Date().toISOString().split("T")[0],
      campaignId: campaignId || undefined,
      status: "pending",
      submittedBy,
      submittedAt: new Date().toISOString().split("T")[0],
    };

    await appendRow("Expenses", expenseToRow(newExpense));
    invalidateCache("expenses");
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Failed to record expense:", error);
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
