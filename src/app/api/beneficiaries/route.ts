import { NextResponse } from "next/server";
import { loadBeneficiaries } from "@/lib/google-sheets";
import { getCached, setCache } from "@/lib/cache";
import type { Beneficiary } from "@/lib/types";

export async function GET() {
  try {
    const cached = getCached<Beneficiary[]>("beneficiaries");
    if (cached) return NextResponse.json(cached);

    const beneficiaries = await loadBeneficiaries();
    setCache("beneficiaries", beneficiaries);
    return NextResponse.json(beneficiaries);
  } catch (error) {
    console.error("Failed to load beneficiaries:", error);
    return NextResponse.json({ error: "Failed to load beneficiaries" }, { status: 500 });
  }
}
