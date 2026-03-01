import { NextResponse } from "next/server";
import { loadCampaigns, appendRow, campaignToRow, campaignUpdateToRow } from "@/lib/google-sheets";
import { translateBatch } from "@/lib/google-translate";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import { generateId } from "@/lib/utils";
import type { Campaign } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<Campaign[]>("campaigns");
    if (cached) return NextResponse.json(cached);

    const campaigns = await loadCampaigns();
    setCache("campaigns", campaigns);
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Failed to load campaigns:", error);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, purpose, targetAmount, startDate, endDate, userId, authorName } = body;

    // Auto-translate
    const [title_ur, purpose_ur] = await translateBatch([title, purpose]);

    const launchMsg = `Campaign "${title}" launched!`;
    const [launchMsg_ur] = await translateBatch([launchMsg]);

    const updateId = generateId();
    const now = new Date().toISOString().split("T")[0];

    const newCampaign: Campaign = {
      id: generateId(),
      title,
      title_ur,
      purpose,
      purpose_ur,
      targetAmount: Number(targetAmount),
      collectedAmount: 0,
      spentAmount: 0,
      startDate,
      endDate: endDate || undefined,
      status: "active",
      expenses: [],
      updates: [{ id: updateId, date: now, message: launchMsg, message_ur: launchMsg_ur, author: authorName || "Admin" }],
      createdBy: userId,
      createdAt: now,
    };

    await appendRow("Campaigns", campaignToRow(newCampaign));
    await appendRow("CampaignUpdates", campaignUpdateToRow({
      ...newCampaign.updates[0],
      campaignId: newCampaign.id,
    }));

    invalidateCache("campaigns");
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
