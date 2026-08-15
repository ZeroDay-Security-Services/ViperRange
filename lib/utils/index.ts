// ViperRange — General Utilities
// ZeroDay Security Services

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function getInitials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "vr_";
  const keyLength = 40;
  let key = prefix;
  for (let i = 0; i < keyLength; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "***";
  return key.slice(0, 7) + "..." + key.slice(-4);
}

export function parseApiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "BEGINNER": return "text-status-ready";
    case "INTERMEDIATE": return "text-secondary";
    case "ADVANCED": return "text-accent-orange";
    case "EXPERT": return "text-primary";
    default: return "text-muted-foreground";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "READY": return "text-status-ready";
    case "DEPLOYING":
    case "WARMING": return "text-status-deploying";
    case "QUEUED": return "text-status-queued";
    case "SLEEPING": return "text-status-sleeping";
    case "FAILED": return "text-status-failed";
    case "STOPPED": return "text-muted-foreground";
    default: return "text-muted-foreground";
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case "READY": return "bg-status-ready animate-pulse";
    case "DEPLOYING":
    case "WARMING": return "bg-status-deploying animate-pulse";
    case "QUEUED": return "bg-status-queued animate-pulse";
    case "SLEEPING": return "bg-status-sleeping";
    case "FAILED": return "bg-status-failed";
    case "STOPPED": return "bg-muted";
    default: return "bg-muted";
  }
}

export function getLogLevelColor(level: string): string {
  switch (level.toUpperCase()) {
    case "DEBUG": return "text-muted-foreground";
    case "INFO": return "text-accent-cyan";
    case "WARN": return "text-secondary";
    case "ERROR": return "text-primary";
    case "CRITICAL": return "text-primary font-bold";
    default: return "text-foreground";
  }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    WEB_APP: "Web Exploitation",
    API: "API Security",
    NETWORK: "Network",
    CLOUD: "Cloud",
    MOBILE: "Mobile",
    CRYPTO: "Cryptography",
    FORENSICS: "Forensics",
    LINUX: "Linux",
    PWN: "Binary Exploitation",
    REVERSING: "Reverse Engineering",
    OSINT: "OSINT",
    MISC: "Miscellaneous",
  };
  return labels[category] ?? category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    WEB_APP: "Globe",
    API: "Webhook",
    NETWORK: "Network",
    CLOUD: "Cloud",
    MOBILE: "Smartphone",
    CRYPTO: "KeyRound",
    FORENSICS: "Search",
    LINUX: "Terminal",
    PWN: "Bomb",
    REVERSING: "Cpu",
    OSINT: "Eye",
    MISC: "Puzzle",
  };
  return icons[category] ?? "FlaskConical";
}

export function getLabTypeLabel(labType: string): string {
  return labType === "DEPLOYABLE" ? "Live Environment" : "Offline Challenge";
}

// ── Flag hashing/verification (server-side only) ────────────────────────────

export function hashFlag(flag: string): string {
  return crypto.createHash("sha256").update(flag.trim()).digest("hex");
}

export function verifyFlag(submitted: string, expectedHash: string): boolean {
  const submittedHash = hashFlag(submitted);
  // Constant-time comparison to avoid timing attacks
  const a = Buffer.from(submittedHash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
