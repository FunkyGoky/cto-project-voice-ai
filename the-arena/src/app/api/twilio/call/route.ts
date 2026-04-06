// ============================================================
// POST /api/twilio/call
// Initiates an outbound call via Twilio. When answered, Twilio
// connects the call audio to our Media Streams webhook, which
// routes it through the selected voice AI fighter.
// ============================================================

import { NextResponse } from "next/server";

/** Escape special XML characters to prevent injection in TwiML */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const appBaseUrl = process.env.APP_BASE_URL;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json(
      { error: "Twilio credentials not configured" },
      { status: 500 }
    );
  }

  if (!appBaseUrl) {
    return NextResponse.json(
      { error: "APP_BASE_URL not configured — required for Twilio callbacks" },
      { status: 500 }
    );
  }

  try {
    const { toNumber, fighterConfig } = await request.json();

    if (!toNumber) {
      return NextResponse.json(
        { error: "toNumber is required" },
        { status: 400 }
      );
    }

    // Build TwiML that connects call audio to our Media Streams endpoint.
    // Use APP_BASE_URL env var instead of Host header to prevent spoofing.
    const configParam = encodeURIComponent(JSON.stringify(fighterConfig));
    const streamUrl = `${appBaseUrl}/api/twilio/media-stream?config=${configParam}`;

    const twiml = `
      <Response>
        <Connect>
          <Stream url="${escapeXml(streamUrl)}" />
        </Connect>
      </Response>
    `.trim();

    // Create the call via Twilio REST API
    const credentials = btoa(`${accountSid}:${authToken}`);
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Twiml: twiml,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Twilio call failed: ${err}` },
        { status: res.status }
      );
    }

    const call = await res.json();
    return NextResponse.json({
      callSid: call.sid,
      status: call.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
