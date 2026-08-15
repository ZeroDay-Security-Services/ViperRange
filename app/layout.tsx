// ViperRange — Root Layout
// ZeroDay Security Services

import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "ViperRange — Ephemeral Cyber Labs",
    template: "%s | ViperRange",
  },
  description:
    "Enterprise-grade cyber range platform by ZeroDay Security Services. Launch isolated vulnerable labs on demand, attack legally, learn practically.",
  keywords: [
    "cyber range",
    "penetration testing",
    "security training",
    "OWASP",
    "ethical hacking",
    "ZeroDay Security Services",
  ],
  authors: [{ name: "ZeroDay Security Services", url: "https://zeroday.in" }],
  creator: "ZeroDay Security Services",
  publisher: "ZeroDay Security Services",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
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
