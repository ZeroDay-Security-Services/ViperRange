"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Shield, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (response?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (response?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2 tracking-wide">
          WELCOME BACK
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your ViperRange account
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@zeroday.in"
              className="cyber-input"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground font-mono uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-primary hover:text-primary-light transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="cyber-input pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-glow-primary mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-muted-foreground">
            New to ViperRange?{" "}
            <Link href="/register" className="text-primary hover:text-primary-light transition-colors font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
