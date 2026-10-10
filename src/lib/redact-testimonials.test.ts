// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { beforeEach, describe, expect, it } from "vitest";
// @ts-expect-error untyped .mjs script
import { BLOCK_COLOR, looksLikePersonalName, redactTestimonials } from "../../scripts/redact-testimonials.mjs";

const W = 40;
const H = 30;
const SRC = { r: 200, g: 100, b: 50 };
const RECTS = [
  { x: 2, y: 3, width: 10, height: 5 },
  { x: 20, y: 15, width: 15, height: 10 },
];

async function px(file: string) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  return (x: number, y: number) => {
    const i = (y * info.width + x) * info.channels;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  };
}

let dirs: { inputDir: string; outputDir: string; manifestPath: string };

async function makeImage(name: string) {
  await sharp({ create: { width: W, height: H, channels: 3, background: SRC } })
    .png()
    .toFile(path.join(dirs.inputDir, name));
}

async function writeRegions(cfg: unknown) {
  await writeFile(path.join(dirs.inputDir, "regions.json"), JSON.stringify(cfg));
}

beforeEach(async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "redact-"));
  dirs = {
    inputDir: path.join(tmp, "raw"),
    outputDir: path.join(tmp, "public/testimonials"),
    manifestPath: path.join(tmp, "src/content/testimonials.json"),
  };
  await mkdir(dirs.inputDir, { recursive: true });
});

describe("redactTestimonials", () => {
  it("fills regions with the solid block color and leaves other pixels unchanged", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: RECTS, roleLabel: "Senior Engineer", alt: "Praise" } });
    await redactTestimonials(dirs);
    const at = await px(path.join(dirs.outputDir, "a.png"));
    for (const r of RECTS) {
      for (const [x, y] of [
        [r.x, r.y],
        [r.x + r.width - 1, r.y + r.height - 1],
        [r.x + 3, r.y + 2],
      ]) {
        expect(at(x, y)).toEqual(BLOCK_COLOR);
      }
    }
    expect(at(0, 0)).toEqual(SRC);
    expect(at(W - 1, H - 1)).toEqual(SRC);
    expect(at(12, 3)).toEqual(SRC);
    expect(at(19, 15)).toEqual(SRC);
  });

  it("uses identical block color across images", async () => {
    await makeImage("a.png");
    await makeImage("b.png");
    const cfg = { regions: [RECTS[0]], roleLabel: "Engineering Manager", alt: "x" };
    await writeRegions({ "a.png": cfg, "b.png": cfg });
    await redactTestimonials(dirs);
    const a = await px(path.join(dirs.outputDir, "a.png"));
    const b = await px(path.join(dirs.outputDir, "b.png"));
    expect(a(4, 4)).toEqual(b(4, 4));
  });

  it("writes a manifest with id, image, roleLabel, alt only and no names", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: RECTS, roleLabel: "Senior Engineer", alt: "Praise" } });
    await redactTestimonials(dirs);
    const manifest = JSON.parse(await readFile(dirs.manifestPath, "utf8"));
    expect(manifest).toEqual([
      { id: "a", image: "/testimonials/a.png", roleLabel: "Senior Engineer", alt: "Praise" },
    ]);
  });

  it("errors when an image has no regions", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: [], roleLabel: "Senior Engineer", alt: "x" } });
    await expect(redactTestimonials(dirs)).rejects.toThrow(/no redaction regions/);
  });

  it("errors when an image is absent from regions.json", async () => {
    await makeImage("a.png");
    await writeRegions({});
    await expect(redactTestimonials(dirs)).rejects.toThrow(/no entry in regions.json/);
  });

  it("errors when roleLabel looks like a personal name", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: RECTS, roleLabel: "Jane Doe", alt: "x" } });
    await expect(redactTestimonials(dirs)).rejects.toThrow(/personal name/);
  });

  it("never copies raw files into the public output", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: RECTS, roleLabel: "Senior Engineer", alt: "x" } });
    await redactTestimonials(dirs);
    expect(await readdir(dirs.outputDir)).toEqual(["a.png"]);
    const raw = await readFile(path.join(dirs.inputDir, "a.png"));
    const out = await readFile(path.join(dirs.outputDir, "a.png"));
    expect(out.equals(raw)).toBe(false);
  });
});

describe("looksLikePersonalName", () => {
  it("flags names and blocklisted terms, allows roles", () => {
    expect(looksLikePersonalName("Jane Doe")).toBe(true);
    expect(looksLikePersonalName("Role Label", ["label"])).toBe(true);
    expect(looksLikePersonalName("Staff Engineer")).toBe(false);
    expect(looksLikePersonalName("Former manager")).toBe(false);
  });
});

describe("docs/private", () => {
  it("is ignored by version control", () => {
    expect(() =>
      execFileSync("git", ["check-ignore", "-q", "docs/private/testimonials/x.png"]),
    ).not.toThrow();
  });
});
