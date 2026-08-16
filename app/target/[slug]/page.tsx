// ViperRange — Interactive Target Lab Runner
// ZeroDay Security Services
// Provides standalone, resilient, in-browser live offensive lab targets

import { notFound } from "next/navigation";
import { TargetLabSandbox } from "@/components/labs/target-sandbox";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const titles: Record<string, string> = {
    "file-oracle": "File Oracle — Target Environment",
    "pixel-cache": "Pixel Cache — Target Environment",
    "crawler-protocol": "Crawler Protocol — Target Environment",
    "session-architect": "Session Architect — Target Environment",
    "cipher-gate": "Cipher Gate — Target Environment",
    "loose-types": "Loose Types — Target Environment",
    "template-engine": "Template Engine — Target Environment",
    "style-injector": "Style Injector — Target Environment",
  };

  return {
    title: titles[params.slug] || "ViperRange Cyber Target",
  };
}

const VALID_SLUGS = [
  "file-oracle",
  "pixel-cache",
  "crawler-protocol",
  "session-architect",
  "cipher-gate",
  "loose-types",
  "template-engine",
  "style-injector",
];

export default function TargetLabPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!VALID_SLUGS.includes(params.slug)) {
    notFound();
  }

  return <TargetLabSandbox slug={params.slug} />;
}
