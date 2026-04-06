// ============================================================
// POST /api/elevenlabs/token
// Returns the ElevenLabs API key for client-side TTS/STT.
// Protected by origin validation to prevent key extraction.
// ============================================================

import { NextResponse } from "next/server";
import { validateOrigin } from "../../_lib/validate-origin";

export async function POST(request: Request) {
  const originError = validateOrigin(request);
  if (originError) return originError;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY not configured" },
      { status: 500 }
    );
  }
  return NextResponse.json({ apiKey });
}
