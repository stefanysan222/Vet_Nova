import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Fallback en memoria para entornos sin Upstash configurado (desarrollo local)
type MemEntry = { count: number; resetAt: number };
const memStore = new Map<string, MemEntry>();

function memRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || entry.resetAt < now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// Instancia Redis reutilizable entre invocaciones (evita recrear conexión en cada request)
let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// Cache de limiters para no recrearlos en cada request
const limiters = new Map<string, Ratelimit>();
function getLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        analytics: false,
      }),
    );
  }
  return limiters.get(key)!;
}

/**
 * Devuelve true si la petición está dentro del límite, false si debe rechazarse.
 * En producción usa Upstash Redis (distribuido). En dev sin .env usa Map en memoria.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return memRateLimit(key, limit, windowMs);
  }
  try {
    const { success } = await getLimiter(limit, windowMs).limit(key);
    return success;
  } catch {
    // Si Redis falla temporalmente, permitir la petición antes que bloquear el servicio
    return true;
  }
}
