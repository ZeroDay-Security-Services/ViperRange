"use client";

import { useState } from "react";
import { User, Save, Loader2, CheckCircle2, AlertCircle, Shield, Mail, Calendar, Sparkles } from "lucide-react";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  bio: string | null;
  createdAt: Date;
}

export function ProfileEditor({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveState("idle");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };
      if (res.ok && data.success) {
        setSaveState("success");
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        setErrorMsg(data.error ?? "Failed to save.");
      }
    } catch {
      setSaveState("error");
      setErrorMsg("Network error.");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = (user.name ?? user.email)[0].toUpperCase();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column: Identity Preview Card */}
      <div className="glass-card p-6 lg:col-span-1 flex flex-col justify-between h-full">
        <div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 pb-3 border-b border-white/5 flex items-center justify-between">
            <span>Identity Badge</span>
            <span className="w-2 h-2 rounded-full bg-status-ready animate-pulse" />
          </div>

          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/40 flex items-center justify-center text-3xl font-bold text-primary font-display mb-4 shadow-xl shadow-primary/10">
              {initials}
            </div>

            <h3 className="font-display text-lg font-bold text-white mb-1">
              {name || user.name || "Operator"}
            </h3>

            <div className="inline-flex items-center gap-1 text-[11px] bg-primary/15 border border-primary/30 text-primary px-3 py-0.5 rounded-full font-mono font-medium mb-4">
              <Shield className="w-3 h-3" />
              {user.role}
            </div>

            <p className="text-xs text-muted-foreground italic px-2 line-clamp-3 mb-6">
              &ldquo;{bio || "No operator bio configured yet."}&rdquo;
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate font-mono">{user.email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>
              Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Edit Profile Form */}
      <div className="glass-card p-6 sm:p-8 lg:col-span-2">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/5">
          <div>
            <h3 className="text-base font-semibold text-white">Edit Profile Details</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your public display handle and professional biography.
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-secondary" />
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your handle or name"
                maxLength={60}
                className="cyber-input pl-10 w-full"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={user.email}
                disabled
                className="cyber-input pl-10 w-full opacity-60 cursor-not-allowed bg-background/50"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Managed via your organization or login provider.</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Operator Biography
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Security researcher, student, pen-tester, or CTF player..."
              rows={4}
              maxLength={300}
              className="cyber-input resize-none w-full"
              disabled={isSaving}
            />
            <div className="text-[10px] text-muted-foreground font-mono text-right">
              {bio.length}/300
            </div>
          </div>

          {/* Feedback Messages */}
          {saveState === "success" && (
            <div className="flex items-center gap-2 p-3.5 rounded-lg bg-status-ready/10 border border-status-ready/25 text-sm text-status-ready">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile updated successfully.</span>
            </div>
          )}
          {saveState === "error" && (
            <div className="flex items-center gap-2 p-3.5 rounded-lg bg-primary/10 border border-primary/25 text-sm text-primary">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 hover:shadow-glow-primary text-sm"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
