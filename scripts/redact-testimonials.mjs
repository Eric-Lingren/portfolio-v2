#!/usr/bin/env node
// Flattens raw testimonial screenshots into uniform, publishable PNGs.
// Raw inputs live in docs/private/testimonials/ (ignored by version control, never committed).
// Optional regions.json there maps filename -> { regions: [{x,y,width,height}] }.
// Files with no entry (or empty regions) are only flattened: one PNG, no alpha, no metadata.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const BLOCK_COLOR = { r: 24, g: 24, b: 27 };
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

function validateRegions(file, regions) {
  if (!Array.isArray(regions)) {
    throw new Error(`${file}: regions must be an array`);
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

export async function redactTestimonials({ inputDir, outputDir }) {
  const regionsPath = path.join(inputDir, "regions.json");
  const config = existsSync(regionsPath) ? JSON.parse(await readFile(regionsPath, "utf8")) : {};
  const files = (await readdir(inputDir)).filter((f) => IMAGE_EXT.test(f)).sort();
  if (files.length === 0) throw new Error(`no images found in ${inputDir}`);

  const outputs = [];
  for (const file of files) {
    const regions = config[file]?.regions ?? [];
    validateRegions(file, regions);
    const id = path.basename(file, path.extname(file));
    const out = await redactImage(await readFile(path.join(inputDir, file)), regions);
    outputs.push({ id, out });
  }

  await mkdir(outputDir, { recursive: true });
  for (const e of outputs) await writeFile(path.join(outputDir, `${e.id}.png`), e.out);
  return outputs.map(({ id }) => id);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  try {
    const ids = await redactTestimonials({
      inputDir: path.join(root, "docs/private/testimonials"),
      outputDir: path.join(root, "public/testimonials"),
    });
    console.log(`redacted ${ids.length} testimonial(s)`);
  } catch (err) {
    console.error(`testimonials:redact failed: ${err.message}`);
    process.exit(1);
  }
}
