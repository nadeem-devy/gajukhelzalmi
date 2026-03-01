import { NextResponse } from "next/server";
import { loadActivities, appendRow, activityToRow } from "@/lib/google-sheets";
import { translateBatch } from "@/lib/google-translate";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import { generateId } from "@/lib/utils";
import type { Activity } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<Activity[]>("activities");
    if (cached) return NextResponse.json(cached);

    const activities = await loadActivities();
    setCache("activities", activities);
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to load activities:", error);
    return NextResponse.json({ error: "Failed to load activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, whyItMatters, date, location, status, userId } = body;

    // Auto-translate to Urdu
    const [title_ur, description_ur, whyItMatters_ur, location_ur] = await translateBatch([
      title, description, whyItMatters, location,
    ]);

    const newActivity: Activity = {
      id: generateId(),
      title,
      title_ur,
      description,
      description_ur,
      whyItMatters,
      whyItMatters_ur,
      date,
      location,
      location_ur,
      status: status || "planned",
      volunteers: [],
      createdBy: userId,
      createdAt: new Date().toISOString().split("T")[0],
    };

    await appendRow("Activities", activityToRow(newActivity));
    invalidateCache("activities");

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
