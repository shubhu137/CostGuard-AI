import { NextResponse } from "next/server";

export async function GET() {
  // Mocking the OpenAI Models list API
  return NextResponse.json({
    object: "list",
    data: [
      {
        id: "gpt-4o",
        object: "model",
        created: 1715398819,
        owned_by: "costguard-ai",
      },
    ],
  });
}
