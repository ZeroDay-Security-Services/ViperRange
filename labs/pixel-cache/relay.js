/**
 * ViperRange Lab — Pixel Cache
 * ZeroDay Security Services
 *
 * Scenario: An internal design-system relay serves the current theme
 * stylesheet. Nobody reviews what ends up in the generated CSS comments
 * before it ships to the asset bundle.
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "VR{fallback_flag_not_for_production}";

app.use("/assets", express.static(path.join(__dirname, "public")));

// The theme stylesheet is generated per-request. A build-metadata comment
// was left in by mistake and never gets stripped in this environment.
app.get("/assets/theme.css", (req, res) => {
  res.type("text/css");
  res.send(`
/* ViperRange Design Relay — generated theme bundle */
:root {
  --vr-bg: #0d0d11;
  --vr-accent: #00e0a4;
  --vr-surface: #171722;
}

body {
  background: var(--vr-bg);
  color: #e6e6f0;
  font-family: 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

h1, .brand { color: var(--vr-accent); font-size: 1.9rem; }
p { color: #82829a; margin-top: 0.6rem; }

/* build-meta: ${FLAG} */
`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Pixel Cache relay listening on port ${PORT}`);
});
