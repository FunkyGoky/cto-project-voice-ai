// ============================================================
// Shared origin validation for API routes that return credentials.
// Rejects requests that don't originate from the app itself.
// ============================================================

import { NextResponse } from "next/server";

/**
 * Validates that a request originates from the app (same origin).
 * Returns null if valid, or an error Response to return immediately.
 */
export function validateOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // In production, require origin or referer to match the app.
  // If both headers are absent, reject — credential endpoints must not be callable
  // from contexts where the browser omits origin (e.g., direct URL access, extensions).
  const appHost = process.env.APP_BASE_URL;
  if (appHost) {
    const allowed = [appHost];
    const originMatch = origin && allowed.some((h) => origin.startsWith(h));
    const refererMatch = referer && allowed.some((h) => referer.startsWith(h));

    if (!originMatch && !refererMatch) {
      return NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 }
      );
    }
  }

  // In dev (no APP_BASE_URL), allow localhost origins only
  if (!appHost) {
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return NextResponse.json(
        { error: "Forbidden: invalid origin" },
        { status: 403 }
      );
    }
  }

  return null;
}
