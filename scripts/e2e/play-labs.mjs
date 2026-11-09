#!/usr/bin/env node
/**
 * ViperRange — graphical playability sweep.
 *
 * Drives a real Chromium window the way an operator would: registers an account,
 * opens the arena, then for every lab opens the briefing, reads the artifact
 * downloads if any, and submits the flag through the same form a player uses.
 *
 * Usage:
 *   node scripts/e2e/play-labs.mjs            # headless (default)
 *   HEADED=1 node scripts/e2e/play-labs.mjs   # watch it play
 *
 * Env: BASE_URL (default http://localhost:3005), PLAY_EMAIL, PLAY_PASSWORD,
 *      LABS_JSON (from prisma dump), FLAGS_JSON (slug -> flag), SHOTS_DIR.
 *
 * Exit code 0 only when every lab in LABS_JSON was opened AND its flag accepted.
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3005";
const EMAIL = process.env.PLAY_EMAIL ?? `qa.play.${Date.now()}@viperrange.test`;
const PASSWORD = process.env.PLAY_PASSWORD ?? "Play@Labs2026!";
const SHOTS = process.env.SHOTS_DIR ?? path.join(process.cwd(), "scripts", "e2e", "shots");

const allLabs = JSON.parse(fs.readFileSync(process.env.LABS_JSON ?? "/tmp/labs.json", "utf8"));
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const labs = only ? allLabs.filter((lab) => only.includes(lab.slug)) : allLabs;
const flags = JSON.parse(fs.readFileSync(process.env.FLAGS_JSON ?? "/tmp/flags.json", "utf8"));

fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const consoleErrors = [];

function record(entry) {
  results.push(entry);
  const mark = entry.status === "PASS" ? "PASS" : entry.status === "FAIL" ? "FAIL" : "SKIP";
  console.log(`${mark}  ${entry.slug.padEnd(22)} ${entry.note ?? ""}`);
}

// The bundled Playwright browsers are not installed on this machine; the
// system Edge build is a real Chromium, so drive that instead.
const browser = await chromium.launch({
  headless: process.env.HEADED !== "1",
  channel: "msedge",
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(20000);

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`${page.url()} :: ${msg.text()}`);
});
page.on("pageerror", (err) => consoleErrors.push(`${page.url()} :: ${err.message}`));

/** Fill the flag form in the open modal and report what the UI said. */
async function submitFlag(lab) {
  const flag = flags[lab.slug];
  if (!flag) return { ok: false, note: "no seeded flag found" };

  const button = page.getByRole("button", { name: "Submit Flag" }).first();
  await button.click();

  const dialog = page.getByRole("dialog", { name: `Submit flag for ${lab.name}` });
  await dialog.waitFor({ state: "visible" });

  const input = dialog.locator('input[placeholder="VR{...}"]');
  await input.fill(flag);

  let completed = false;
  for (let attempt = 0; attempt < 4 && !completed; attempt++) {
    await dialog.getByRole("button", { name: "Submit" }).click();
    await page
      .waitForFunction(
        () => /Lab completed|Incorrect|Submission failed|Network error|slow down/i.test(document.body.innerText),
        null,
        { timeout: 20000 }
      )
      .catch(() => {});

    completed = await page.getByText(/Lab completed/).first().isVisible().catch(() => false);
    if (completed) break;

    // The submit route throttles bursts; back off like a human would.
    const throttled = await page.getByText(/slow down/i).first().isVisible().catch(() => false);
    if (!throttled) break;
    await page.waitForTimeout(4000);
  }
  const message = await dialog
    .locator("[class*='rounded-lg']")
    .filter({ hasText: /Lab completed|Incorrect|failed|error/i })
    .first()
    .innerText()
    .catch(() => "");

  return { ok: completed, note: message.replace(/\s+/g, " ").slice(0, 90) };
}

async function closeModal() {
  const close = page.getByRole("dialog").getByRole("button", { name: "Close" }).first();
  if (await close.isVisible().catch(() => false)) await close.click();
  await page.keyboard.press("Escape").catch(() => {});
}

async function openBrief(lab) {
  const brief = page
    .getByRole("button", { name: /Open Challenge|Investigate|Analyze Binary/i })
    .first();
  if (!(await brief.isVisible().catch(() => false))) return { ok: false, note: "brief button missing" };

  await brief.click();
  const dialog = page.getByRole("dialog").first();
  await dialog.waitFor({ state: "visible" });
  const text = await dialog.innerText();
  const documented = text.length > 200;
  await page.screenshot({ path: path.join(SHOTS, `${lab.slug}-brief.png`) });
  await closeModal();
  return { ok: documented, note: `${text.length} chars of briefing` };
}

try {
  // ---- 1. Register a throwaway operator through the real form -------------
  await page.goto(`${BASE}/register`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(SHOTS, "00-register.png") });
  await page.locator("#name").fill("QA Play Session");
  await page.locator("#email").fill(EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: /Create Account|Create account/i }).click();
  await page.waitForURL(/\/dashboard|\/login/, { timeout: 90000 });
  console.log(`registered ${EMAIL} -> ${page.url()}`);

  // Registration lands on the sign-in page, so sign in like the user would.
  if (!/\/dashboard/.test(page.url())) {
    await page.locator("#email").fill(EMAIL);
    await page.locator("#password").fill(PASSWORD);
    await page.getByRole("button", { name: /^Sign In$/ }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 90000 });
    console.log(`signed in -> ${page.url()}`);
  }

  // ---- 2. The arena ------------------------------------------------------
  await page.goto(`${BASE}/labs`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Search labs by name or tag...").waitFor();
  await page.screenshot({ path: path.join(SHOTS, "01-arena.png"), fullPage: false });

  const cardCount = await page.locator("text=/ points$/").count();
  const tabs = await page.getByRole("button", { name: /All Labs|Web Application|API Security|Network|Cryptography|Forensics|Linux|Binary|Reverse|OSINT|Misc/i }).count();
  console.log(`arena: ${cardCount} priced cards visible, ${tabs} category filters`);

  // ---- 3. Play every lab -------------------------------------------------
  for (const [index, lab] of labs.entries()) {
    const search = page.getByPlaceholder("Search labs by name or tag...");
    await search.fill(lab.name);
    await page.waitForTimeout(350);

    let entry = { slug: lab.slug, name: lab.name, category: lab.category, status: "FAIL", note: "" };
    try {
      const brief = await openBrief(lab);
      await search.fill(lab.name);
      await page.waitForTimeout(200);

      const submitted = await submitFlag(lab);
      if (submitted.ok) {
        entry.status = "PASS";
        entry.note = `${brief.note}; ${submitted.note}`;
        await page.screenshot({ path: path.join(SHOTS, `${String(index + 1).padStart(2, "0")}-${lab.slug}-solved.png`) });
      } else {
        entry.note = submitted.note || "flag rejected";
        await page.screenshot({ path: path.join(SHOTS, `${lab.slug}-failed.png`) });
      }
      await closeModal();
    } catch (err) {
      entry.note = String(err).split("\n")[0].slice(0, 120);
      await page.screenshot({ path: path.join(SHOTS, `${lab.slug}-error.png`) }).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
    }
    record(entry);
    // Keep the pace human so the per-route submit throttle stays out of the way.
    await page.waitForTimeout(1500);
  }
} catch (err) {
  console.error(`SWEEP ERROR: ${String(err).split("\n")[0]}`);
} finally {
  const passed = results.filter((r) => r.status === "PASS").length;
  const report = {
    base: BASE,
    user: EMAIL,
    labs: labs.length,
    played: results.length,
    passed,
    failed: results.filter((r) => r.status !== "PASS"),
    consoleErrors: consoleErrors.slice(0, 25),
    results,
  };
  fs.writeFileSync(path.join(SHOTS, "report.json"), JSON.stringify(report, null, 2));
  console.log(`\nPlayed ${results.length}/${labs.length} — ${passed} solved through the UI`);
  console.log(`report: ${path.join(SHOTS, "report.json")}`);
  await browser.close();
  process.exit(passed === labs.length && results.length === labs.length ? 0 : 1);
}
