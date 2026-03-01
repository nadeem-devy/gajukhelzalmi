import { NextResponse } from "next/server";
import { loadNotifications, readAllRows, updateRow } from "@/lib/google-sheets";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import type { Notification } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<Notification[]>("notifications");
    if (cached) return NextResponse.json(cached);

    const notifications = await loadNotifications();
    setCache("notifications", notifications);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to load notifications:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

// Mark all notifications as read
export async function PATCH() {
  try {
    const rows = await readAllRows("Notifications");
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][7] !== "TRUE" && rows[i][7] !== "true") {
        rows[i][7] = "TRUE";
        await updateRow("Notifications", i, rows[i].map(v => v || ""));
      }
    }
    invalidateCache("notifications");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark all read:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
