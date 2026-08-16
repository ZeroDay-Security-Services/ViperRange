// ViperRange — Root Layout
// ZeroDay Security Services

import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";

function getMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "https://viper-range.vercel.app";
  try {
    const formatted = raw.startsWith("http") ? raw : `https://${raw}`;
    return new URL(formatted);
  } catch {
    return new URL("https://viper-range.vercel.app");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  openGraph: {
    title: "ViperRange — Ephemeral Cyber Labs",
    description:
      "Launch isolated vulnerable labs on demand. Attack legally, learn practically.",
    type: "website",
    locale: "en_IN",
    siteName: "ViperRange by ZeroDay Security Services",
  },
  twitter: {
    card: "summary_large_image",
    title: "ViperRange — Ephemeral Cyber Labs",
    description: "Enterprise cyber range by ZeroDay Security Services.",
  },
  icons: {
    icon: [
      { url: "/images/viperrange-logo.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/images/viperrange-logo.png",
    apple: "/images/viperrange-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0D11",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
