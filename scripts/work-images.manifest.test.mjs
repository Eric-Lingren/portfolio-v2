import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildWorkImages } from "./build-work-images.mjs";
import { CARD_SLUGS } from "./generate-work-cards.mjs";

const manifest = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "work-images.manifest.json"), "utf8"));

describe("work-images manifest", () => {
  it("has a thumb entry for every card slug", () => {
    for (const slug of CARD_SLUGS) {
      const thumbs = (manifest[slug] ?? []).filter((e) => e.kind === "thumb");
      expect(thumbs, `${slug} needs a thumb entry in work-images.manifest.json`).toHaveLength(1);
    }
  });

  it("builds frontend-platform storybook-button-variants as its detail image", () => {
    const names = manifest["frontend-platform"].filter((e) => e.kind === "detail").map((e) => e.name);
    expect(names).toEqual(["storybook-button-variants"]);
  });
});

describe("frontend-platform source size guard", () => {
  let tmp;
  let sourceRoot;
  let outRoot;
  let jsonPath;
  const run = () =>
    buildWorkImages({ manifest: { "frontend-platform": manifest["frontend-platform"] }, sourceRoot, outRoot, jsonPath });

  async function writeSource(width, height) {
    const file = path.join(sourceRoot, "frontend-platform", "storybook-primitives.png");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, await sharp({ create: { width, height, channels: 3, background: "#888" } }).png().toBuffer());
  }

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "work-manifest-"));
    sourceRoot = path.join(tmp, "src");
    outRoot = path.join(tmp, "out");
    jsonPath = path.join(tmp, "content", "work-images.json");
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it("fails clearly when the source is missing", async () => {
    await expect(run()).rejects.toThrow(/frontend-platform\/thumb: missing source frontend-platform\/storybook-primitives\.png/);
  });

  it("fails clearly when the source is under 1136x568", async () => {
    await writeSource(1000, 500);
    await expect(run()).rejects.toThrow(/frontend-platform\/thumb: .*is 1000x500, under the required minimum 1136x568/);
  });
});
