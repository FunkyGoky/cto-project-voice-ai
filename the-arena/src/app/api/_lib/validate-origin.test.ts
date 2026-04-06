import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateOrigin } from "./validate-origin";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost:3000/api/test", { headers });
}

describe("validateOrigin", () => {
  const originalEnv = process.env.APP_BASE_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.APP_BASE_URL;
    } else {
      process.env.APP_BASE_URL = originalEnv;
    }
  });

  describe("dev mode (no APP_BASE_URL)", () => {
    beforeEach(() => {
      delete process.env.APP_BASE_URL;
    });

    it("allows requests with no origin header", () => {
      expect(validateOrigin(makeRequest())).toBeNull();
    });

    it("allows localhost origin", () => {
      expect(
        validateOrigin(makeRequest({ origin: "http://localhost:3000" }))
      ).toBeNull();
    });

    it("rejects external origin", async () => {
      const result = validateOrigin(
        makeRequest({ origin: "https://evil.com" })
      );
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });
  });

  describe("prod mode (APP_BASE_URL set)", () => {
    beforeEach(() => {
      process.env.APP_BASE_URL = "https://arena.example.com";
    });

    it("allows matching origin", () => {
      expect(
        validateOrigin(
          makeRequest({ origin: "https://arena.example.com" })
        )
      ).toBeNull();
    });

    it("allows matching referer when origin is absent", () => {
      expect(
        validateOrigin(
          makeRequest({ referer: "https://arena.example.com/page" })
        )
      ).toBeNull();
    });

    it("rejects wrong origin", async () => {
      const result = validateOrigin(
        makeRequest({ origin: "https://evil.com" })
      );
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });

    it("rejects when both headers missing", async () => {
      const result = validateOrigin(makeRequest());
      expect(result).not.toBeNull();
      expect(result!.status).toBe(403);
    });
  });
});
