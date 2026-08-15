"use client";

import { useState } from "react";
import { BookOpen, Terminal, Shield, Globe, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalkthroughEntry {
  id: string;
  title: string;
  content: string;
  tool: string;
  order: number;
  lab: { name: string; slug: string };
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  "Burp Suite": Shield,
  "OWASP ZAP": Globe,
  "curl": Terminal,
  "Nikto": Terminal,
};

const TOOL_COLORS: Record<string, string> = {
  "Burp Suite": "text-accent-orange border-accent-orange/30 bg-accent-orange/10",
  "OWASP ZAP": "text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10",
  "curl": "text-status-ready border-status-ready/30 bg-status-ready/10",
  "Nikto": "text-accent-purple border-accent-purple/30 bg-accent-purple/10",
};

function renderMarkdown(content: string): string {
  return content
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="bg-background border border-white/10 rounded-lg p-4 my-4 overflow-x-auto thin-scrollbar"><code class="text-xs font-mono text-accent-cyan">${escapeHtml(code.trim())}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-surface rounded text-xs font-mono text-accent-cyan">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-lg font-bold text-white mt-6 mb-3 tracking-wide">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="font-semibold text-foreground text-base mt-5 mb-2 border-b border-white/10 pb-1">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="font-medium text-foreground text-sm mt-4 mb-2">$1</h3>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal text-sm text-muted-foreground mb-1">$1</li>')
    // Unordered lists
    .replace(/^[-•] (.+)$/gm, '<li class="ml-5 list-disc text-sm text-muted-foreground mb-1">$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/40 pl-4 my-3 text-sm text-muted-foreground italic">$1</blockquote>')
    // Warning lines
    .replace(/^⚠️ (.+)$/gm, '<div class="flex items-start gap-2 p-3 my-3 bg-secondary/10 border border-secondary/20 rounded-lg text-sm text-secondary"><span class="shrink-0">⚠️</span><span>$1</span></div>')
    // Paragraphs
    .replace(/^(?!<)(.+)$/gm, (line) =>
      line.trim() ? `<p class="text-sm text-muted-foreground leading-relaxed my-2">${line}</p>` : ""
    );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function WalkthroughViewer({ walkthroughs }: { walkthroughs: WalkthroughEntry[] }) {
  const [selected, setSelected] = useState<WalkthroughEntry | null>(
    walkthroughs[0] ?? null
  );

  if (walkthroughs.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No walkthroughs available yet.</p>
      </div>
    );
  }

  // Group by lab
  const byLab = walkthroughs.reduce<Record<string, WalkthroughEntry[]>>((acc, wt) => {
    const key = wt.lab.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(wt);
    return acc;
  }, {});

  const ToolIcon = selected ? (TOOL_ICONS[selected.tool] ?? BookOpen) : BookOpen;

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-5">
      {/* Sidebar */}
      <div className="glass-card p-4 space-y-4 h-fit lg:sticky lg:top-20">
        {Object.entries(byLab).map(([labName, wts]) => (
          <div key={labName}>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2 mb-2">
              {labName}
            </div>
            <div className="space-y-1">
              {wts.map((wt) => {
                const Icon = TOOL_ICONS[wt.tool] ?? BookOpen;
                const isActive = selected?.id === wt.id;
                return (
                  <button
                    key={wt.id}
                    onClick={() => setSelected(wt)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-sm",
                      isActive
                        ? "bg-primary/10 border border-primary/20 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive && "text-primary")} />
                    <span className="truncate">{wt.tool}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      {selected && (
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium",
                TOOL_COLORS[selected.tool] ?? "text-muted-foreground border-white/10 bg-surface"
              )}>
                <ToolIcon className="w-3.5 h-3.5" />
                {selected.tool}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {selected.lab.name}
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-white tracking-wide">
              {selected.title}
            </h2>
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-primary/80 font-mono">
              ⚠️ Only perform these tests against your own spawned lab environment. Never attack systems you do not own or have explicit permission to test.
            </div>
          </div>

          {/* Markdown content */}
          <div
            className="p-6 prose-viperrange max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
          />
        </div>
      )}
    </div>
  );
}
