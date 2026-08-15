"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

type RegisterInput = z.infer<typeof registerSchema>;
type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-primary" };
    if (score <= 3) return { score, label: "Fair", color: "bg-secondary" };
    return { score, label: "Strong", color: "bg-status-ready" };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const err of result.error.errors) {
        const field = err.path[0] as keyof RegisterInput;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !data.success) {
        setGlobalError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setGlobalError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const strength = getPasswordStrength(formData.password);

  if (success) {
    return (
      <div className="w-full text-center">
        <div className="glass-card p-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-status-ready/10 border border-status-ready/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-status-ready" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-3">Account Created</h2>
          <p className="text-muted-foreground text-sm">
            Redirecting you to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2 tracking-wide">
          CREATE ACCOUNT
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your ZeroDay training account
        </p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {globalError && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your Name"
              className={`cyber-input ${errors.name ? "border-primary/60 ring-1 ring-primary/40" : ""}`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-primary font-mono">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="operator@example.com"
              className={`cyber-input ${errors.email ? "border-primary/60 ring-1 ring-primary/40" : ""}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-primary font-mono">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Min 8 chars, uppercase, number, symbol"
                className={`cyber-input pr-10 ${errors.password ? "border-primary/60 ring-1 ring-primary/40" : ""}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : "bg-surface"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-mono ${
                  strength.score <= 2 ? "text-primary" :
                  strength.score <= 3 ? "text-secondary" : "text-status-ready"
                }`}>
                  {strength.label} password
                </p>
              </div>
            )}

            {errors.password && (
              <p className="text-xs text-primary font-mono">{errors.password}</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            By creating an account, you agree to use this platform{" "}
            <strong className="text-foreground">only for authorized security training</strong>{" "}
            against lab environments you own or control.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-glow-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary-light transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
