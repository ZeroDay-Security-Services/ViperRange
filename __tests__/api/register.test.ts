/** @jest-environment node */
// ViperRange — API Integration Test: /api/auth/register
// ZeroDay Security Services

import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true, limit: 5, remaining: 4, resetAt: Date.now() + 60000 }),
  rateLimitHeaders: jest.fn().mockReturnValue({}),
}));

jest.mock('@/lib/utils/audit', () => ({
  auditLog: jest.fn().mockResolvedValue(undefined),
  AUDIT_ACTIONS: { USER_REGISTERED: 'user.registered' },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('POST /api/auth/register', () => {
  const makeRequest = (body: unknown) =>
    new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  beforeEach(() => jest.clearAllMocks());

  it('rejects password without uppercase', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({ name: 'Test', email: 'test@test.com', password: 'nouppercase1!' }));
    expect(res.status).toBe(422);
  });

  it('rejects password without number', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({ name: 'Test', email: 'test@test.com', password: 'NoNumber!!' }));
    expect(res.status).toBe(422);
  });

  it('rejects short password', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({ name: 'Test', email: 'test@test.com', password: 'Sh0!' }));
    expect(res.status).toBe(422);
  });

  it('rejects invalid email', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({ name: 'Test', email: 'not-an-email', password: 'Valid1!Pass' }));
    expect(res.status).toBe(422);
  });

  it('returns 409 when email already exists', async () => {
    const { prisma } = await import('@/lib/db');
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing-id' });
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({ name: 'Test', email: 'existing@test.com', password: 'Valid1!Pass' }));
    expect(res.status).toBe(409);
  });

  it('creates user with valid data and returns 201', async () => {
    const { prisma } = await import('@/lib/db');
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({ id: 'new-id', email: 'new@test.com', name: 'New' });
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({ name: 'New User', email: 'new@test.com', password: 'Valid1!Pass' }));
    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 400 on malformed JSON', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json{',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
