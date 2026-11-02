#!/usr/bin/env node
/**
 * Swap shift check. The home page paints the flat stack first and swaps in the
 * fly-through stage once its chunk loads. The hero must not move or resize at
 * the swap: the reader sees one static first paint. Records the hero name and
 * card boxes every frame from navigation until the stage settles, in a real
 * browser, and fails when any frame differs from the first paint by more than
 * a pixel. The name counts by position only: on a cold cache the web font can
 * swap in before the stage and change the text's width, which is not the swap.
 *
 * Usage: node scripts/swap-shift-check.mjs [--base http://localhost:3000]
 * Exit 0 when the hero holds still at every viewport, 1 otherwise.
 */
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

/** Desktop sizes on both sides of the stage's scaleBelow breakpoint (1240px). */
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 800, height: 900 },
];
const TOLERANCE_PX = 1;

/** Runs in the page before any document script: logs each distinct hero geometry, one entry per change. */
const RECORDER = () => {
  window.__heroFrames = [];
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return [r.left, r.top, r.width, r.height].map((n) => Math.round(n * 10) / 10);
  };
  const frame = () => {
    // The visible hero: the stage's sketch copy sits inside the wipe and is skipped.
    const name = [...document.querySelectorAll(".hero-name")].find((el) => !el.closest("[data-wipe]"));
    if (name && name.getBoundingClientRect().width > 0) {
      const card = name.closest(".panel-layer");
      const entry = {
        t: Math.round(performance.now()),
        stage: !!document.querySelector("[data-testid=fly-stage]"),
        name: box(name),
        card: box(card),
      };
      const last = window.__heroFrames.at(-1);
      if (!last || JSON.stringify([last.stage, last.name, last.card]) !== JSON.stringify([entry.stage, entry.name, entry.card])) {
        window.__heroFrames.push(entry);
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

const worst = (a, b) => Math.max(...a.map((n, i) => Math.abs(n - b[i])));

/** Run the check on an existing browser against `base`. Returns one result per viewport. */
export async function checkSwapShift(browser, base) {
  const out = [];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.addInitScript(RECORDER);
    await page.goto(`${base}/`, { waitUntil: "load" });
    await page.waitForSelector("[data-testid=fly-stage]", { timeout: 15000 });
    await page.waitForTimeout(600);
    const frames = await page.evaluate(() => window.__heroFrames);
    await context.close();
    const name = `${viewport.width}x${viewport.height}`;
    if (!frames.length || !frames.at(-1).stage) {
      out.push({ name, ok: false, detail: "stage never swapped in" });
      continue;
    }
    const [first] = frames;
    const shift = Math.max(...frames.map((f) => Math.max(worst(f.name.slice(0, 2), first.name.slice(0, 2)), worst(f.card, first.card))));
    const ok = first.stage === false && shift <= TOLERANCE_PX;
    const trail = frames.map((f) => `${f.t}ms ${f.stage ? "stage" : "flat"} name ${f.name.slice(0, 2)} card ${f.card}`).join(" | ");
    out.push({ name, ok, shift, detail: `max shift ${shift}px over ${frames.length} states: ${trail}` });
  }
  return out;
}

async function main() {
  const base = flagValue("--base") ?? "http://localhost:3000";
  const browser = await chromium.launch();
  try {
    const results = await checkSwapShift(browser, base);
    for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  swap: hero holds still at ${r.name}  (${r.detail})`);
    process.exit(results.every((r) => r.ok) ? 0 : 1);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(2);
  });
}
