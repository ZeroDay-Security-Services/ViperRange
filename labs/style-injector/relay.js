/**
 * ViperRange Lab — Style Injector
 * ZeroDay Security Services
 *
 * Scenario: A theme preview widget lets visitors set an accent color that
 * gets spliced directly into an inline <style> block. The only
 * sanitization applied strips angle brackets — nothing stops an attacker
 * from closing the CSS rule early and injecting new selectors.
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "VR{css_selectors_leak_secrets}";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

function sanitize(input) {
  // Intentionally weak — mirrors the vulnerable app's own sanitizer.
  return String(input || "").replace(/</g, "").replace(/>/g, "");
}

app.get("/", (req, res) => {
  const color = sanitize(req.query.color || "#00ff88");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Style Injector — ViperRange Cyber Range</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #08080f;
    color: #e4e4ee;
    font-family: 'Courier New', monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2.5rem 1.5rem;
  }
  .card {
    background: #10101a;
    border: 1px solid #232338;
    border-radius: 12px;
    padding: 2.5rem;
    width: 100%;
    max-width: 600px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 255, 136, 0.05);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #00ff88, #3b82f6, #f43f5e);
  }
  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
    color: #00ff88;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.35rem 0.8rem;
    border-radius: 9999px;
    margin-bottom: 1.5rem;
    letter-spacing: 1px;
  }
  .beacon {
    width: 8px; height: 8px;
    background: #00ff88;
    border-radius: 50%;
    box-shadow: 0 0 8px #00ff88;
  }
  h1 {
    color: #ffffff;
    font-size: 1.8rem;
    margin-bottom: 0.4rem;
    letter-spacing: 1px;
  }
  .subtitle {
    color: #8f90a6;
    font-size: 0.85rem;
    margin-bottom: 2rem;
  }
  .swatch-container {
    background: #090912;
    border: 1px dashed #2e2e46;
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .swatch {
    background-color: ${color};
    width: 100%;
    height: 110px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    transition: all 0.3s ease;
  }
  .swatch-label {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
  form {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  input[type="text"] {
    flex: 1;
    background: #181826;
    border: 1px solid #2e2e46;
    color: #00ff88;
    padding: 0.8rem 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    border-radius: 8px;
    outline: none;
  }
  input[type="text"]:focus {
    border-color: #00ff88;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
  }
  button {
    background: #00ff88;
    color: #08080f;
    border: none;
    padding: 0.8rem 1.5rem;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  button:hover {
    background: #00cc6e;
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
  }
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  .btn-secondary {
    display: inline-block;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: bold;
    transition: all 0.2s;
  }
  .btn-secondary:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: #60a5fa;
  }
  .footer-note {
    color: #52526b;
    font-size: 0.75rem;
    margin-top: 1.5rem;
  }
</style>
</head>
<body>
<input type="hidden" id="secret" value="${FLAG.replace(/"/g, "&quot;")}">
<div class="card">
  <div class="header-badge"><span class="beacon"></span> NEURAL THEME INJECTOR</div>
  <h1>🎨 Style Injector</h1>
  <p class="subtitle">Dynamic CSS compilation target & side-channel exfiltration node.</p>
  
  <div class="swatch-container">
    <div class="swatch"></div>
    <div class="swatch-label">ACTIVE RENDER BUFFER</div>
  </div>

  <form method="GET">
    <input type="text" name="color" placeholder="Inject CSS color or rule payload..." value="${color}">
    <button type="submit">Compile</button>
  </form>

  <div class="actions">
    <a href="/simulate" class="btn-secondary">⚡ Launch Attack Simulator (/simulate)</a>
  </div>

  <p class="footer-note">ZERODAY SECURITY SERVICES — VIPERRANGE ACTIVE TARGET NODE</p>
</div>
</body>
</html>`);
});

app.get("/simulate", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "simulate.html"));
});

app.post("/api/simulate", (req, res) => {
  const css = String(req.body.css || "");
  const ruleRegex = /#secret\[value\^=["']([^"']*)["']\]\s*\{[^}]*\}/g;

  const fired = [];
  let match;
  let ruleCount = 0;

  while ((match = ruleRegex.exec(css)) !== null) {
    ruleCount++;
    if (ruleCount > 500) break;
    const prefix = match[1];
    if (prefix.length > 0 && FLAG.startsWith(prefix)) {
      fired.push(prefix);
    }
  }

  fired.sort((a, b) => b.length - a.length);
  const longest = fired.length > 0 ? fired[0] : null;

  res.json({
    rulesParsed: ruleCount,
    matchedPrefix: longest,
    requestsFired: fired.length,
  });
});

app.listen(PORT, () => console.log(`Style Injector relay listening on port ${PORT}`));
