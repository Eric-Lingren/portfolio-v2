// @vitest-environment node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { beforeEach, describe, expect, it } from "vitest";
// @ts-expect-error untyped .mjs script
import { BLOCK_COLOR, redactTestimonials } from "../../scripts/redact-testimonials.mjs";

const W = 40;
const H = 30;
const SRC = { r: 200, g: 100, b: 50 };
const RECTS = [
  { x: 2, y: 3, width: 10, height: 5 },
  { x: 20, y: 15, width: 15, height: 10 },
];
const SCRIPT = path.resolve(__dirname, "../../scripts/redact-testimonials.mjs");

async function px(file: string) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  return (x: number, y: number) => {
    const i = (y * info.width + x) * info.channels;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  };
}

let tmp: string;
let dirs: { inputDir: string; outputDir: string };

async function makeImage(name: string) {
  await sharp({ create: { width: W, height: H, channels: 3, background: SRC } })
    .png()
    .toFile(path.join(dirs.inputDir, name));
}

// Non-uniform pixels so "unchanged" is a meaningful check.
function gradientRaw(channels: 3 | 4) {
  const data = Buffer.alloc(W * H * channels);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * channels;
      data[i] = (x * 6) % 256;
      data[i + 1] = (y * 8) % 256;
      data[i + 2] = (x * y) % 256;
      if (channels === 4) data[i + 3] = 255;
    }
  }
  return data;
}

async function makeGradient(name: string, channels: 3 | 4 = 3) {
  await sharp(gradientRaw(channels), { raw: { width: W, height: H, channels } })
    .png()
    .toFile(path.join(dirs.inputDir, name));
}

async function rawPixels(file: string) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function writeRegions(cfg: unknown) {
  await writeFile(path.join(dirs.inputDir, "regions.json"), JSON.stringify(cfg));
}

beforeEach(async () => {
  tmp = await mkdtemp(path.join(os.tmpdir(), "redact-"));
  dirs = {
    inputDir: path.join(tmp, "raw"),
    outputDir: path.join(tmp, "public/testimonials"),
  };
  await mkdir(dirs.inputDir, { recursive: true });
});

describe("redactTestimonials", () => {
  it("fills regions with the solid block color and leaves other pixels unchanged", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: RECTS } });
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
    const cfg = { regions: [RECTS[0]] };
    await writeRegions({ "a.png": cfg, "b.png": cfg });
    await redactTestimonials(dirs);
    const a = await px(path.join(dirs.outputDir, "a.png"));
    const b = await px(path.join(dirs.outputDir, "b.png"));
    expect(a(4, 4)).toEqual(b(4, 4));
  });

  it("flattens an image with no regions.json entry, keeping size and pixels", async () => {
    await makeGradient("a.png");
    await writeRegions({});
    await redactTestimonials(dirs);
    const input = await rawPixels(path.join(dirs.inputDir, "a.png"));
    const out = await rawPixels(path.join(dirs.outputDir, "a.png"));
    expect([out.width, out.height]).toEqual([W, H]);
    expect(out.data.equals(input.data)).toBe(true);
  });

  it("works without any regions.json file", async () => {
    await makeGradient("a.png");
    await redactTestimonials(dirs);
    const out = await rawPixels(path.join(dirs.outputDir, "a.png"));
    expect([out.width, out.height]).toEqual([W, H]);
  });

  it("flattens an image with `regions: []`, keeping size and pixels", async () => {
    await makeGradient("a.png");
    await writeRegions({ "a.png": { regions: [] } });
    await redactTestimonials(dirs);
    const input = await rawPixels(path.join(dirs.inputDir, "a.png"));
    const out = await rawPixels(path.join(dirs.outputDir, "a.png"));
    expect([out.width, out.height]).toEqual([W, H]);
    expect(out.data.equals(input.data)).toBe(true);
    expect((await sharp(path.join(dirs.outputDir, "a.png")).metadata()).format).toBe("png");
  });

  it("converts jpeg and webp inputs to PNG named by basename", async () => {
    await sharp(gradientRaw(3), { raw: { width: W, height: H, channels: 3 } })
      .jpeg()
      .toFile(path.join(dirs.inputDir, "j.jpeg"));
    await sharp(gradientRaw(3), { raw: { width: W, height: H, channels: 3 } })
      .webp({ lossless: true })
      .toFile(path.join(dirs.inputDir, "w.webp"));
    await redactTestimonials(dirs);
    expect(await readdir(dirs.outputDir)).toEqual(["j.png", "w.png"]);
  });

  it("strips EXIF metadata and removes alpha", async () => {
    await sharp(gradientRaw(4), { raw: { width: W, height: H, channels: 4 } })
      .withExif({ IFD0: { Copyright: "secret-owner" } })
      .png()
      .toFile(path.join(dirs.inputDir, "a.png"));
    const before = await sharp(path.join(dirs.inputDir, "a.png")).metadata();
    expect(before.exif).toBeDefined();
    expect(before.hasAlpha).toBe(true);

    await redactTestimonials(dirs);

    const outPath = path.join(dirs.outputDir, "a.png");
    const meta = await sharp(outPath).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.hasAlpha).toBe(false);
    expect(meta.channels).toBe(3);
    expect((await readFile(outPath)).includes("secret-owner")).toBe(false);
  });

  it("writes no manifest and ignores roleLabel and alt in regions.json", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: RECTS, roleLabel: "Jane Doe", alt: "" } });
    const result = await redactTestimonials({
      ...dirs,
      manifestPath: path.join(tmp, "src/content/testimonials.json"),
    });
    expect(existsSync(path.join(tmp, "src"))).toBe(false);
    expect(await readdir(tmp)).toEqual(expect.arrayContaining(["raw", "public"]));
    expect((await readdir(tmp)).sort()).toEqual(["public", "raw"]);
    expect(result).toEqual(["a"]);
    expect(await readdir(dirs.outputDir)).toEqual(["a.png"]);
  });

  it("errors when a region is invalid", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: [{ x: -1, y: 0, width: 2, height: 2 }] } });
    await expect(redactTestimonials(dirs)).rejects.toThrow(/invalid region/);
  });

  it("ignores non-image files in the input dir", async () => {
    await makeImage("a.png");
    await writeFile(path.join(dirs.inputDir, "doc.pdf"), "%PDF-1.4");
    await writeFile(path.join(dirs.inputDir, "name-blocklist.txt"), "someone\n");
    await redactTestimonials(dirs);
    expect(await readdir(dirs.outputDir)).toEqual(["a.png"]);
  });

  it("errors when the input dir has no images", async () => {
    await writeFile(path.join(dirs.inputDir, "doc.pdf"), "%PDF-1.4");
    await expect(redactTestimonials(dirs)).rejects.toThrow(/no images found/);
  });

  it("never copies raw files into the public output", async () => {
    await makeImage("a.png");
    await writeRegions({ "a.png": { regions: RECTS } });
    await redactTestimonials(dirs);
    expect(await readdir(dirs.outputDir)).toEqual(["a.png"]);
    const raw = await readFile(path.join(dirs.inputDir, "a.png"));
    const out = await readFile(path.join(dirs.outputDir, "a.png"));
    expect(out.equals(raw)).toBe(false);
  });
});

describe("redact-testimonials CLI", () => {
  function run(cwd: string) {
    return spawnSync("node", [SCRIPT], { cwd, encoding: "utf8" });
  }

  it("prints the redacted count and exits 0 on success", async () => {
    const root = path.join(tmp, "proj");
    const input = path.join(root, "docs/private/testimonials");
    await mkdir(input, { recursive: true });
    await sharp({ create: { width: W, height: H, channels: 3, background: SRC } })
      .png()
      .toFile(path.join(input, "a.png"));
    const res = run(root);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("redacted 1 testimonial(s)");
    expect(existsSync(path.join(root, "public/testimonials/a.png"))).toBe(true);
    expect(existsSync(path.join(root, "src/content/testimonials.json"))).toBe(false);
  });

  it("exits 1 with a clear message on failure", async () => {
    const root = path.join(tmp, "proj");
    await mkdir(path.join(root, "docs/private/testimonials"), { recursive: true });
    const res = run(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("testimonials:redact failed: no images found");
  });
});

describe("docs/private", () => {
  it("is ignored by version control", () => {
    expect(() =>
      execFileSync("git", ["check-ignore", "-q", "docs/private/testimonials/x.png"]),
    ).not.toThrow();
  });
});
