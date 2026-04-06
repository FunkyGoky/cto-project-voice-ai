// ============================================================
// POST /api/deepgram/token
// Returns the Deepgram API key for client-side WebSocket STT.
// Protected by origin validation to prevent key extraction.
// ============================================================

import { NextResponse } from "next/server";
import { validateOrigin } from "../../_lib/validate-origin";

export async function POST(request: Request) {
  const originError = validateOrigin(request);
  if (originError) return originError;

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY not configured" },
      { status: 500 }
    );
  }
  return NextResponse.json({ apiKey });
}
