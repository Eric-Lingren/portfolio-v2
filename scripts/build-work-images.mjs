#!/usr/bin/env node
// Builds the published work images from raw sources in docs/private/work (never committed).
// Driven by scripts/work-images.manifest.json:
//   { "<slug>": [ { "source": "<file under docs/private/work>", "name": "<output name>", "kind": "thumb"|"detail",
//                   "rect": { "left", "top", "width", "height" }, "minSource": { "width", "height" } } ] }
//  - minSource (optional): fail with a clear message when the source image is smaller than this.
//  - thumb:  crop rect (must be 2:1 within 1px), resize to 568x284, write public/work/<slug>/thumb.webp.
//  - detail: full-size WebP at public/work/<slug>/<name>.webp, max width 1600, never upscaled, aspect kept.
//            An optional rect crops first.
// Also writes src/content/work-images.json: published path -> { width, height } (read by <Figure>/<BeforeAfter>).
// Metadata is stripped (sharp drops it by default) and encoding is deterministic. Files in the output root that the
// run did not produce are removed, so public/work only ever holds generated files.
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const THUMB_WIDTH = 568;
export const THUMB_HEIGHT = 284;
export const DETAIL_MAX_WIDTH = 1600;
export const DEFAULT_MANIFEST = "scripts/work-images.manifest.json";
export const DEFAULT_SOURCE_ROOT = "docs/private/work";
export const DEFAULT_OUT_ROOT = "public/work";
export const DEFAULT_JSON_PATH = "src/content/work-images.json";

const SAFE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WEBP = { quality: 90, effort: 6, smartSubsample: true };

function within(root, ...parts) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, ...parts);
  if (!resolved.startsWith(resolvedRoot + path.sep)) throw new Error(`path escapes ${resolvedRoot}: ${resolved}`);
  return resolved;
}

function validateRect(rect, label, bounds, requireTwoToOne) {
  const keys = ["left", "top", "width", "height"];
  if (!rect || keys.some((k) => !Number.isInteger(rect[k]))) {
    throw new Error(`${label}: rect must have integer left, top, width, height`);
  }
  if (rect.left < 0 || rect.top < 0 || rect.width <= 0 || rect.height <= 0) {
    throw new Error(`${label}: crop rect out of bounds (negative or empty)`);
  }
  if (rect.left + rect.width > bounds.width || rect.top + rect.height > bounds.height) {
    throw new Error(
      `${label}: crop rect out of bounds (${rect.left},${rect.top} ${rect.width}x${rect.height} exceeds ${bounds.width}x${bounds.height})`,
    );
  }
  if (requireTwoToOne && Math.abs(rect.width / 2 - rect.height) > 1) {
    throw new Error(`${label}: thumb rect ${rect.width}x${rect.height} is not 2:1 (1px tolerance)`);
  }
}

async function buildOne({ slug, entry, sourceRoot, outRoot }) {
  const kind = entry.kind;
  const name = kind === "thumb" ? "thumb" : entry.name;
  const label = `${slug}/${name ?? "?"}`;
  if (kind !== "thumb" && kind !== "detail") throw new Error(`${label}: kind must be "thumb" or "detail"`);
  if (!SAFE_NAME.test(String(name))) throw new Error(`${label}: invalid output name`);
  if (typeof entry.source !== "string") throw new Error(`${label}: missing source`);

  let sourceFile;
  try {
    sourceFile = within(sourceRoot, entry.source);
  } catch (err) {
    throw new Error(`${label}: ${err.message}`);
  }
  let input;
  try {
    input = await readFile(sourceFile);
  } catch {
    throw new Error(`${label}: missing source ${entry.source}`);
  }
  const meta = await sharp(input).metadata();
  const bounds = { width: meta.width, height: meta.height };
  const min = entry.minSource;
  if (min && (bounds.width < min.width || bounds.height < min.height)) {
    throw new Error(
      `${label}: source ${entry.source} is ${bounds.width}x${bounds.height}, under the required minimum ${min.width}x${min.height}`,
    );
  }

  let pipeline = sharp(input);
  if (kind === "thumb") {
    validateRect(entry.rect, label, bounds, true);
    pipeline = pipeline
      .extract(entry.rect)
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "fill", kernel: "lanczos3" });
  } else {
    if (entry.rect) {
      validateRect(entry.rect, label, bounds, false);
      pipeline = pipeline.extract(entry.rect);
    }
    const srcWidth = entry.rect ? entry.rect.width : bounds.width;
    if (srcWidth > DETAIL_MAX_WIDTH) {
      pipeline = pipeline.resize({ width: DETAIL_MAX_WIDTH, withoutEnlargement: true, kernel: "lanczos3" });
    }
  }
  const out = await pipeline.webp(WEBP).toBuffer();
  const size = await sharp(out).metadata();
  const file = `${name}.webp`;
  const dest = within(outRoot, slug, file);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, out);
  return { publicPath: `/work/${slug}/${file}`, dest, width: size.width, height: size.height };
}

async function listFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...(await listFiles(p)));
    else found.push(p);
  }
  return found;
}

export async function buildWorkImages({
  manifestPath = path.resolve(DEFAULT_MANIFEST),
  sourceRoot = path.resolve(DEFAULT_SOURCE_ROOT),
  outRoot = path.resolve(DEFAULT_OUT_ROOT),
  jsonPath = path.resolve(DEFAULT_JSON_PATH),
  manifest,
} = {}) {
  const spec = manifest ?? JSON.parse(await readFile(manifestPath, "utf8"));
  const results = [];
  for (const slug of Object.keys(spec).sort()) {
    if (!SAFE_NAME.test(slug)) throw new Error(`invalid slug "${slug}"`);
    const seen = new Set();
    for (const entry of spec[slug]) {
      const r = await buildOne({ slug, entry, sourceRoot, outRoot });
      if (seen.has(r.publicPath)) throw new Error(`${slug}: duplicate output ${r.publicPath}`);
      seen.add(r.publicPath);
      results.push(r);
    }
  }
  const produced = new Set(results.map((r) => r.dest));
  for (const f of await listFiles(outRoot)) {
    if (!produced.has(f)) await rm(f);
  }
  const dims = {};
  for (const r of [...results].sort((a, b) => a.publicPath.localeCompare(b.publicPath))) {
    dims[r.publicPath] = { width: r.width, height: r.height };
  }
  await mkdir(path.dirname(jsonPath), { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(dims, null, 2)}\n`);
  return { results, dims };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { results } = await buildWorkImages();
    for (const r of results) console.log(`${r.publicPath} ${r.width}x${r.height}`);
    console.log(`built ${results.length} image(s)`);
  } catch (err) {
    console.error(`work:images failed: ${err.message}`);
    process.exit(1);
  }
}
