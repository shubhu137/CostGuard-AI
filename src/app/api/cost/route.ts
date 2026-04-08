import { NextResponse } from "next/server";
import { analyzeCosts } from "@/lib/analyzers";
import { getScanMeta } from "@/lib/liveData";

export async function GET() {
  try {
    const issues = analyzeCosts();
    const totalSavings = issues.reduce((s, i) => s + i.estimatedSavings, 0);
    const meta = getScanMeta();

    return NextResponse.json({
      success: true,
      data: issues,
      generatedAt: meta.scanTime,
      scanId: meta.scanId,
      slot: meta.slot,
      nextScanIn: meta.nextScanIn,
      totalIssues: issues.length,
      totalSavings,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to analyze costs" }, { status: 500 });
  }
}
