import { NextResponse } from "next/server";
import { readAllRows, updateRow, aidRecordToRow, rowToAidRecord } from "@/lib/google-sheets";
import { invalidateCache } from "@/lib/cache";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, approverUserId } = body;

    const rows = await readAllRows("AidRecords");
    const rowIndex = rows.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Aid record not found" }, { status: 404 });
    }

    const record = rowToAidRecord(rows[rowIndex]);
    const now = new Date().toISOString().split("T")[0];

    if (action === "verify") {
      record.status = "verified";
      record.verifiedDate = now;
    } else if (action === "approve") {
      record.status = "approved";
      record.approvedDate = now;
      record.approvedBy = approverUserId;
    } else if (action === "deliver") {
      record.status = "delivered";
      record.deliveredDate = now;
    }

    await updateRow("AidRecords", rowIndex, aidRecordToRow(record) as string[]);
    invalidateCache("aidRecords");
    invalidateCache("beneficiaries");

    return NextResponse.json(record);
  } catch (error) {
    console.error("Failed to update aid record:", error);
    return NextResponse.json({ error: "Failed to update aid record" }, { status: 500 });
  }
}
