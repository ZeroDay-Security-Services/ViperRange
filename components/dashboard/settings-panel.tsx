"use client";

import { useState } from "react";
import { Key, Plus, Trash2, Copy, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
}

interface NewKey {
  id: string;
  name: string;
  key: string;
}

interface SettingsPanelProps {
  apiKeys: ApiKeyRecord[];
  userRole?: string;
  userEmail?: string;
}

export function SettingsPanel({ apiKeys: initialKeys, userRole = "STUDENT", userEmail = "" }: SettingsPanelProps) {
  const [keys, setKeys] = useState(initialKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<NewKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  async function createKey() {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { id: string; name: string; key: string; keyPrefix: string; createdAt: string };
      };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to create key.");
        return;
      }

      setNewKey({ id: data.data!.id, name: data.data!.name, key: data.data!.key });
      setKeys((prev) => [
        {
          id: data.data!.id,
          name: data.data!.name,
          keyPrefix: data.data!.keyPrefix,
          lastUsedAt: null,
          createdAt: new Date(data.data!.createdAt),
          expiresAt: null,
        },
        ...prev,
      ]);
      setNewKeyName("");
    } catch {
      setError("Network error.");
    } finally {
      setIsCreating(false);
    }
  }

  async function revokeKey(id: string) {
    const res = await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left 2 Columns: API Keys Management */}
      <div className="glass-card p-6 sm:p-8 lg:col-span-2 space-y-6">
        <div className="flex items-center gap-3.5 pb-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center shadow-lg shadow-secondary/5">
            <Key className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Developer API Keys</h3>
            <p className="text-xs text-muted-foreground">
              Generate secret keys for programmatic lab deployments and automated flag submissions.
            </p>
          </div>
        </div>

        {/* New key alert banner */}
        {newKey && (
          <div className="p-4 rounded-xl bg-status-ready/10 border border-status-ready/30">
            <div className="flex items-start gap-2.5 mb-3">
              <CheckCircle2 className="w-4 h-4 text-status-ready mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-status-ready">API Key Created Successfully</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Make sure to copy your API key now. You won&apos;t be able to see it again!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-background/80 border border-white/15 rounded-lg px-3.5 py-2 font-mono text-xs text-accent-cyan overflow-hidden">
                <span className="truncate select-all">
                  {showKey ? newKey.key : newKey.key.replace(/(?<=^.{10}).+(?=.{4}$)/g, "•".repeat(20))}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-2.5 rounded-lg bg-surface border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={copyKey}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-status-ready/20 border border-status-ready/40 rounded-lg text-xs font-semibold text-status-ready hover:bg-status-ready/30 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Key"}
              </button>
            </div>
          </div>
        )}

        {/* Create new key input row */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
            Create New Key
          </label>
          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="Key Name / Identifier (e.g., CI/CD Automated Tester)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              className="cyber-input flex-1"
              disabled={isCreating}
              maxLength={40}
            />
            <button
              onClick={createKey}
              disabled={isCreating || !newKeyName.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shrink-0"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Key
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-primary/10 border border-primary/25 text-xs text-primary">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Keys List */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Active Keys ({keys.length})
          </div>

          {keys.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-white/10 bg-surface/30">
              <Key className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No API keys generated yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Create your first key using the form above.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 border border-white/5 rounded-xl bg-surface/40 overflow-hidden">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0 pr-4">
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span>{k.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-mono">
                        Active
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-xs text-accent-cyan font-mono">
                        {k.keyPrefix}••••••••••••••••
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Created {formatRelativeTime(k.createdAt)}
                      </span>
                      {k.lastUsedAt && (
                        <span className="text-[11px] text-muted-foreground">
                          · Last used {formatRelativeTime(k.lastUsedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="p-2 rounded-lg hover:bg-primary/15 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    title="Revoke and destroy key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Security Status & Danger Zone */}
      <div className="space-y-6 lg:col-span-1">
        {/* Security Summary Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Security Status</h4>
              <p className="text-[11px] text-muted-foreground">ZeroDay Range Protection</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-3.5 h-3.5 text-status-ready" />
                <span>Session Encryption</span>
              </div>
              <span className="font-mono text-status-ready font-medium">JWT / AES-256</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/5">
              <span className="text-muted-foreground">Account Role</span>
              <span className="font-mono text-primary font-semibold">{userRole}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/5">
              <span className="text-muted-foreground">Rate Limiting</span>
              <span className="font-mono text-secondary font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card p-6 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h4 className="text-sm font-semibold">Danger Zone</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Permanently delete your operator credentials, earned points, and historical session logs.
          </p>
          <div className="pt-2">
            <button
              className="w-full flex items-center justify-center gap-2 text-xs text-primary border border-primary/40 hover:bg-primary/15 py-2.5 px-4 rounded-lg transition-all duration-200 font-semibold"
              onClick={() => alert("To delete your account, please contact administrator at admin@zeroday.in")}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
