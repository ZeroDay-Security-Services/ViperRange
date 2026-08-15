import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D11",
        foreground: "#E8E8F0",
        primary: {
          DEFAULT: "#FF3344",
          foreground: "#FFFFFF",
          dark: "#CC1122",
          light: "#FF6677",
        },
        secondary: {
          DEFAULT: "#FFD700",
          foreground: "#0D0D11",
          dark: "#CC9900",
          light: "#FFE44D",
        },
        surface: {
          DEFAULT: "#1F1F2E",
          light: "#2A2A3E",
          dark: "#141420",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.10)",
          strong: "rgba(255,255,255,0.10)",
        },
        accent: {
          cyan: "#00D4FF",
          green: "#00FF88",
          purple: "#8B5CF6",
          orange: "#FF6B35",
        },
        status: {
          ready: "#00FF88",
          deploying: "#FFD700",
          failed: "#FF3344",
          sleeping: "#8B5CF6",
          queued: "#00D4FF",
        },
        muted: {
          DEFAULT: "#3A3A52",
          foreground: "#9090A8",
        },
        border: "rgba(255,255,255,0.10)",
        input: "#1F1F2E",
        ring: "#FF3344",
        card: {
          DEFAULT: "#1F1F2E",
          foreground: "#E8E8F0",
        },
        destructive: {
          DEFAULT: "#FF3344",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#1F1F2E",
          foreground: "#E8E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "Fira Code", "monospace"],
        display: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,51,68,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,51,68,0.05) 1px, transparent 1px)",
        "cyber-gradient":
          "linear-gradient(135deg, #FF3344 0%, #8B5CF6 50%, #00D4FF 100%)",
        "glow-primary": "radial-gradient(ellipse at center, rgba(255,51,68,0.15) 0%, transparent 70%)",
        "glow-secondary": "radial-gradient(ellipse at center, rgba(255,215,0,0.10) 0%, transparent 70%)",
        "surface-gradient": "linear-gradient(180deg, #1F1F2E 0%, #141420 100%)",
        "hero-gradient": "linear-gradient(135deg, #0D0D11 0%, #1a0a0e 50%, #0D0D11 100%)",
      },
      backgroundSize: {
        "grid-size": "40px 40px",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(255,51,68,0.4), 0 0 40px rgba(255,51,68,0.2)",
        "glow-secondary": "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.2)",
        "glow-cyan": "0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.2)",
        "glow-green": "0 0 20px rgba(0,255,136,0.4), 0 0 40px rgba(0,255,136,0.2)",
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(255,51,68,0.15)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 3s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "flicker": "flicker 0.15s infinite",
        "slide-in-up": "slideInUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "terminal-blink": "terminalBlink 1s step-end infinite",
        "progress-bar": "progressBar 2s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255,51,68,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(255,51,68,0.7), 0 0 60px rgba(255,51,68,0.3)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": { opacity: "1" },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": { opacity: "0.4" },
        },
        slideInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        terminalBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        progressBar: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [animate],
};

export default config;
