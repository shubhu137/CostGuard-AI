import { NextResponse } from "next/server";
import { analyzeUsage } from "@/lib/analyzers";
import { getScanMeta } from "@/lib/liveData";

export const dynamic = "force-dynamic";

export async function GET() {
  const meta = getScanMeta();
  return NextResponse.json({
    success: true,
    data: analyzeUsage(),
    generatedAt: meta.scanTime,
    ...meta,
  }, { headers: { "X-Scan-Id": meta.scanId } });
}
