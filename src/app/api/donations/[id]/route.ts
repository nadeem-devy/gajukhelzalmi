import { NextResponse } from "next/server";
import { readAllRows, updateRow, donationToRow, rowToDonation } from "@/lib/google-sheets";
import { invalidateCache } from "@/lib/cache";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, approverUserId } = body;

    const rows = await readAllRows("Donations");
    const rowIndex = rows.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    const donation = rowToDonation(rows[rowIndex]);
    const now = new Date().toISOString().split("T")[0];

    if (action === "approve") {
      donation.status = "approved";
      donation.approvedBy = approverUserId;
      donation.approvedAt = now;
    } else if (action === "reject") {
      donation.status = "rejected";
    }

    await updateRow("Donations", rowIndex, donationToRow(donation) as string[]);
    invalidateCache("donations");

    // Update campaign collectedAmount on approval
    if (action === "approve" && donation.campaignId) {
      const campRows = await readAllRows("Campaigns");
      const campIndex = campRows.findIndex((r) => r[0] === donation.campaignId);
      if (campIndex >= 0) {
        const row = campRows[campIndex];
        const newCollected = (Number(row[6]) || 0) + donation.amount;
        row[6] = String(newCollected);
        await updateRow("Campaigns", campIndex, row.map(v => v || ""));
        invalidateCache("campaigns");
      }
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Failed to update donation:", error);
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
  }
}
