import { NextResponse } from "next/server";
import { readAllRows, updateRow, rowToNotification, notificationToRow } from "@/lib/google-sheets";
import { invalidateCache } from "@/lib/cache";

// Mark single notification as read
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await readAllRows("Notifications");
    const rowIndex = rows.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const notification = rowToNotification(rows[rowIndex]);
    notification.read = true;
    await updateRow("Notifications", rowIndex, notificationToRow(notification) as string[]);
    invalidateCache("notifications");

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Failed to update notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

// Dismiss (delete) notification
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // For Sheets, we can't easily delete rows, so mark as dismissed by clearing the title
    const rows = await readAllRows("Notifications");
    const rowIndex = rows.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Mark as read and set a "dismissed" flag in the link field
    const notification = rowToNotification(rows[rowIndex]);
    notification.read = true;
    notification.link = "__dismissed__";
    await updateRow("Notifications", rowIndex, notificationToRow(notification) as string[]);
    invalidateCache("notifications");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to dismiss notification:", error);
    return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
  }
}
