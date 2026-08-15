// ViperRange — Unit Tests: Rate Limiter
// ZeroDay Security Services

// Ensure no Redis configured so we test in-memory path
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

import { rateLimit, rateLimitHeaders } from '@/lib/utils/rate-limit';

describe('rateLimit (in-memory mode)', () => {
  it('allows first request', async () => {
    const result = await rateLimit(`test-allow-${Date.now()}`, 'api');
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
    expect(result.limit).toBe(100);
  });

  it('blocks after exceeding limit', async () => {
    const key = `test-block-${Date.now()}`;
    // Use strict preset (3 req/min)
    const results = await Promise.all([
      rateLimit(key, 'strict'),
      rateLimit(key, 'strict'),
      rateLimit(key, 'strict'),
      rateLimit(key, 'strict'), // this one should fail
    ]);

    const successes = results.filter((r) => r.success).length;
    const failures = results.filter((r) => !r.success).length;

    expect(successes).toBe(3);
    expect(failures).toBe(1);
  });

  it('tracks remaining correctly', async () => {
    const key = `test-remaining-${Date.now()}`;
    const r1 = await rateLimit(key, 'strict');
    const r2 = await rateLimit(key, 'strict');

    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
  });

  it('returns resetAt in the future', async () => {
    const result = await rateLimit(`test-reset-${Date.now()}`, 'api');
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it('different keys are independent', async () => {
    const key1 = `test-key1-${Date.now()}`;
    const key2 = `test-key2-${Date.now()}`;

    const r1 = await rateLimit(key1, 'strict');
    const r2 = await rateLimit(key2, 'strict');

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r1.remaining).toBe(r2.remaining);
  });
});

describe('rateLimitHeaders', () => {
  it('returns correct header set', () => {
    const result = {
      success: true,
      limit: 100,
      remaining: 95,
      resetAt: Date.now() + 60000,
    };

    const headers = rateLimitHeaders(result);
    expect(headers['X-RateLimit-Limit']).toBe('100');
    expect(headers['X-RateLimit-Remaining']).toBe('95');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
    expect(headers['Retry-After']).toBe('0');
  });

  it('sets Retry-After when rate limited', () => {
    const result = {
      success: false,
      limit: 3,
      remaining: 0,
      resetAt: Date.now() + 30000,
    };

    const headers = rateLimitHeaders(result);
    const retryAfter = parseInt(headers['Retry-After'], 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
  });
});
