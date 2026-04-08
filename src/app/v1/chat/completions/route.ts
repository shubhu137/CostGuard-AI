import { NextResponse } from "next/server";
import { buildSummary } from "@/lib/analyzers";

export async function POST(req: Request) {
  try {
    // We mock the Chat Completions response by providing the real CostGuard summary
    // as if the AI just performed the analysis.
    const summary = buildSummary();
    const content = `Based on current cloud scans, I have identified ${summary.totalIssues} issues with an estimated monthly waste of $${summary.totalSavings}. I recommend deleting unattached volumes and closing public ports 22/3389 immediately.`;

    return NextResponse.json({
      id: "chatcmpl-" + Math.random().toString(36).substring(7),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gpt-4o",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: content,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 50,
        total_tokens: 60,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate completion" }, { status: 500 });
  }
}
