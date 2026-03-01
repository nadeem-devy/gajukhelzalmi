import { NextResponse } from "next/server";
import { loadAidRecords } from "@/lib/google-sheets";
import { getCached, setCache } from "@/lib/cache";
import type { AidRecord } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<AidRecord[]>("aidRecords");
    if (cached) return NextResponse.json(cached);

    const aidRecords = await loadAidRecords();
    setCache("aidRecords", aidRecords);
    return NextResponse.json(aidRecords);
  } catch (error) {
    console.error("Failed to load aid records:", error);
    return NextResponse.json({ error: "Failed to load aid records" }, { status: 500 });
  }
}
