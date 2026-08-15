// ViperRange — Core Types
// ZeroDay Security Services

export type UserRole = "STUDENT" | "ADMIN" | "INSTRUCTOR";

export type DeploymentStatus =
  | "QUEUED"
  | "DEPLOYING"
  | "WARMING"
  | "READY"
  | "SLEEPING"
  | "FAILED"
  | "STOPPED";

export type LabCategory =
  | "WEB_APP"
  | "API"
  | "NETWORK"
  | "CLOUD"
  | "MOBILE"
  | "CRYPTO"
  | "FORENSICS"
  | "LINUX"
  | "PWN"
  | "REVERSING"
  | "OSINT"
  | "MISC";

export type LabDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type LabType = "DEPLOYABLE" | "OFFLINE";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  bio: string | null;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabHint {
  order: number;
  text: string;
  pointsPenalty?: number;
}

export interface LabResource {
  name: string;
  description: string;
  url: string;
  sizeLabel?: string;
}

export interface Lab {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  labType: LabType;
  tags: string[];
  dockerImage: string | null;
  port: number | null;
  isActive: boolean;
  isFeatured: boolean;
  estimatedDeployTime: number;
  maxDuration: number;
  points: number;
  hints: LabHint[] | null;
  resources: LabResource[] | null;
  renderServiceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deployment {
  id: string;
  userId: string;
  labId: string;
  status: DeploymentStatus;
  renderServiceId: string | null;
  renderDeployId: string | null;
  publicUrl: string | null;
  startedAt: Date;
  readyAt: Date | null;
  stoppedAt: Date | null;
  expiresAt: Date | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  lab?: Lab;
  user?: User;
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: Date;
  metadata: Record<string, unknown> | null;
}

export interface Walkthrough {
  id: string;
  labId: string;
  title: string;
  content: string;
  order: number;
  tool: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabSubmission {
  id: string;
  userId: string;
  labId: string;
  submittedFlag: string;
  isCorrect: boolean;
  createdAt: Date;
}

export interface LabCompletion {
  id: string;
  userId: string;
  labId: string;
  pointsEarned: number;
  attemptCount: number;
  completedAt: Date;
}

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Render API types
export interface RenderService {
  id: string;
  type: string;
  repo: string | null;
  name: string;
  slug: string;
  env: string;
  region: string;
  branch: string | null;
  buildCommand: string | null;
  startCommand: string | null;
  buildFilter: Record<string, unknown> | null;
  rootDir: string | null;
  dockerCommand: string | null;
  dockerContext: string | null;
  dockerfilePath: string | null;
  numInstances: number;
  plan: string;
  image: Record<string, unknown> | null;
  serviceDetails: Record<string, unknown> | null;
  suspended: string;
  suspenders: string[];
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RenderDeploy {
  id: string;
  commit: Record<string, unknown> | null;
  status: string;
  trigger: Record<string, unknown>;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalDeployments: number;
  activeDeployments: number;
  completedLabs: number;
  totalLabs: number;
  totalPoints: number;
  recentDeployments: Deployment[];
}

// Lab card display
export interface LabWithDeployment extends Lab {
  activeDeployment?: Deployment | null;
  deploymentCount?: number;
  isCompleted?: boolean;
}

// Session user (augmented for NextAuth)
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
}
