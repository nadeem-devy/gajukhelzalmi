import { NextResponse } from "next/server";
import { loadDonations, appendRow, donationToRow, readAllRows, updateRow, campaignToRow, rowToCampaign, readAllRows as readRows } from "@/lib/google-sheets";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import { generateId } from "@/lib/utils";
import type { Donation } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<Donation[]>("donations");
    if (cached) return NextResponse.json(cached);

    const donations = await loadDonations();
    setCache("donations", donations);
    return NextResponse.json(donations);
  } catch (error) {
    console.error("Failed to load donations:", error);
    return NextResponse.json({ error: "Failed to load donations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, source, donorName, anonymous, campaignId, notes, recordedBy } = body;

    const newDonation: Donation = {
      id: generateId(),
      amount: Number(amount),
      source,
      donorName: anonymous ? undefined : donorName,
      anonymous: !!anonymous,
      date: new Date().toISOString().split("T")[0],
      campaignId: campaignId || undefined,
      notes: notes || undefined,
      recordedBy,
    };

    await appendRow("Donations", donationToRow(newDonation));

    // Update campaign collectedAmount if linked
    if (campaignId) {
      const campRows = await readAllRows("Campaigns");
      const campIndex = campRows.findIndex((r) => r[0] === campaignId);
      if (campIndex >= 0) {
        const row = campRows[campIndex];
        const newCollected = (Number(row[6]) || 0) + Number(amount);
        row[6] = String(newCollected);
        await updateRow("Campaigns", campIndex, row.map(v => v || ""));
        invalidateCache("campaigns");
      }
    }

    invalidateCache("donations");
    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error("Failed to record donation:", error);
    return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
  }
}
