import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildWorkImages } from "./build-work-images.mjs";

let tmp;
let sourceRoot;
let outRoot;
let jsonPath;

// 400x200 PNG: top-left red, top-right green, bottom-left blue, bottom-right yellow.
async function quadrantPng(file, w = 400, h = 200) {
  const halfW = w / 2;
  const halfH = h / 2;
  const tile = (r, g, b) => ({ create: { width: halfW, height: halfH, channels: 3, background: { r, g, b } } });
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: "#000" } })
    .composite([
      { input: await sharp(tile(255, 0, 0)).png().toBuffer(), left: 0, top: 0 },
      { input: await sharp(tile(0, 255, 0)).png().toBuffer(), left: halfW, top: 0 },
      { input: await sharp(tile(0, 0, 255)).png().toBuffer(), left: 0, top: halfH },
      { input: await sharp(tile(255, 255, 0)).png().toBuffer(), left: halfW, top: halfH },
    ])
    .png()
    .toBuffer();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

async function flatPng(file, w, h, background = "#336699") {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background } }).png().toBuffer();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

const run = (manifest) => buildWorkImages({ manifest, sourceRoot, outRoot, jsonPath });

async function pixel(file, x, y) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}

function near(actual, expected, tol = 12) {
  actual.forEach((v, i) => expect(Math.abs(v - expected[i])).toBeLessThanOrEqual(tol));
}

beforeEach(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "work-images-"));
  sourceRoot = path.join(tmp, "src");
  outRoot = path.join(tmp, "out");
  jsonPath = path.join(tmp, "content", "work-images.json");
  await quadrantPng(path.join(sourceRoot, "demo", "quad.png"));
});

afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("thumb", () => {
  it("crops a quadrant to a 568x284 WebP whose corners match it", async () => {
    // Top-right quadrant (green): left 200, top 0, 200x100 is exactly 2:1.
    await run({
      demo: [{ source: "demo/quad.png", kind: "thumb", rect: { left: 200, top: 0, width: 200, height: 100 } }],
    });
    const file = path.join(outRoot, "demo", "thumb.webp");
    const meta = await sharp(file).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(["webp", 568, 284]);
    for (const [x, y] of [[0, 0], [567, 0], [0, 283], [567, 283]]) near(await pixel(file, x, y), [0, 255, 0]);
  });

  it("records tone from mean luminance so the card picks the matching tint", async () => {
    await flatPng(path.join(sourceRoot, "light", "light.png"), 400, 200, "#f4f5f7");
    await flatPng(path.join(sourceRoot, "dark", "dark.png"), 400, 200, "#202124");
    const rect = { left: 0, top: 0, width: 400, height: 200 };
    const { dims } = await run({
      light: [{ source: "light/light.png", kind: "thumb", rect }],
      dark: [{ source: "dark/dark.png", kind: "thumb", rect }],
    });
    expect(dims["/work/light/thumb.webp"].tone).toBe("light");
    expect(dims["/work/dark/thumb.webp"].tone).toBe("dark");
  });

  it("writes a retina thumb-2x at the crop width, capped at 1136x568", async () => {
    await flatPng(path.join(sourceRoot, "demo", "mid.png"), 800, 400);
    await flatPng(path.join(sourceRoot, "big", "big.png"), 2000, 1000);
    const { dims } = await run({
      demo: [{ source: "demo/mid.png", kind: "thumb", rect: { left: 0, top: 0, width: 792, height: 396 } }],
      big: [{ source: "big/big.png", kind: "thumb", rect: { left: 0, top: 0, width: 2000, height: 1000 } }],
    });
    expect(dims["/work/demo/thumb-2x.webp"]).toEqual({ width: 792, height: 396 });
    expect(dims["/work/big/thumb-2x.webp"]).toEqual({ width: 1136, height: 568 });
    expect(dims["/work/big/thumb.webp"]).toMatchObject({ width: 568, height: 284 });
  });

  it("skips thumb-2x when the crop is not wider than 568px", async () => {
    await run({
      demo: [{ source: "demo/quad.png", kind: "thumb", rect: { left: 0, top: 0, width: 400, height: 200 } }],
    });
    expect(fs.readdirSync(path.join(outRoot, "demo"))).toEqual(["thumb.webp"]);
  });

  it("strips metadata", async () => {
    await run({
      demo: [{ source: "demo/quad.png", kind: "thumb", rect: { left: 0, top: 0, width: 200, height: 100 } }],
    });
    const meta = await sharp(path.join(outRoot, "demo", "thumb.webp")).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.icc).toBeUndefined();
  });
});

describe("validation errors name the slug and output", () => {
  it("rejects an out-of-bounds crop", async () => {
    await expect(
      run({ demo: [{ source: "demo/quad.png", kind: "thumb", rect: { left: 300, top: 0, width: 200, height: 100 } }] }),
    ).rejects.toThrow(/demo\/thumb.*out of bounds/);
  });

  it("rejects a missing source", async () => {
    await expect(
      run({ demo: [{ source: "demo/nope.png", kind: "detail", name: "shot" }] }),
    ).rejects.toThrow(/demo\/shot.*missing source/);
  });

  it("rejects a thumb rect that is not 2:1", async () => {
    await expect(
      run({ demo: [{ source: "demo/quad.png", kind: "thumb", rect: { left: 0, top: 0, width: 200, height: 120 } }] }),
    ).rejects.toThrow(/demo\/thumb.*not 2:1/);
  });

  it("accepts a rect within the 1px tolerance", async () => {
    await expect(
      run({ demo: [{ source: "demo/quad.png", kind: "thumb", rect: { left: 0, top: 0, width: 200, height: 101 } }] }),
    ).resolves.toBeDefined();
  });

  it("rejects a source path escaping the source root", async () => {
    await expect(
      run({ demo: [{ source: "../outside.png", kind: "detail", name: "shot" }] }),
    ).rejects.toThrow(/demo\/shot/);
  });
});

describe("detail and work-images.json", () => {
  it("downscales wide images, keeps narrow ones, and records real sizes", async () => {
    await flatPng(path.join(sourceRoot, "demo", "wide.png"), 2000, 1000);
    await flatPng(path.join(sourceRoot, "demo", "narrow.png"), 800, 300);
    const { dims } = await run({
      demo: [
        { source: "demo/wide.png", kind: "detail", name: "wide" },
        { source: "demo/narrow.png", kind: "detail", name: "narrow" },
        { source: "demo/quad.png", kind: "thumb", rect: { left: 0, top: 0, width: 200, height: 100 } },
      ],
    });
    expect(dims["/work/demo/wide.webp"]).toEqual({ width: 1600, height: 800 });
    expect(dims["/work/demo/narrow.webp"]).toEqual({ width: 800, height: 300 });

    const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    expect(Object.keys(json)).toHaveLength(3);
    for (const [published, size] of Object.entries(json)) {
      const meta = await sharp(path.join(outRoot, published.replace(/^\/work\//, ""))).metadata();
      expect(size).toMatchObject({ width: meta.width, height: meta.height });
    }
  });

  it("removes files in the output root that were not produced", async () => {
    fs.mkdirSync(path.join(outRoot, "demo"), { recursive: true });
    fs.writeFileSync(path.join(outRoot, "demo", "stale.webp"), "x");
    await run({ demo: [{ source: "demo/quad.png", kind: "detail", name: "quad" }] });
    expect(fs.readdirSync(path.join(outRoot, "demo"))).toEqual(["quad.webp"]);
  });
});

describe("determinism", () => {
  it("gives byte-identical outputs and json on consecutive runs", async () => {
    const manifest = {
      demo: [
        { source: "demo/quad.png", kind: "thumb", rect: { left: 0, top: 0, width: 200, height: 100 } },
        { source: "demo/quad.png", kind: "detail", name: "quad" },
      ],
    };
    const snapshot = () => ({
      thumb: fs.readFileSync(path.join(outRoot, "demo", "thumb.webp")),
      detail: fs.readFileSync(path.join(outRoot, "demo", "quad.webp")),
      json: fs.readFileSync(jsonPath),
    });
    await run(manifest);
    const first = snapshot();
    await run(manifest);
    const second = snapshot();
    expect(second.thumb.equals(first.thumb)).toBe(true);
    expect(second.detail.equals(first.detail)).toBe(true);
    expect(second.json.equals(first.json)).toBe(true);
  });
});
