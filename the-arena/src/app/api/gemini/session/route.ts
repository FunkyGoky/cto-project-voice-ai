// ============================================================
// POST /api/gemini/session
// Returns the API key for Gemini Live WebSocket connection.
// Gemini Live API uses API key directly in the WebSocket URL,
// so we return it as a one-time use token from the server.
// Protected by origin validation to prevent key extraction.
// ============================================================

import { NextResponse } from "next/server";
import { validateOrigin } from "../../_lib/validate-origin";

export async function POST(request: Request) {
  const originError = validateOrigin(request);
  if (originError) return originError;

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Return the key for the client to use in the WebSocket URL.
  // This is the pattern Gemini uses — the key is in the URL query param.
  return NextResponse.json({ apiKey });
}
