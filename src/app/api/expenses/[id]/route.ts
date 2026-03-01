import { NextResponse } from "next/server";
import { readAllRows, updateRow, expenseToRow, rowToExpense } from "@/lib/google-sheets";
import { invalidateCache } from "@/lib/cache";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, approverUserId } = body;

    const rows = await readAllRows("Expenses");
    const rowIndex = rows.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const expense = rowToExpense(rows[rowIndex]);
    const now = new Date().toISOString().split("T")[0];

    if (action === "approve") {
      expense.status = "approved";
      expense.approvedBy = approverUserId;
      expense.approvedAt = now;
    } else if (action === "reject") {
      expense.status = "rejected";
    }

    await updateRow("Expenses", rowIndex, expenseToRow(expense) as string[]);
    invalidateCache("expenses");

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to update expense:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}
