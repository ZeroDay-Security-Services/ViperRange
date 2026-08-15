// ViperRange — Rate Limiter
// ZeroDay Security Services
// Uses in-memory store for dev; swap UPSTASH_REDIS_REST_URL for production

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (dev/single-instance only)
const memoryStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(memoryStore.entries())) {
    if (entry.resetAt < now) memoryStore.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const PRESETS = {
  api: { limit: 100, windowMs: 60_000 },          // 100 req/min
  auth: { limit: 10, windowMs: 15 * 60_000 },     // 10 req/15min
  deploy: { limit: 5, windowMs: 60_000 },         // 5 deploys/min
  strict: { limit: 3, windowMs: 60_000 },         // 3 req/min
} satisfies Record<string, RateLimitConfig>;

export type RateLimitPreset = keyof typeof PRESETS;

async function checkRedis(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const windowKey = `rl:${key}:${Math.floor(Date.now() / config.windowMs)}`;
    const pipeline = [
      ["INCR", windowKey],
      ["PEXPIRE", windowKey, config.windowMs],
    ];

    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ result: number }>;
    const count = data[0]?.result ?? 1;
    const resetAt = Math.ceil(Date.now() / config.windowMs) * config.windowMs;

    return {
      success: count <= config.limit,
      limit: config.limit,
      remaining: Math.max(0, config.limit - count),
      resetAt,
    };
  } catch {
    return null;
  }
}

function checkMemory(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / config.windowMs)}`;
  const entry = memoryStore.get(windowKey);
  const resetAt = Math.ceil(now / config.windowMs) * config.windowMs;

  if (!entry || entry.resetAt < now) {
    memoryStore.set(windowKey, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  entry.count++;
  return {
    success: entry.count <= config.limit,
    limit: config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    resetAt,
  };
}

export async function rateLimit(
  identifier: string,
  preset: RateLimitPreset = "api"
): Promise<RateLimitResult> {
  const config = PRESETS[preset];

  // Try Redis first (production)
  const redisResult = await checkRedis(identifier, config);
  if (redisResult) return redisResult;

  // Fallback to in-memory (development)
  return checkMemory(identifier, config);
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "Retry-After": result.success
      ? "0"
      : String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
}
