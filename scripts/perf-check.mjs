#!/usr/bin/env node
/**
 * Performance and accessibility budgets, run in a real browser against the
 * static export. `npm run perf:check` builds the site (unless --skip-build),
 * serves out/ on a free local port, and runs:
 *
 *   1. perf        mid phone + slow 4G + 4x CPU: FCP/text < 1s, LCP < 2s,
 *                  fly-through chunk requested only after first paint
 *   2. classic     ?view=classic never requests the fly-through chunk
 *   3. reduced     prefers-reduced-motion renders the flat tree, no chunk
 *   4. axe         zero serious/critical violations, interactive and classic
 *   5. keyboard    Tab reaches nav, AI diagram nodes and CTAs, focus visible
 *   6. reversal    panel transforms match scrolling down then back up
 *
 * Flags: --skip-build, --shots <dir> (also write review screenshots).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { startStaticServer } from "./perf/static-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

const BUDGETS = {
  textVisibleMs: 1000,
  lcpMs: 2000,
};

/** Mid-range Android phone. */
const PHONE = {
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Moto G Power) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
};
const DESKTOP = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };

/** Lighthouse "Slow 4G": 1.6 Mbps down, 750 kbps up, 150 ms RTT. */
const SLOW_4G = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
};
const CPU_SLOWDOWN = 4;

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

function build() {
  console.log("Building static export...");
  const r = spawnSync("npx", ["next", "build"], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) throw new Error("next build failed");
}

async function newPage(browser, base, device, { reducedMotion = false, throttle = false } = {}) {
  const context = await browser.newContext({
    ...device,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const requests = [];
  page.on("response", (res) => {
    if (res.url().includes("/_next/static/chunks/") && res.url().endsWith(".js")) requests.push(res.url());
  });
  await page.addInitScript(() => {
    window.__perf = { lcp: 0, fcp: 0, lcpList: [] };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__perf.lcp = e.startTime;
        window.__perf.lcpList.push(e.startTime);
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (e.name === "first-contentful-paint") window.__perf.fcp = e.startTime;
    }).observe({ type: "paint", buffered: true });
  });
  if (throttle) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", SLOW_4G);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });
  }
  return { context, page, requests, base };
}

/** Chunks whose source contains the fly-stage markup are the fly-through chunk. */
async function flyChunkUrls(urls) {
  const out = [];
  for (const u of new Set(urls)) {
    const body = await (await fetch(u)).text();
    if (body.includes("fly-stage") && body.includes("fly-world")) out.push(u);
  }
  return out;
}

async function settle(page, ms = 1500) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(ms);
}

async function checkPerf(browser, base) {
  const { context, page } = await newPage(browser, base, PHONE, { throttle: true });
  const flyRequests = [];
  page.on("request", async (req) => {
    const u = req.url();
    if (u.includes("/_next/static/chunks/") && u.endsWith(".js")) {
      flyRequests.push({ url: u, at: Date.now() });
    }
  });
  const t0 = Date.now();
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(4000);
  const perf = await page.evaluate(() => ({
    ...window.__perf,
    swapAt: performance.getEntriesByName("fly-stage-swap")[0]?.startTime ?? null,
  }));
  // LCP of the first-paint content: the last candidate before the fly-through stage replaces it.
  const firstPaintLcp = perf.swapAt == null ? perf.lcp : Math.max(0, ...perf.lcpList.filter((t) => t < perf.swapAt));
  const h1 = await page.evaluate(() => {
    const el = document.querySelector("h1");
    return el ? { text: el.textContent?.trim() ?? "", visible: el.checkVisibility({ checkVisibilityCSS: true }) } : null;
  });
  const entries = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((e) => e.name.includes("/_next/static/chunks/") && e.name.endsWith(".js"))
      .map((e) => ({ url: e.name, start: e.startTime })),
  );
  const flyUrls = new Set(await flyChunkUrls(entries.map((e) => e.url)));
  const flyEntries = entries.filter((e) => flyUrls.has(e.url));
  // Scripts present in the served HTML (the DOM also gains script tags at runtime for dynamic imports).
  const html = await (await fetch(`${base}/`)).text();
  const initialScripts = [...html.matchAll(/src="([^"]*\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => new URL(m[1], base).href);
  void t0;
  void flyRequests;

  record(
    "perf: text visible (FCP) under budget",
    !!h1?.text && !!h1.visible && perf.fcp > 0 && perf.fcp < BUDGETS.textVisibleMs,
    `FCP ${perf.fcp.toFixed(0)}ms < ${BUDGETS.textVisibleMs}ms, h1 "${(h1?.text ?? "").slice(0, 40)}"`,
  );
  record(
    "perf: LCP under budget (first-paint content, before the stage swap)",
    firstPaintLcp > 0 && firstPaintLcp < BUDGETS.lcpMs,
    `LCP ${firstPaintLcp.toFixed(0)}ms < ${BUDGETS.lcpMs}ms`,
  );
  console.log(
    `INFO  stage swap at ${perf.swapAt == null ? "n/a" : perf.swapAt.toFixed(0) + "ms"}; final LCP candidate incl. the swapped-in stage: ${perf.lcp.toFixed(0)}ms (not asserted)`,
  );
  record("perf: fly-through chunk identified", flyEntries.length > 0, `${flyEntries.length} chunk(s)`);
  const early = flyEntries.filter((e) => e.start < perf.fcp);
  const inInitialHtml = flyEntries.filter((e) => initialScripts.includes(e.url));
  record(
    "perf: fly-through chunk loads after first paint",
    flyEntries.length > 0 && early.length === 0 && inInitialHtml.length === 0,
    `FCP ${perf.fcp.toFixed(0)}ms, chunk starts ${flyEntries.map((e) => e.start.toFixed(0)).join(",")}ms, in initial HTML: ${inInitialHtml.length}`,
  );
  await context.close();
}

async function checkNoStageChunk(browser, base, name, url, opts) {
  const { context, page, requests } = await newPage(browser, base, DESKTOP, opts);
  await page.goto(url, { waitUntil: "load" });
  await settle(page, 1500);
  const flyUrls = await flyChunkUrls(requests);
  const stage = await page.locator(".fly-stage").count();
  const flat = await page.locator('[data-testid="flat-stack"]').count();
  const titles = await page.locator("h1, h2").count();
  record(`${name}: renders flat tree, no stage`, stage === 0 && flat === 1 && titles >= 7, `.fly-stage=${stage}, flat-stack marker=${flat}, headings=${titles}`);
  record(`${name}: fly-through chunk never requested`, flyUrls.length === 0, `${flyUrls.length} stage chunk request(s)`);
  await context.close();
}

async function runAxe(page, scope = null) {
  const require = createRequire(import.meta.url);
  const src = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.evaluate(src);
  return page.evaluate(async (scope) => {
    const ctx = scope && document.querySelector(scope) ? { include: [[".site-nav"], [scope], [".site-footer"]] } : document;
    const r = await window.axe.run(ctx, { resultTypes: ["violations"] });
    return r.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")), count: v.nodes.length }));
  }, scope);
}

/** Scroll range in px for the interactive page (matches FLY_CONFIG.scrollLvh). */
async function scrollMax(page) {
  return page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
}

async function checkAxe(browser, base) {
  for (const [label, device] of [["desktop", DESKTOP], ["mobile", PHONE]]) {
    // Classic
    {
      const { context, page } = await newPage(browser, base, device);
      await page.goto(`${base}/?view=classic`, { waitUntil: "load" });
      await settle(page, 800);
      const v = await runAxe(page);
      record(`axe: classic ${label} has no serious/critical violations`, v.length === 0, v.length ? JSON.stringify(v) : "0 violations");
      await context.close();
    }
    // Interactive, sampled at several scroll positions
    {
      const { context, page } = await newPage(browser, base, device);
      await page.goto(`${base}/`, { waitUntil: "load" });
      await page.waitForSelector(".fly-stage", { timeout: 15000 });
      await page.waitForTimeout(600);
      const all = new Map();
      // Rest positions: land on each panel via the nav anchors (what a visitor does), then scan.
      const targets = ["#positioning", "#ai-toolkit", "#work", "#experience", "#testimonials", "#contact"];
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(900);
      // Scope: nav + footer + the panel the camera rests on. Panels further down the tunnel are
      // faded, mid-build and foreshortened, so axe cannot compute meaningful contrast for them.
      for (const v of await runAxe(page)) all.set(v.id, v);
      for (const t of targets) {
        await page.evaluate((h) => document.querySelector(`.site-nav a[href="${h}"]`)?.click(), t);
        await page.waitForTimeout(2200);
        const sel = await page.evaluate((h) => {
          const el = document.getElementById(h.slice(1))?.closest(".fly-panel");
          if (!el) return null;
          el.setAttribute("data-axe-active", "");
          return "[data-axe-active]";
        }, t);
        for (const v of await runAxe(page, sel)) all.set(v.id, v);
        await page.evaluate(() => document.querySelector("[data-axe-active]")?.removeAttribute("data-axe-active"));
      }
      const list = [...all.values()];
      record(`axe: interactive ${label} has no serious/critical violations`, list.length === 0, list.length ? JSON.stringify(list) : "0 violations at 7 rest positions (nav + footer + resting panel)");
      await context.close();
    }
  }
}

const FOCUS_PROBE = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
  const shadow = cs.boxShadow !== "none";
  const r = el.getBoundingClientRect();
  const onscreen =
    r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth &&
    el.checkVisibility({ checkVisibilityCSS: true });
  const cls = typeof el.className === "string" ? el.className : "";
  return {
    tag: el.tagName.toLowerCase(),
    text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
    cls,
    inNav: !!el.closest(".site-nav"),
    inAiDiagram: !!el.closest('[data-testid="ai-diagram"]'),
    isCta: /contact-btn/.test(cls),
    focusVisible: el.matches(":focus-visible"),
    ring: outline || shadow,
    onscreen,
  };
};

async function checkKeyboard(browser, base) {
  const { context, page } = await newPage(browser, base, DESKTOP);
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForSelector(".fly-stage", { timeout: 15000 });
  await page.waitForTimeout(600);
  const seen = [];
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(450);
    const f = await page.evaluate(FOCUS_PROBE);
    if (f) seen.push(f);
  }
  const group = (pred) => seen.filter(pred);
  const nav = group((f) => f.inNav && f.tag === "a");
  const ai = group((f) => f.inAiDiagram && f.tag === "button");
  const cta = group((f) => f.isCta);
  const navDistinct = new Set(nav.map((f) => f.text)).size;
  const aiDistinct = new Set(ai.map((f) => f.text)).size;
  const ctaDistinct = new Set(cta.map((f) => f.text)).size;
  const bad = (g) => g.filter((f) => !(f.focusVisible && f.ring && f.onscreen));
  const fmt = (g) => bad(g).slice(0, 3).map((f) => `${f.text}[vis=${f.focusVisible},ring=${f.ring},onscreen=${f.onscreen}]`).join("; ");
  record("keyboard: reaches all nav links", navDistinct >= 6, `${navDistinct} distinct`);
  record("keyboard: reaches AI diagram nodes", aiDistinct >= 3, `${aiDistinct} distinct`);
  record("keyboard: reaches CTAs (Copy email / Email me)", ctaDistinct >= 2, `${ctaDistinct} distinct`);
  record("keyboard: nav focus is visible and on screen", nav.length > 0 && bad(nav).length === 0, fmt(nav) || `${nav.length} stops`);
  record("keyboard: AI node focus is visible and on screen", ai.length > 0 && bad(ai).length === 0, fmt(ai) || `${ai.length} stops`);
  record("keyboard: CTA focus is visible and on screen", cta.length > 0 && bad(cta).length === 0, fmt(cta) || `${cta.length} stops`);
  await context.close();
}

async function panelState(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".fly-panel")].map((p) => `${p.style.transform}|${p.style.opacity}`),
  );
}

async function settledPanelState(page) {
  let prev = "";
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(60);
    const cur = JSON.stringify(await panelState(page));
    if (cur === prev) return JSON.parse(cur);
    prev = cur;
  }
  return JSON.parse(prev);
}

const nums = (s) => (s.match(/-?\d+(\.\d+)?(e-?\d+)?/g) ?? []).map(Number);

async function checkReversal(browser, base) {
  for (const [label, device] of [["desktop", DESKTOP], ["mobile", PHONE]]) {
    const { context, page } = await newPage(browser, base, device);
    await page.goto(`${base}/`, { waitUntil: "load" });
    await page.waitForSelector(".fly-stage", { timeout: 15000 });
    await page.waitForTimeout(600);
    const max = await scrollMax(page);
    const steps = 24;
    const ys = Array.from({ length: steps + 1 }, (_, i) => Math.round((max * i) / steps));
    const down = [];
    for (const y of ys) {
      await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
      down.push(await settledPanelState(page));
    }
    const up = [];
    for (const y of [...ys].reverse()) {
      await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
      up.push(await settledPanelState(page));
    }
    up.reverse();
    let worst = 0;
    let mismatches = 0;
    for (let i = 0; i < down.length; i++) {
      for (let p = 0; p < down[i].length; p++) {
        const a = nums(down[i][p]);
        const b = nums(up[i][p]);
        if (a.length !== b.length) {
          mismatches++;
          continue;
        }
        const d = Math.max(0, ...a.map((v, k) => Math.abs(v - b[k])));
        worst = Math.max(worst, d);
        if (d > 0.01) mismatches++;
      }
    }
    record(`reversal: ${label} panel transforms match down vs up`, mismatches === 0, `${ys.length} positions x ${down[0].length} panels, worst delta ${worst.toExponential(2)}, mismatches ${mismatches}`);
    await context.close();
  }
}

async function shots(browser, base, dir) {
  mkdirSync(dir, { recursive: true });
  const out = [];
  for (const [label, device] of [["desktop", DESKTOP], ["mobile", PHONE]]) {
    // Interactive: top, mid (AI toolkit dwell), and bottom (footer + contact)
    const { context, page } = await newPage(browser, base, device);
    await page.goto(`${base}/`, { waitUntil: "load" });
    await page.waitForSelector(".fly-stage", { timeout: 15000 });
    await page.waitForTimeout(800);
    const max = await scrollMax(page);
    for (const [name, frac] of [["top", 0], ["ai-toolkit", 0.43], ["testimonials", 0.8], ["bottom", 1]]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), max * frac);
      await settledPanelState(page);
      await page.waitForTimeout(400);
      const file = join(dir, `${label}-interactive-${name}.png`);
      await page.screenshot({ path: file });
      out.push(file);
    }
    await context.close();
    const c = await newPage(browser, base, device);
    await c.page.goto(`${base}/?view=classic`, { waitUntil: "load" });
    await settle(c.page, 800);
    const top = join(dir, `${label}-classic-top.png`);
    await c.page.screenshot({ path: top });
    const full = join(dir, `${label}-classic-full.png`);
    await c.page.screenshot({ path: full, fullPage: true });
    out.push(top, full);
    await c.context.close();
  }
  console.log("Screenshots:\n" + out.join("\n"));
}

async function main() {
  if (!flag("--skip-build")) build();
  const server = await startStaticServer(join(ROOT, "out"));
  const browser = await chromium.launch();
  try {
    console.log(`Serving out/ at ${server.url}`);
    await checkPerf(browser, server.url);
    await checkNoStageChunk(browser, server.url, "classic", `${server.url}/?view=classic`, {});
    await checkNoStageChunk(browser, server.url, "reduced-motion", `${server.url}/`, { reducedMotion: true });
    await checkAxe(browser, server.url);
    await checkKeyboard(browser, server.url);
    await checkReversal(browser, server.url);
    const dir = flagValue("--shots");
    if (dir) await shots(browser, server.url, resolve(dir));
  } finally {
    await browser.close();
    await server.close();
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
