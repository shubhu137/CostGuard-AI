import { NextResponse } from "next/server";
import { analyzeSecurity } from "@/lib/analyzers";
import { getScanMeta } from "@/lib/liveData";

export async function GET() {
  try {
    const issues = analyzeSecurity();
    const meta = getScanMeta();

    return NextResponse.json({
      success: true,
      data: issues,
      generatedAt: meta.scanTime,
      scanId: meta.scanId,
      slot: meta.slot,
      nextScanIn: meta.nextScanIn,
      totalIssues: issues.length,
      totalSavings: 0,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to analyze security" }, { status: 500 });
  }
}
