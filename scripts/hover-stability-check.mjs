#!/usr/bin/env node
/**
 * Hover stability check. Drives a slow mouse across the edge of each hero CTA
 * and its panel, in a real browser against a running static export, and counts
 * how often `:hover` flips. A single monotonic pass across an edge must flip
 * hover exactly once. More flips means the hit target moves under the cursor
 * (cursor and border flicker).
 *
 * Usage: node scripts/hover-stability-check.mjs [--base http://localhost:3000] [--no-look]
 *   --no-look  drop window mousemove listeners (disables look-around) for a differential run.
 * Exit 0 when every target flips exactly once, 1 otherwise.
 */
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

const TARGETS = [
  { name: "hero .btn-primary", selector: ".fly-panel .btn-primary" },
  { name: "hero .btn-outline", selector: ".fly-panel .btn-outline" },
  { name: "hero panel layer", selector: ".fly-panel .panel-layer--polished" },
];

/**
 * Run the check on an existing browser against `base`. Returns one result per
 * target: { name, ok, flips, cursorFlips, frames } (or { name, skipped: true }).
 */
export async function checkHoverStability(browser, base, { noLook = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  if (noLook) {
    await page.addInitScript(() => {
      const orig = window.addEventListener;
      window.addEventListener = function (type, ...rest) {
        if (type === "mousemove") return;
        return orig.call(this, type, ...rest);
      };
    });
  }
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForSelector(".fly-stage", { timeout: 10000 });
  await page.waitForTimeout(800);

  const results = [];
  for (const t of TARGETS) {
    // Pick the visible (pointer-events auto) instance.
    const box = await page.evaluate((sel) => {
      for (const el of document.querySelectorAll(sel)) {
        const panel = el.closest(".fly-panel");
        if (panel && getComputedStyle(panel).pointerEvents === "none") continue;
        const r = el.getBoundingClientRect();
        if (r.width && r.height) {
          el.setAttribute("data-hover-probe", "1");
          return { x: r.left, y: r.top, w: r.width, h: r.height };
        }
      }
      return null;
    }, t.selector);
    if (!box) {
      results.push({ name: t.name, skipped: true });
      continue;
    }

    // Park the mouse well left of the target, let look-around settle.
    const y = box.y + box.h / 2;
    const startX = box.x - 40;
    const endX = box.x + 40;
    await page.mouse.move(startX, y);
    await page.waitForTimeout(1500);

    // Sample :hover and computed cursor once per frame while the mouse creeps right.
    await page.evaluate(() => {
      const el = document.querySelector("[data-hover-probe]");
      window.__hoverSamples = [];
      window.__hoverStop = false;
      const loop = () => {
        const hit = document.elementFromPoint(window.__mx ?? 0, window.__my ?? 0);
        window.__hoverSamples.push({ hover: el.matches(":hover"), cursor: hit ? getComputedStyle(hit).cursor : "" });
        if (!window.__hoverStop) requestAnimationFrame(loop);
      };
      document.addEventListener("mousemove", (e) => {
        window.__mx = e.clientX;
        window.__my = e.clientY;
      }, { capture: true });
      requestAnimationFrame(loop);
    });
    for (let x = startX; x <= endX; x += 1) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(500);
    const samples = await page.evaluate(() => {
      window.__hoverStop = true;
      document.querySelector("[data-hover-probe]")?.removeAttribute("data-hover-probe");
      return window.__hoverSamples;
    });
    let flips = 0;
    let cursorFlips = 0;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].hover !== samples[i - 1].hover) flips++;
      if (samples[i].cursor !== samples[i - 1].cursor) cursorFlips++;
    }
    results.push({ name: t.name, ok: flips === 1, flips, cursorFlips, frames: samples.length });
  }
  await context.close();
  return results;
}

async function main() {
  const base = flagValue("--base") ?? "http://localhost:3000";
  const browser = await chromium.launch();
  let results;
  try {
    results = await checkHoverStability(browser, base, { noLook: args.includes("--no-look") });
  } finally {
    await browser.close();
  }
  for (const r of results) {
    if (r.skipped) console.log(`SKIP  ${r.name}  (not found)`);
    else console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  (hover flips=${r.flips}, cursor flips=${r.cursorFlips}, frames=${r.frames})`);
  }
  process.exit(results.some((r) => !r.skipped && !r.ok) ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(2);
  });
}
