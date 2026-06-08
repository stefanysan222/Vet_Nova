import { vi, describe, it, expect, beforeEach } from "vitest";

const mockLimit = vi.fn();
const mockSlidingWindow = vi.fn((limit: number, window: string) => ({ limit, window }));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static slidingWindow = (...args: unknown[]) => mockSlidingWindow(...(args as [number, string]));
    limit = (...args: unknown[]) => mockLimit(...args);
  }
  return { Ratelimit };
});

vi.mock("@upstash/redis", () => ({
  Redis: class Redis {
    constructor(public opts: unknown) {}
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("rateLimit — sin Upstash configurado (fallback en memoria)", () => {
  beforeEach(() => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  it("permite la petición la primera vez y dentro del límite", async () => {
    const { rateLimit } = await import("../rate-limit");
    expect(await rateLimit("user:1", 2, 60_000)).toBe(true);
    expect(await rateLimit("user:1", 2, 60_000)).toBe(true);
  });

  it("rechaza la petición al superar el límite dentro de la ventana", async () => {
    const { rateLimit } = await import("../rate-limit");
    expect(await rateLimit("user:2", 2, 60_000)).toBe(true);
    expect(await rateLimit("user:2", 2, 60_000)).toBe(true);
    expect(await rateLimit("user:2", 2, 60_000)).toBe(false);
  });

  it("usa contadores independientes por clave", async () => {
    const { rateLimit } = await import("../rate-limit");
    expect(await rateLimit("user:3", 1, 60_000)).toBe(true);
    expect(await rateLimit("user:3", 1, 60_000)).toBe(false);
    expect(await rateLimit("user:4", 1, 60_000)).toBe(true);
  });

  it("reinicia el contador una vez que expira la ventana", async () => {
    vi.useFakeTimers();
    try {
      const { rateLimit } = await import("../rate-limit");
      expect(await rateLimit("user:5", 1, 1_000)).toBe(true);
      expect(await rateLimit("user:5", 1, 1_000)).toBe(false);

      vi.advanceTimersByTime(1_001);

      expect(await rateLimit("user:5", 1, 1_000)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("no llama a Upstash cuando las variables de entorno no están configuradas", async () => {
    const { rateLimit } = await import("../rate-limit");
    await rateLimit("user:6", 5, 60_000);
    expect(mockLimit).not.toHaveBeenCalled();
  });
});

describe("rateLimit — con Upstash configurado", () => {
  beforeEach(() => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token-secreto");
  });

  it("delega en el limiter de Upstash y devuelve su resultado de éxito", async () => {
    mockLimit.mockResolvedValue({ success: true });
    const { rateLimit } = await import("../rate-limit");

    const result = await rateLimit("user:7", 5, 60_000);

    expect(result).toBe(true);
    expect(mockLimit).toHaveBeenCalledWith("user:7");
    expect(mockSlidingWindow).toHaveBeenCalledWith(5, "60000 ms");
  });

  it("propaga el rechazo del limiter de Upstash", async () => {
    mockLimit.mockResolvedValue({ success: false });
    const { rateLimit } = await import("../rate-limit");

    expect(await rateLimit("user:8", 5, 60_000)).toBe(false);
  });

  it("permite la petición si Upstash falla temporalmente (fail-open)", async () => {
    mockLimit.mockRejectedValue(new Error("ECONNREFUSED"));
    const { rateLimit } = await import("../rate-limit");

    expect(await rateLimit("user:9", 5, 60_000)).toBe(true);
  });

  it("reutiliza el mismo limiter para la misma combinación de límite y ventana", async () => {
    mockLimit.mockResolvedValue({ success: true });
    const { rateLimit } = await import("../rate-limit");

    await rateLimit("a", 5, 60_000);
    await rateLimit("b", 5, 60_000);

    expect(mockSlidingWindow).toHaveBeenCalledTimes(1);
  });
});
