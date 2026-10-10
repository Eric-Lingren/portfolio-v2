#!/usr/bin/env node
// Redacts raw testimonial screenshots into uniform, publishable images.
// Raw inputs live in docs/private/testimonials/ (ignored by version control, never committed).
// regions.json there maps filename -> { regions: [{x,y,width,height}], roleLabel, alt }.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const BLOCK_COLOR = { r: 24, g: 24, b: 27 };
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
const ROLE_WORDS =
  /\b(engineer|developer|manager|director|lead|founder|cto|ceo|vp|head|architect|designer|analyst|recruiter|colleague|peer|mentor|teammate|principal|staff|senior|junior|intern|consultant|owner|product|engineering|executive|partner|client|customer|dispatcher)\b/i;

export function looksLikePersonalName(label, blocklist = []) {
  const text = String(label ?? "").trim();
  if (!text) return true;
  const lower = text.toLowerCase();
  if (blocklist.some((n) => n && lower.includes(n.toLowerCase()))) return true;
  if (/[@\d]/.test(text)) return true;
  const namePattern = /^[A-Z][a-z'’-]+(\s+[A-Z]\.?)?(\s+[A-Z][a-z'’-]+){1,2}$/;
  return namePattern.test(text) && !ROLE_WORDS.test(text);
}

function validateRegions(file, regions) {
  if (!Array.isArray(regions) || regions.length === 0) {
    throw new Error(`${file}: no redaction regions defined`);
  }
  for (const r of regions) {
    for (const k of ["x", "y", "width", "height"]) {
      if (!Number.isInteger(r?.[k]) || r[k] < 0) {
        throw new Error(`${file}: invalid region ${JSON.stringify(r)}`);
      }
    }
  }
}

export async function redactImage(input, regions, color = BLOCK_COLOR) {
  const base = sharp(input).removeAlpha();
  const { width, height } = await base.metadata();
  const overlays = regions.map((r) => {
    const w = Math.min(r.width, width - r.x);
    const h = Math.min(r.height, height - r.y);
    if (w <= 0 || h <= 0) throw new Error(`region ${JSON.stringify(r)} is outside the image`);
    return {
      input: { create: { width: w, height: h, channels: 3, background: color } },
      left: r.x,
      top: r.y,
    };
  });
  return base.composite(overlays).png().toBuffer();
}

export async function redactTestimonials({ inputDir, outputDir, manifestPath, blocklist = [] }) {
  const regionsPath = path.join(inputDir, "regions.json");
  if (!existsSync(regionsPath)) throw new Error(`missing ${regionsPath}`);
  const config = JSON.parse(await readFile(regionsPath, "utf8"));
  const files = (await readdir(inputDir)).filter((f) => IMAGE_EXT.test(f)).sort();
  if (files.length === 0) throw new Error(`no images found in ${inputDir}`);

  const entries = [];
  for (const file of files) {
    const cfg = config[file];
    if (!cfg) throw new Error(`${file}: no entry in regions.json`);
    validateRegions(file, cfg.regions);
    if (!cfg.alt || typeof cfg.alt !== "string") throw new Error(`${file}: missing alt text`);
    if (looksLikePersonalName(cfg.roleLabel, blocklist)) {
      throw new Error(`${file}: roleLabel "${cfg.roleLabel}" looks like a personal name`);
    }
    const id = path.basename(file, path.extname(file));
    const out = await redactImage(await readFile(path.join(inputDir, file)), cfg.regions);
    entries.push({ id, image: `/testimonials/${id}.png`, roleLabel: cfg.roleLabel, alt: cfg.alt, out });
  }

  await mkdir(outputDir, { recursive: true });
  for (const e of entries) await writeFile(path.join(outputDir, `${e.id}.png`), e.out);
  await mkdir(path.dirname(manifestPath), { recursive: true });
  const manifest = entries.map(({ id, image, roleLabel, alt }) => ({ id, image, roleLabel, alt }));
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const inputDir = path.join(root, "docs/private/testimonials");
  const blocklistPath = path.join(inputDir, "name-blocklist.txt");
  const blocklist = existsSync(blocklistPath)
    ? (await readFile(blocklistPath, "utf8")).split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  try {
    const manifest = await redactTestimonials({
      inputDir,
      outputDir: path.join(root, "public/testimonials"),
      manifestPath: path.join(root, "src/content/testimonials.json"),
      blocklist,
    });
    console.log(`redacted ${manifest.length} testimonial(s)`);
  } catch (err) {
    console.error(`testimonials:redact failed: ${err.message}`);
    process.exit(1);
  }
}
