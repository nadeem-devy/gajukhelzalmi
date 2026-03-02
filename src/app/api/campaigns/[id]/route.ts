import { NextResponse } from "next/server";
import { findRowIndex, readAllRows, updateRow, campaignToRow, rowToCampaign, rowToCampaignExpense, rowToCampaignUpdate } from "@/lib/google-sheets";
import { invalidateCache } from "@/lib/cache";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const rowIndex = await findRowIndex("Campaigns", id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Load current campaign data
    const [campRows, expRows, updRows] = await Promise.all([
      readAllRows("Campaigns"),
      readAllRows("CampaignExpenses"),
      readAllRows("CampaignUpdates"),
    ]);

    const row = campRows[rowIndex];
    const expenses = expRows.filter((r) => r[1] === id).map(rowToCampaignExpense);
    const updates = updRows.filter((r) => r[1] === id).map(rowToCampaignUpdate);
    const campaign = rowToCampaign(row, expenses, updates);

    // Apply updates
    if (body.title !== undefined) campaign.title = body.title;
    if (body.purpose !== undefined) campaign.purpose = body.purpose;
    if (body.targetAmount !== undefined) campaign.targetAmount = Number(body.targetAmount);
    if (body.collectedAmount !== undefined) campaign.collectedAmount = Number(body.collectedAmount);
    if (body.spentAmount !== undefined) campaign.spentAmount = Number(body.spentAmount);
    if (body.startDate !== undefined) campaign.startDate = body.startDate;
    if (body.endDate !== undefined) campaign.endDate = body.endDate || undefined;
    if (body.status !== undefined) campaign.status = body.status;

    await updateRow("Campaigns", rowIndex, campaignToRow(campaign));
    invalidateCache("campaigns");

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}
