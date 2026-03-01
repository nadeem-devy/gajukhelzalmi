import { NextResponse } from "next/server";
import { loadRequests, appendRow, requestToRow } from "@/lib/google-sheets";
import { translateBatch } from "@/lib/google-translate";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import { generateId } from "@/lib/utils";
import type { Request as AppRequest } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<AppRequest[]>("requests");
    if (cached) return NextResponse.json(cached);

    const requests = await loadRequests();
    setCache("requests", requests);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to load requests:", error);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, phone, description, urgency, anonymous } = body;

    const [description_ur] = await translateBatch([description]);

    const newRequest: AppRequest = {
      id: generateId(),
      type,
      name: anonymous ? undefined : name,
      phone: anonymous ? undefined : phone,
      anonymous: !!anonymous,
      description,
      description_ur,
      urgency: urgency || undefined,
      status: "submitted",
      submittedAt: new Date().toISOString().split("T")[0],
    };

    await appendRow("Requests", requestToRow(newRequest));
    invalidateCache("requests");

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Failed to submit request:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
