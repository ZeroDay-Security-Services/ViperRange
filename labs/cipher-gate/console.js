/**
 * ViperRange Lab — Cipher Gate
 * ZeroDay Security Services
 *
 * Scenario: A maintenance console gates a diagnostic command behind a
 * passphrase. The developer "protected" the passphrase by obfuscating
 * the client-side JavaScript that checks it — forgetting the server
 * still has to be told what the passphrase is somewhere.
 */

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "VR{fallback_flag_not_for_production}";

// The passphrase, split into fragments the way the obfuscated client build
// stores it — reconstructed here server-side for the real check.
const PASSPHRASE = "Qz9!vR2xLmP7";

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("console", { flag: null, error: null });
});

app.post("/", (req, res) => {
  const { passphrase } = req.body;
  if (passphrase === PASSPHRASE) {
    res.render("console", { flag: FLAG, error: null });
  } else {
    res.render("console", { flag: null, error: "Passphrase rejected." });
  }
});

app.listen(PORT, () => console.log(`Cipher Gate listening on port ${PORT}`));
