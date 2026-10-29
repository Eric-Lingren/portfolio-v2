#!/usr/bin/env node
// Extracts raw work image sources into docs/private/work/<slug>/ (ignored by version control, never committed).
//  1. Decodes the base64 JPEGs embedded in docs/private/eric-lingren-impact.html. Each <img> is assigned to a
//     slug by a pattern on its alt text (never by line number). Images matching no entry are skipped.
//  2. Downloads the 3 v1 Lighthouse reports of dev.insideoutdev.com into render-performance/.
// Idempotent: reruns overwrite the same names. Every output path is checked to stay under the work root.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SAFE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const DEFAULT_HTML_PATH = "docs/private/eric-lingren-impact.html";
export const DEFAULT_WORK_ROOT = "docs/private/work";

// Each entry: alt-text pattern -> slug + file name (no extension, .jpg is added).
export const IMAGE_MAPPING = [
  { alt: /configure page listing global metrics/i, slug: "kpi-granularity", name: "configure-ui" },
  { alt: /Add metrics modal/i, slug: "kpi-granularity", name: "company-specific-metrics" },
  { alt: /header before the redesign/i, slug: "investor-reports", name: "masthead-before" },
  { alt: /header after the redesign/i, slug: "investor-reports", name: "masthead-after" },
  { alt: /Progress tracker showing/i, slug: "investor-reports", name: "footer-progress-tracker" },
  { alt: /auto-submitted/i, slug: "investor-reports", name: "auto-submit-state" },
  { alt: /Datum Tracer/i, slug: "metrics-tab-v2", name: "focused-cell-datum-tracer" },
];

// URLs come from the 'Website Render Optimizations' entry of v1-legacy:src/components/standard/work/workData.js.
export const LIGHTHOUSE_SLUG = "render-performance";
export const LIGHTHOUSE_REPORTS = [
  {
    url: "https://user-images.githubusercontent.com/44101756/149412336-eef54a90-4225-492c-af6f-202a2427b085.png",
    name: "lighthouse-2021-10-28",
  },
  {
    url: "https://user-images.githubusercontent.com/44101756/149412347-d630b6d8-dd06-4732-bb03-df6007ff9fad.png",
    name: "lighthouse-2021-10-29",
  },
  {
    url: "https://user-images.githubusercontent.com/44101756/149412354-8ffa9f79-2d66-417c-90ca-73684ce299ac.png",
    name: "lighthouse-2021-11-01",
  },
];

function outputPath(workRoot, slug, fileName) {
  if (!SAFE_NAME.test(String(slug))) throw new Error(`invalid slug "${slug}"`);
  const base = fileName.replace(/\.[a-z]+$/, "");
  if (!SAFE_NAME.test(base)) throw new Error(`invalid file name "${fileName}"`);
  const root = path.resolve(workRoot);
  const resolved = path.resolve(root, slug, fileName);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`output path escapes ${root}: ${resolved}`);
  }
  return resolved;
}

export function parseImages(html) {
  const images = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = /\bsrc="data:image\/jpeg;base64,([A-Za-z0-9+/=\s]+)"/i.exec(tag);
    if (!src) continue;
    const alt = /\balt="([^"]*)"/i.exec(tag)?.[1] ?? "";
    images.push({ alt, bytes: Buffer.from(src[1].replace(/\s+/g, ""), "base64") });
  }
  return images;
}

async function writeAll(jobs) {
  for (const { file, bytes } of jobs) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
  }
  return jobs.map((j) => j.file);
}

export async function extractImages({ htmlPath, workRoot, mapping = IMAGE_MAPPING }) {
  const images = parseImages(await readFile(htmlPath, "utf8"));
  const jobs = [];
  const seen = new Set();
  for (const entry of mapping) {
    const file = outputPath(workRoot, entry.slug, `${entry.name}.jpg`);
    if (seen.has(file)) throw new Error(`duplicate mapping target ${file}`);
    seen.add(file);
    const hits = images.filter((img) => entry.alt.test(img.alt));
    if (hits.length !== 1) {
      throw new Error(`mapping ${entry.slug}/${entry.name} matched ${hits.length} images, expected 1`);
    }
    jobs.push({ file, bytes: hits[0].bytes });
  }
  return writeAll(jobs);
}

export async function fetchLighthouse({ workRoot, fetchFn = fetch, reports = LIGHTHOUSE_REPORTS }) {
  const jobs = [];
  for (const { url, name } of reports) {
    const file = outputPath(workRoot, LIGHTHOUSE_SLUG, `${name}.png`);
    const res = await fetchFn(url);
    if (res.status !== 200) throw new Error(`fetch failed for ${url}: HTTP ${res.status}`);
    jobs.push({ file, bytes: Buffer.from(await res.arrayBuffer()) });
  }
  return writeAll(jobs);
}

export async function extractWorkSources({
  htmlPath = path.resolve(DEFAULT_HTML_PATH),
  workRoot = path.resolve(DEFAULT_WORK_ROOT),
  fetchFn = fetch,
  mapping = IMAGE_MAPPING,
  reports = LIGHTHOUSE_REPORTS,
} = {}) {
  const images = await extractImages({ htmlPath, workRoot, mapping });
  const lighthouse = await fetchLighthouse({ workRoot, fetchFn, reports });
  return { images, lighthouse };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { images, lighthouse } = await extractWorkSources();
    for (const f of [...images, ...lighthouse]) console.log(path.relative(process.cwd(), f));
    console.log(`wrote ${images.length} image(s) and ${lighthouse.length} lighthouse report(s)`);
  } catch (err) {
    console.error(`work:sources failed: ${err.message}`);
    process.exit(1);
  }
}
