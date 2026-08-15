// ViperRange — Render API Client
// ZeroDay Security Services
// Uses official Render REST API v1: https://api.render.com/docs

import type { RenderService, RenderDeploy } from "@/types";

const RENDER_API_BASE = "https://api.render.com/v1";
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_OWNER_ID = process.env.RENDER_OWNER_ID;

// ── Mock data & Local container mapping for development ──────────────────────

export const LOCAL_LAB_PORTS: Record<string, number> = {
  "file-oracle": 8081,
  "pixel-cache": 8082,
  "crawler-protocol": 8083,
  "session-architect": 8084,
  "cipher-gate": 8085,
  "loose-types": 8086,
  "template-engine": 8087,
  "style-injector": 8088,
};

export function getLocalLabUrl(labSlug: string): string {
  const isLocalLabs = process.env.LOCAL_LABS_ENABLED === "true";
  const baseUrl = process.env.LOCAL_LABS_BASE_URL || "http://localhost";
  if (isLocalLabs && LOCAL_LAB_PORTS[labSlug]) {
    return `${baseUrl}:${LOCAL_LAB_PORTS[labSlug]}`;
  }
  return `https://${labSlug}-demo.onrender.com`;
}

function mockServiceId(labSlug: string): string {
  return `mock-srv-${labSlug.replace(/[^a-z0-9]/g, "")}`;
}

function mockDeployId(serviceId: string): string {
  return `mock-dep-${serviceId}-${Date.now()}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMockDeployment(labSlug: string, labName: string): {
  serviceId: string;
  deployId: string;
  url: string;
} {
  const serviceId = mockServiceId(labSlug);
  return {
    serviceId,
    deployId: mockDeployId(serviceId),
    url: getLocalLabUrl(labSlug),
  };
}

// ── HTTP helper ────────────────────────────────────────────────────────────────

async function renderFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 30_000
): Promise<T> {
  if (!RENDER_API_KEY || RENDER_API_KEY === "development_bypass") {
    throw new Error("Render API key not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${RENDER_API_BASE}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${RENDER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      const error = new RenderAPIError(
        `Render API error ${response.status}: ${errorBody || response.statusText}`,
        response.status
      );
      throw error;
    }

    return response.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Render API request timed out");
    }
    throw err;
  }
}

export class RenderAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "RenderAPIError";
  }
}

// ── Retry logic ────────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on 4xx client errors
      if (err instanceof RenderAPIError && err.statusCode >= 400 && err.statusCode < 500) {
        throw err;
      }

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ── Service management ─────────────────────────────────────────────────────────

export interface CreateServiceOptions {
  labSlug: string;
  labName: string;
  dockerImage: string;
  port: number;
}

export interface ServiceDeployResult {
  serviceId: string;
  deployId: string;
  url: string | null;
  isDev: boolean;
}

/**
 * Creates a new Render Web Service for a lab, or triggers a deploy on an existing one.
 * In development (RENDER_API_KEY=development_bypass), returns deterministic mock data.
 */
export async function createOrDeployLabService(
  options: CreateServiceOptions
): Promise<ServiceDeployResult> {
  if (process.env.RENDER_API_KEY === "development_bypass" || !process.env.RENDER_API_KEY) {
    // Simulate a short deployment delay in dev
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mock = getMockDeployment(options.labSlug, options.labName);
    return { ...mock, isDev: true };
  }

  if (!RENDER_OWNER_ID) {
    throw new Error("RENDER_OWNER_ID environment variable is not set");
  }

  return withRetry(async () => {
    // Create a new web service on Render using Docker image
    // Reference: https://api.render.com/docs#tag/services/POST/services
    const body = {
      type: "web_service",
      name: `viperrange-${options.labSlug}-${Date.now()}`,
      ownerId: RENDER_OWNER_ID,
      serviceDetails: {
        env: "docker",
        dockerImage: {
          ownerId: RENDER_OWNER_ID,
          imagePath: options.dockerImage,
        },
        dockerCommand: null,
        dockerContext: null,
        dockerfilePath: null,
        numInstances: 1,
        plan: "starter",
        region: "oregon",
        envSpecificDetails: {
          dockerDetails: {
            dockerfilePath: null,
            dockerContext: null,
            dockerCommand: null,
          },
        },
      },
      envVars: [],
    };

    const result = await renderFetch<{ service: RenderService; deployId: string }>(
      "/services",
      { method: "POST", body: JSON.stringify(body) }
    );

    return {
      serviceId: result.service.id,
      deployId: result.deployId,
      url: result.service.url,
      isDev: false,
    };
  });
}

/**
 * Gets the current status of a Render service.
 */
export async function getServiceStatus(serviceId: string): Promise<{
  status: string;
  url: string | null;
  suspended: string;
}> {
  if (process.env.RENDER_API_KEY === "development_bypass" || !process.env.RENDER_API_KEY || serviceId.startsWith("mock-")) {
    const statuses = ["deploying", "live", "live", "live"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const labSlug = serviceId.replace("mock-srv-", "");
    return {
      status,
      url: getLocalLabUrl(labSlug),
      suspended: "not_suspended",
    };
  }

  return withRetry(async () => {
    // Reference: https://api.render.com/docs#tag/services/GET/services/{serviceId}
    const service = await renderFetch<RenderService>(`/services/${serviceId}`);
    const details = service.serviceDetails as Record<string, unknown> | null;
    const detailStatus = details?.["status"] as string | undefined;
    return {
      status: detailStatus ?? "unknown",
      url: service.url,
      suspended: service.suspended,
    };
  });
}

/**
 * Gets the status of a specific deploy.
 */
export async function getDeployStatus(
  serviceId: string,
  deployId: string
): Promise<{ status: string; finishedAt: string | null }> {
  if (process.env.RENDER_API_KEY === "development_bypass" || !process.env.RENDER_API_KEY || serviceId.startsWith("mock-")) {
    return { status: "live", finishedAt: new Date().toISOString() };
  }

  return withRetry(async () => {
    // Reference: https://api.render.com/docs#tag/deploys/GET/services/{serviceId}/deploys/{deployId}
    const deploy = await renderFetch<RenderDeploy>(
      `/services/${serviceId}/deploys/${deployId}`
    );
    return { status: deploy.status, finishedAt: deploy.finishedAt };
  });
}

/**
 * Suspends (stops) a Render service to save resources.
 */
export async function suspendService(serviceId: string): Promise<void> {
  if (process.env.RENDER_API_KEY === "development_bypass" || !process.env.RENDER_API_KEY || serviceId.startsWith("mock-")) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return;
  }

  await withRetry(async () => {
    // Reference: https://api.render.com/docs#tag/services/POST/services/{serviceId}/suspend
    await renderFetch(`/services/${serviceId}/suspend`, { method: "POST" });
  });
}

/**
 * Deletes a Render service entirely.
 */
export async function deleteService(serviceId: string): Promise<void> {
  if (process.env.RENDER_API_KEY === "development_bypass" || !process.env.RENDER_API_KEY || serviceId.startsWith("mock-")) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return;
  }

  await withRetry(async () => {
    // Reference: https://api.render.com/docs#tag/services/DELETE/services/{serviceId}
    await renderFetch(`/services/${serviceId}`, { method: "DELETE" });
  });
}

/**
 * Retrieves recent logs from a Render service.
 * Note: Render's free-tier log API is limited. We supplement with simulated training telemetry.
 */
export async function getServiceLogs(
  serviceId: string,
  limit = 100
): Promise<Array<{ timestamp: string; message: string; level: string }>> {
  if (process.env.RENDER_API_KEY === "development_bypass" || !process.env.RENDER_API_KEY || serviceId.startsWith("mock-")) {
    return generateSimulatedTrainingLogs();
  }

  try {
    // Reference: https://api.render.com/docs#tag/logs/GET/services/{serviceId}/logs
    const result = await renderFetch<{
      logs: Array<{ timestamp: string; message: string }>;
    }>(`/services/${serviceId}/logs?limit=${limit}`);

    return result.logs.map((log) => ({
      ...log,
      level: inferLogLevel(log.message),
    }));
  } catch {
    // Fall back to simulated logs if real logs unavailable
    return generateSimulatedTrainingLogs();
  }
}

function inferLogLevel(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("error") || lower.includes("fatal")) return "ERROR";
  if (lower.includes("warn")) return "WARN";
  if (lower.includes("debug")) return "DEBUG";
  return "INFO";
}

/**
 * Generates representative simulated training telemetry for educational purposes.
 * These logs illustrate common web attack patterns against the student's own lab.
 * Clearly labeled as simulated training data.
 */
export function generateSimulatedTrainingLogs(): Array<{
  timestamp: string;
  message: string;
  level: string;
  source: string;
}> {
  const now = Date.now();
  return [
    {
      timestamp: new Date(now - 60000).toISOString(),
      level: "INFO",
      source: "nginx",
      message: '[SIMULATED] 192.168.1.100 - GET / HTTP/1.1" 200 2048 "-" "Mozilla/5.0"',
    },
    {
      timestamp: new Date(now - 55000).toISOString(),
      level: "WARN",
      source: "app",
      message: "[SIMULATED] Failed login attempt: user=admin@juice-sh.op ip=192.168.1.100",
    },
    {
      timestamp: new Date(now - 50000).toISOString(),
      level: "ERROR",
      source: "app",
      message: "[SIMULATED] SQL Injection detected in email field: payload=\\' OR 1=1--",
    },
    {
      timestamp: new Date(now - 45000).toISOString(),
      level: "WARN",
      source: "waf",
      message: "[SIMULATED] XSS payload blocked: <script>alert('xss')</script> in feedback.comment",
    },
    {
      timestamp: new Date(now - 40000).toISOString(),
      level: "INFO",
      source: "nginx",
      message: '[SIMULATED] 192.168.1.100 - POST /rest/user/login HTTP/1.1" 401 128',
    },
    {
      timestamp: new Date(now - 35000).toISOString(),
      level: "ERROR",
      source: "app",
      message: "[SIMULATED] Brute force detected: 50 failed logins in 60s from 192.168.1.100",
    },
    {
      timestamp: new Date(now - 30000).toISOString(),
      level: "WARN",
      source: "app",
      message: "[SIMULATED] Directory traversal attempt: GET /../../../../etc/passwd",
    },
    {
      timestamp: new Date(now - 25000).toISOString(),
      level: "INFO",
      source: "app",
      message: "[SIMULATED] Nikto scan detected: User-Agent=Nikto/2.1.6 scanning /admin",
    },
    {
      timestamp: new Date(now - 20000).toISOString(),
      level: "WARN",
      source: "app",
      message: "[SIMULATED] Sensitive endpoint probed: GET /api/Users limit=999 offset=0",
    },
    {
      timestamp: new Date(now - 15000).toISOString(),
      level: "ERROR",
      source: "app",
      message: "[SIMULATED] JWT with alg:none accepted — vulnerability confirmed",
    },
    {
      timestamp: new Date(now - 10000).toISOString(),
      level: "INFO",
      source: "nginx",
      message: '[SIMULATED] ZAP Spider: GET /rest/products/search?q=%3Cscript%3E HTTP/1.1" 200',
    },
    {
      timestamp: new Date(now - 5000).toISOString(),
      level: "WARN",
      source: "app",
      message: "[SIMULATED] IDOR attempt: GET /api/Users/1 by authenticated user id=42",
    },
    {
      timestamp: new Date(now - 2000).toISOString(),
      level: "INFO",
      source: "system",
      message: "[SIMULATED] Lab health check: OK — container responding on port 3000",
    },
  ];
}
