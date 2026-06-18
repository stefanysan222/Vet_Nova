import { describe, it, expect } from "vitest";

describe("API_URL config", () => {
  it("exports a non-empty string", async () => {
    const { API_URL } = await import("../config");
    expect(typeof API_URL).toBe("string");
    expect(API_URL.length).toBeGreaterThan(0);
  });

  it("falls back to localhost when env var is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", undefined as unknown as string);
    vi.resetModules();
    const { API_URL } = await import("../config");
    expect(API_URL).toBe("http://localhost:3000");
    vi.unstubAllEnvs();
  });
});
