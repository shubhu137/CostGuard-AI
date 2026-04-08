import { NextResponse } from "next/server";
import { buildSummary } from "@/lib/analyzers";
import { getScanMeta } from "@/lib/liveData";
import { TOP_RECOMMENDATIONS } from "@/lib/aiRecommendations";

export async function GET() {
  try {
    const summary = buildSummary();
    const meta = getScanMeta();

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        topRecommendations: TOP_RECOMMENDATIONS,
        scanId: meta.scanId,
        slot: meta.slot,
        nextScanIn: meta.nextScanIn,
      },
      generatedAt: meta.scanTime,
      scanId: meta.scanId,
      slot: meta.slot,
      nextScanIn: meta.nextScanIn,
      totalIssues: summary.totalIssues,
      totalSavings: summary.totalSavings,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to generate summary" }, { status: 500 });
  }
}
