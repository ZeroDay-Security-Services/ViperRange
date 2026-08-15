/**
 * ViperRange Lab — Session Architect
 * ZeroDay Security Services
 *
 * Scenario: A tier-gated content portal decides access level from a
 * client-supplied cookie. The cookie value is base64, which the original
 * developer believed counted as "encrypted."
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "VR{fallback_flag_not_for_production}";

const REQUIRED_TIER = Buffer.from("clearance-omega").toString("base64");
const DEFAULT_TIER = Buffer.from("clearance-guest").toString("base64");

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const tier = req.cookies.tier;

  if (tier === REQUIRED_TIER) {
    res.send(`
      <!DOCTYPE html><html><head><title>Session Architect</title>
      <style>
        body{background:#0b0b12;color:#ffd166;font-family:monospace;text-align:center;padding:4rem 1.5rem;}
        .card{background:#171722;border:1px solid #ffd16644;border-radius:10px;
              padding:2rem;display:inline-block;margin-top:2rem;font-size:1.3rem;word-break:break-all;}
      </style></head><body>
      <h1>🗝 Omega Clearance Confirmed</h1>
      <div class="card">${FLAG}</div>
      </body></html>
    `);
    return;
  }

  res.cookie("tier", DEFAULT_TIER);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Session Architect listening on port ${PORT}`));
