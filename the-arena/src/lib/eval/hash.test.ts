import { describe, it, expect } from "vitest";
import { hashPrompt } from "./hash";

describe("hashPrompt", () => {
  it("produces deterministic output", async () => {
    const a = await hashPrompt("You are a helpful assistant.");
    const b = await hashPrompt("You are a helpful assistant.");
    expect(a).toBe(b);
  });

  it("produces different hashes for different inputs", async () => {
    const a = await hashPrompt("Prompt A");
    const b = await hashPrompt("Prompt B");
    expect(a).not.toBe(b);
  });

  it("returns a 12-character hex string", async () => {
    const hash = await hashPrompt("test prompt");
    expect(hash).toHaveLength(12);
    expect(hash).toMatch(/^[0-9a-f]{12}$/);
  });
});
