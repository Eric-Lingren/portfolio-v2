#!/usr/bin/env node
// Renders content/resume/resume.mdx to public/eric-lingren-resume.pdf (one US Letter page).
// Roles and dates come from src/content/experience.ts, contact details from src/content/site.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";
import { PDFDocument } from "pdf-lib";
import { EXPERIENCE } from "../src/content/experience.ts";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../src/content/site.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "content/resume/resume.mdx");
const OUT = path.join(ROOT, "public/eric-lingren-resume.pdf");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CSS = `
@page { size: Letter; margin: 0.5in; }
* { box-sizing: border-box; }
body { font: 9.5pt/1.35 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111; margin: 0; }
h1 { font-size: 20pt; margin: 0; }
.headline { font-size: 11pt; color: #333; margin: 2px 0 0; }
.contact { font-size: 9pt; color: #333; margin: 4px 0 8px; }
h2 { font-size: 9.5pt; letter-spacing: .08em; text-transform: uppercase; border-bottom: 1px solid #999; margin: 10px 0 4px; padding-bottom: 1px; }
.role { margin: 6px 0 0; }
.role-head { display: flex; justify-content: space-between; font-weight: 600; }
.role-head .dates { font-weight: 400; color: #333; }
ul { margin: 2px 0 0; padding-left: 16px; }
li { margin: 1px 0; }
p { margin: 0; }
`;

export function loadResume() {
  return matter(fs.readFileSync(SOURCE, "utf8")).data;
}

export function buildResumeHtml(data = loadResume()) {
  const roles = EXPERIENCE.map((r) => {
    const bullets = data.roleBullets?.[r.company] ?? [];
    return `<div class="role">
<div class="role-head"><span>${esc(r.title)}, ${esc(r.company)}</span><span class="dates">${esc(r.dates)}</span></div>
<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>`;
  }).join("\n");
  const skills = (data.skills ?? [])
    .map((s) => `<p><strong>${esc(s.label)}:</strong> ${esc(s.items)}</p>`)
    .join("\n");
  const education = (data.education ?? []).map((e) => `<p>${esc(e)}</p>`).join("\n");
  const strip = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(data.name)} resume</title>
<style>${CSS}</style></head><body>
<h1>${esc(data.name)}</h1>
<p class="headline">${esc(data.headline)}</p>
<p class="contact">${esc(EMAIL)} | ${esc(strip(LINKEDIN_URL))} | ${esc(strip(GITHUB_URL))}</p>
<h2>Summary</h2><p>${esc(data.summary)}</p>
<h2>Experience</h2>${roles}
<h2>Skills</h2>${skills}
<h2>Education</h2>${education}
</body></html>`;
}

export async function countPdfPages(buf) {
  return (await PDFDocument.load(Uint8Array.from(buf))).getPageCount();
}

async function main() {
  const { chromium } = await import("playwright-core");
  const html = buildResumeHtml();
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    throw new Error(
      `Could not launch Chromium. Install it with: npx playwright-core install chromium-headless-shell\n${err.message}`,
    );
  }
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const buf = await page.pdf({ format: "Letter", printBackground: true, preferCSSPageSize: true });
    const pages = await countPdfPages(buf);
    if (pages !== 1) throw new Error(`resume must be exactly 1 page, got ${pages}`);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, buf);
    console.log(`wrote ${path.relative(ROOT, OUT)} (1 page)`);
  } finally {
    await browser.close();
  }
  const markers = (html.match(/\[ERIC:/g) ?? []).length;
  if (markers) console.warn(`${markers} unresolved [ERIC: ...] marker(s) in the resume`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
