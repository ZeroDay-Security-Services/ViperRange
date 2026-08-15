/** @jest-environment node */
// ViperRange — API Test: /api/start-lab
// ZeroDay Security Services

import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/config', () => ({ auth: jest.fn() }));

jest.mock('@/lib/db', () => ({
  prisma: {
    lab: { findUnique: jest.fn() },
    deployment: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    deploymentLog: { create: jest.fn() },
  },
}));

jest.mock('@/lib/api/render', () => ({
  createOrDeployLabService: jest.fn().mockResolvedValue({
    serviceId: 'mock-srv-001',
    deployId: 'mock-dep-001',
    url: 'https://lab.onrender.com',
    isDev: true,
  }),
}));

jest.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true, limit: 5, remaining: 4, resetAt: Date.now() + 60000 }),
  rateLimitHeaders: jest.fn().mockReturnValue({}),
}));

jest.mock('@/lib/utils/audit', () => ({
  auditLog: jest.fn().mockResolvedValue(undefined),
  AUDIT_ACTIONS: { DEPLOYMENT_CREATED: 'deployment.created' },
}));

const mockSession = {
  user: { id: 'user-001', email: 'test@test.com', name: 'Test', role: 'STUDENT' },
  expires: new Date(Date.now() + 3600000).toISOString(),
};

const mockLab = {
  id: 'claaaaaaaaaaaaaaaaaaaaaaa',
  slug: 'owasp-juice-shop',
  name: 'OWASP Juice Shop',
  dockerImage: 'bkimminich/juice-shop:latest',
  port: 3000,
  isActive: true,
  maxDuration: 7200,
  estimatedDeployTime: 90,
};

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/start-lab', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/start-lab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth/config');
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const { POST } = await import('@/app/api/start-lab/route');
    const res = await POST(makeRequest({ labId: mockLab.id }));
    expect(res.status).toBe(401);
  });

  it('returns 422 for invalid labId (not a cuid)', async () => {
    const { auth } = await import('@/lib/auth/config');
    (auth as jest.Mock).mockResolvedValueOnce(mockSession);
    const { POST } = await import('@/app/api/start-lab/route');
    const res = await POST(makeRequest({ labId: 'not-a-valid-cuid' }));
    expect(res.status).toBe(422);
  });

  it('returns 404 when lab does not exist', async () => {
    const { auth } = await import('@/lib/auth/config');
    const { prisma } = await import('@/lib/db');
    (auth as jest.Mock).mockResolvedValueOnce(mockSession);
    (prisma.lab.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const { POST } = await import('@/app/api/start-lab/route');
    const res = await POST(makeRequest({ labId: mockLab.id }));
    expect(res.status).toBe(404);
  });

  it('returns 200 with existing deployment when lab already running', async () => {
    const { auth } = await import('@/lib/auth/config');
    const { prisma } = await import('@/lib/db');
    (auth as jest.Mock).mockResolvedValueOnce(mockSession);
    (prisma.lab.findUnique as jest.Mock).mockResolvedValueOnce(mockLab);
    (prisma.deployment.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'existing-dep',
      status: 'READY',
      publicUrl: 'https://lab.onrender.com',
    });
    const { POST } = await import('@/app/api/start-lab/route');
    const res = await POST(makeRequest({ labId: mockLab.id }));
    expect(res.status).toBe(200);
    const body = await res.json() as { data: { deploymentId: string } };
    expect(body.data.deploymentId).toBe('existing-dep');
  });

  it('creates deployment and returns 202 for new lab start', async () => {
    const { auth } = await import('@/lib/auth/config');
    const { prisma } = await import('@/lib/db');
    (auth as jest.Mock).mockResolvedValueOnce(mockSession);
    (prisma.lab.findUnique as jest.Mock).mockResolvedValueOnce(mockLab);
    (prisma.deployment.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.deployment.create as jest.Mock).mockResolvedValueOnce({
      id: 'new-dep-001',
      status: 'QUEUED',
      publicUrl: null,
    });
    (prisma.deployment.update as jest.Mock).mockResolvedValue({});
    (prisma.deploymentLog.create as jest.Mock).mockResolvedValue({});
    const { POST } = await import('@/app/api/start-lab/route');
    const res = await POST(makeRequest({ labId: mockLab.id }));
    expect(res.status).toBe(202);
    const body = await res.json() as { success: boolean; data: { status: string } };
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('QUEUED');
  });
});
