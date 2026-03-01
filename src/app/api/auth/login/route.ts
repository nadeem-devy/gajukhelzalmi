import { NextResponse } from "next/server";
import { readAllRows, rowToUser } from "@/lib/google-sheets";

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
    }

    const rows = await readAllRows("Users");

    // Find user by name (case-insensitive) and validate password
    // Users sheet columns: id, name, role, phone, village, joinedAt, password
    const matchingRow = rows.find(
      (r) => r[1]?.toLowerCase() === name.toLowerCase() && r[6] === password
    );

    if (!matchingRow) {
      return NextResponse.json({ error: "Invalid name or password" }, { status: 401 });
    }

    const user = rowToUser(matchingRow);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
