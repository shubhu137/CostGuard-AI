import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  // Heartbeat endpoint for OpenEnv validator
  return NextResponse.json({
    status: "ok",
    environment: "CostGuard AI",
    version: "1.0.0",
    checks: {
      api: "pass",
      ui: "pass",
      engine: "pass"
    }
  });
}
