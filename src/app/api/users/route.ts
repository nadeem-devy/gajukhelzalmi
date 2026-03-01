import { NextResponse } from "next/server";
import { loadUsers } from "@/lib/google-sheets";
import { getCached, setCache } from "@/lib/cache";
import type { User } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<User[]>("users");
    if (cached) return NextResponse.json(cached);

    const users = await loadUsers();
    setCache("users", users);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to load users:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
