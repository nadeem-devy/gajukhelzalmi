import { NextResponse } from "next/server";
import { readAllRows, updateRow, requestToRow, rowToRequest, appendRow, aidRecordToRow } from "@/lib/google-sheets";
import { translateBatch } from "@/lib/google-translate";
import { invalidateCache } from "@/lib/cache";
import { generateId } from "@/lib/utils";
import type { AidRecord } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, adminUserId } = body;

    const rows = await readAllRows("Requests");
    const rowIndex = rows.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const req = rowToRequest(rows[rowIndex]);
    const now = new Date().toISOString().split("T")[0];

    if (action === "review") {
      req.status = "reviewing";
    } else if (action === "approve") {
      req.status = "approved";
      req.reviewedAt = now;
      req.reviewedBy = adminUserId;
    } else if (action === "reject") {
      req.status = "rejected";
      req.reviewedAt = now;
      req.reviewedBy = adminUserId;
    } else if (action === "convert") {
      req.status = "converted";
      req.reviewedAt = now;
      req.reviewedBy = adminUserId;

      // Create aid record
      const desc = req.description.slice(0, 80);
      const [desc_ur] = await translateBatch([desc]);
      const newAid: AidRecord = {
        id: generateId(),
        beneficiaryId: "b1",
        aidType: "other",
        description: desc,
        description_ur: desc_ur,
        status: "applied",
        appliedDate: now,
      };
      await appendRow("AidRecords", aidRecordToRow(newAid));
      invalidateCache("aidRecords");

      req.convertedTo = newAid.id;
    }

    await updateRow("Requests", rowIndex, requestToRow(req) as string[]);
    invalidateCache("requests");

    return NextResponse.json(req);
  } catch (error) {
    console.error("Failed to update request:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
