import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  CANONICAL_URL,
  metadata,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  viewport,
} from "./metadata";

const root = join(__dirname, "..", "..");

describe("page metadata", () => {
  it("resolves og:image to an absolute canonical URL", () => {
    const base = metadata.metadataBase as URL;
    expect(base.href).toBe(`${CANONICAL_URL}/`);
    expect(new URL(OG_IMAGE_PATH, base).href).toBe("https://ericlingren.com/og.png");
  });

  it("sets og title, description, image and twitter card", () => {
    const og = metadata.openGraph!;
    expect(og.title).toBeTruthy();
    expect(og.description).toBeTruthy();
    const images = og.images as { url: string; width: number; height: number }[];
    expect(images[0]).toMatchObject({
      url: OG_IMAGE_PATH,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
    });
    const tw = metadata.twitter as { card: string; images: string[] };
    expect(tw.card).toBe("summary_large_image");
    expect(tw.images).toEqual([OG_IMAGE_PATH]);
  });

  it("uses no remote-hosted image URLs", () => {
    const urls = [
      ...(metadata.openGraph!.images as { url: string }[]).map((i) => i.url),
      ...(metadata.twitter as { images: string[] }).images,
    ];
    for (const u of urls) expect(u.startsWith("/")).toBe(true);
  });

  it("declares viewport and theme color", () => {
    expect(viewport.themeColor).toBe("#0c0a0e");
    expect(viewport.width).toBe("device-width");
  });
});

describe("og image", () => {
  it("source asset is 1200x630", async () => {
    const meta = await sharp(join(root, "public", "og.png")).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
  });

  it("is exported to out/ with the same size when a build exists", async () => {
    const built = join(root, "out", "og.png");
    if (!existsSync(built)) return;
    const meta = await sharp(built).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });

  it("favicon exists", () => {
    expect(existsSync(join(root, "src", "app", "icon.svg"))).toBe(true);
  });
});
