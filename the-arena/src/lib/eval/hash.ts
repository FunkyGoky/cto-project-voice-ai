// ============================================================
// Simple hash for prompt text — used to group sessions that
// share the same prompt for fair comparison.
// ============================================================

export async function hashPrompt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
}
