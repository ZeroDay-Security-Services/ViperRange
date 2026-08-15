/**
 * ViperRange Lab — Style Injector
 * ZeroDay Security Services
 *
 * Scenario: A theme preview widget lets visitors set an accent color that
 * gets spliced directly into an inline <style> block. The only
 * sanitization applied strips angle brackets — nothing stops an attacker
 * from closing the CSS rule early and injecting new selectors.
 *
 * A privileged session token is present on the page as a hidden field.
 * In a real browser, CSS attribute selectors combined with
 * background-image URLs can exfiltrate that value one character at a
 * time by observing which network requests fire. This lab reproduces
 * that side channel with a lightweight in-process renderer so the whole
 * environment stays a single container with no external callback
 * infrastructure required.
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "VR{fallback_flag_not_for_production}";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

function sanitize(input) {
  // Intentionally weak — mirrors the vulnerable app's own sanitizer.
  return String(input || "").replace(/</g, "").replace(/>/g, "");
}

app.get("/", (req, res) => {
  const color = sanitize(req.query.color || "teal");
  res.send(`<!DOCTYPE html>
<html><head><title>Theme Preview — ViperRange</title>
<style>
body { background:#0a0a10; font-family:monospace; color:#e4e4ee;
       display:flex; flex-direction:column; align-items:center;
       justify-content:center; min-height:100vh; padding:2rem; }
.swatch { background-color: ${color}; width:220px; height:120px;
          border-radius:10px; margin:1.5rem 0; }
</style>
</head>
<body>
<input type="hidden" id="secret" value="${FLAG.replace(/"/g, "&quot;")}">
<h1>🎨 Theme Preview</h1>
<div class="swatch"></div>
<form method="GET">
  <input name="color" placeholder="CSS color value..." value="${color}" style="padding:0.5rem;font-family:monospace;">
  <button type="submit">Apply</button>
</form>
<p style="color:#5a5a70;font-size:0.8rem;margin-top:1rem;max-width:400px;text-align:center;">
  Simulate how a privileged reviewer's browser would render this page at
  <code>/simulate</code> — submit the CSS you'd inject and see which
  attribute-selector rules would fire against the hidden session field.
</p>
</body></html>`);
});

app.get("/simulate", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "simulate.html"));
});

// Parses submitted CSS for rules of the form:
//   #secret[value^="PREFIX"] { background-image: url(...); }
// and reports which ones would have matched the real hidden value —
// exactly what a real browser would do when it evaluates the selector
// against the live DOM and fires the resulting network request.
app.post("/api/simulate", (req, res) => {
  const css = String(req.body.css || "");
  const ruleRegex = /#secret\[value\^=["']([^"']*)["']\]\s*\{[^}]*\}/g;

  const fired = [];
  let match;
  let ruleCount = 0;

  while ((match = ruleRegex.exec(css)) !== null) {
    ruleCount++;
    if (ruleCount > 500) break; // guard against pathological input
    const prefix = match[1];
    if (prefix.length > 0 && FLAG.startsWith(prefix)) {
      fired.push(prefix);
    }
  }

  // Only report the longest matching prefix per request to mirror how a
  // real exfil server log would look — one hit per distinguishable request.
  fired.sort((a, b) => b.length - a.length);
  const longest = fired.length > 0 ? fired[0] : null;

  res.json({
    rulesParsed: ruleCount,
    matchedPrefix: longest,
    requestsFired: fired.length,
  });
});

app.listen(PORT, () => console.log(`Style Injector relay listening on port ${PORT}`));
