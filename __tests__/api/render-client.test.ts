// ViperRange — Unit Tests: Render API Client
// ZeroDay Security Services

// Force development bypass mode
process.env.RENDER_API_KEY = 'development_bypass';

import {
  createOrDeployLabService,
  getServiceStatus,
  getDeployStatus,
  suspendService,
  deleteService,
  generateSimulatedTrainingLogs,
} from '@/lib/api/render';

describe('Render API Client (dev bypass mode)', () => {
  const opts = {
    labSlug: 'owasp-juice-shop',
    labName: 'OWASP Juice Shop',
    dockerImage: 'bkimminich/juice-shop:latest',
    port: 3000,
  };

  describe('createOrDeployLabService', () => {
    it('returns mock service with isDev=true', async () => {
      const result = await createOrDeployLabService(opts);
      expect(result.isDev).toBe(true);
      expect(result.serviceId).toMatch(/mock-srv/);
      expect(result.deployId).toMatch(/mock-dep/);
      expect(result.url).toContain('onrender.com');
    });

    it('returns deterministic serviceId for same slug', async () => {
      const r1 = await createOrDeployLabService(opts);
      const r2 = await createOrDeployLabService(opts);
      expect(r1.serviceId).toBe(r2.serviceId);
    });
  });

  describe('getServiceStatus', () => {
    it('returns a status for mock service', async () => {
      const result = await getServiceStatus('mock-srv-juiceshop');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('suspended');
    });
  });

  describe('getDeployStatus', () => {
    it('returns live status for mock deploy', async () => {
      const result = await getDeployStatus('mock-srv-juiceshop', 'mock-dep-001');
      expect(result.status).toBe('live');
      expect(result.finishedAt).toBeDefined();
    });
  });

  describe('suspendService', () => {
    it('resolves without throwing for mock services', async () => {
      await expect(suspendService('mock-srv-juiceshop')).resolves.toBeUndefined();
    });
  });

  describe('deleteService', () => {
    it('resolves without throwing for mock services', async () => {
      await expect(deleteService('mock-srv-juiceshop')).resolves.toBeUndefined();
    });
  });

  describe('generateSimulatedTrainingLogs', () => {
    it('returns an array of log entries', () => {
      const logs = generateSimulatedTrainingLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('each log has required fields', () => {
      const logs = generateSimulatedTrainingLogs();
      for (const log of logs) {
        expect(log).toHaveProperty('timestamp');
        expect(log).toHaveProperty('level');
        expect(log).toHaveProperty('message');
        expect(log).toHaveProperty('source');
      }
    });

    it('all simulated logs are marked as SIMULATED', () => {
      const logs = generateSimulatedTrainingLogs();
      for (const log of logs) {
        expect(log.message).toContain('[SIMULATED]');
      }
    });

    it('contains educational attack patterns', () => {
      const logs = generateSimulatedTrainingLogs();
      const messages = logs.map((l) => l.message).join(' ');
      expect(messages).toMatch(/SQL Injection|XSS|Brute force|JWT/i);
    });

    it('has valid log levels', () => {
      const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
      const logs = generateSimulatedTrainingLogs();
      for (const log of logs) {
        expect(validLevels).toContain(log.level);
      }
    });
  });
});
