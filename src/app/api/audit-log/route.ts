import { NextResponse } from "next/server";
import { loadAuditLog } from "@/lib/google-sheets";
import { getCached, setCache } from "@/lib/cache";
import type { AuditEntry } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<AuditEntry[]>("auditLog");
    if (cached) return NextResponse.json(cached);

    const auditLog = await loadAuditLog();
    setCache("auditLog", auditLog);
    return NextResponse.json(auditLog);
  } catch (error) {
    console.error("Failed to load audit log:", error);
    return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
  }
}
