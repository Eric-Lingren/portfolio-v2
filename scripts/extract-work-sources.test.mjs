import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractImages,
  extractWorkSources,
  fetchLighthouse,
  IMAGE_MAPPING,
  LIGHTHOUSE_REPORTS,
  parseImages,
} from "./extract-work-sources.mjs";

// Tiny distinct byte payloads standing in for JPEGs (the script never decodes pixels).
const BYTES = {
  one: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x01, 0x02, 0x03]),
  two: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x04, 0x05, 0x06, 0x07]),
  three: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x08, 0x09]),
  other: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x0a]),
};

const img = (bytes, alt) =>
  `<img src="data:image/jpeg;base64,${bytes.toString("base64")}" alt="${alt}" loading="lazy">`;

const FIXTURE_HTML = `<html><body>
  <figure>${img(BYTES.one, "First alpha shot")}</figure>
  <figure>${img(BYTES.other, "Section not on the panel")}</figure>
  <figure>${img(BYTES.two, "Second beta shot")}</figure>
  <figure>${img(BYTES.three, "Third gamma shot")}</figure>
</body></html>`;

const MAPPING = [
  { alt: /alpha/, slug: "slug-a", name: "first" },
  { alt: /beta/, slug: "slug-a", name: "second" },
  { alt: /gamma/, slug: "slug-b", name: "third" },
];

let tmp;
let workRoot;
let htmlPath;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "work-sources-"));
  workRoot = path.join(tmp, "docs/private/work");
  htmlPath = path.join(tmp, "fixture.html");
  fs.writeFileSync(htmlPath, FIXTURE_HTML);
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const okResponse = (body) => ({
  status: 200,
  arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
});

describe("extractImages", () => {
  it("writes mapped images to slug paths with identical bytes and skips unmapped ones", async () => {
    const written = await extractImages({ htmlPath, workRoot, mapping: MAPPING });

    expect(written.map((f) => path.relative(workRoot, f)).sort()).toEqual([
      "slug-a/first.jpg",
      "slug-a/second.jpg",
      "slug-b/third.jpg",
    ]);
    expect(fs.readFileSync(path.join(workRoot, "slug-a/first.jpg")).equals(BYTES.one)).toBe(true);
    expect(fs.readFileSync(path.join(workRoot, "slug-a/second.jpg")).equals(BYTES.two)).toBe(true);
    expect(fs.readFileSync(path.join(workRoot, "slug-b/third.jpg")).equals(BYTES.three)).toBe(true);

    const all = fs.readdirSync(workRoot, { recursive: true, withFileTypes: true }).filter((e) => e.isFile());
    expect(all).toHaveLength(3);
  });

  it("is idempotent", async () => {
    await extractImages({ htmlPath, workRoot, mapping: MAPPING });
    await extractImages({ htmlPath, workRoot, mapping: MAPPING });
    expect(fs.readFileSync(path.join(workRoot, "slug-a/first.jpg")).equals(BYTES.one)).toBe(true);
  });

  it("fails when a mapping entry matches no image", async () => {
    const mapping = [{ alt: /does not exist/, slug: "slug-a", name: "missing" }];
    await expect(extractImages({ htmlPath, workRoot, mapping })).rejects.toThrow(/slug-a\/missing matched 0/);
  });

  it("does not depend on image order", () => {
    const html = `${img(BYTES.two, "Second beta shot")}${img(BYTES.one, "First alpha shot")}`;
    const parsed = parseImages(html);
    expect(parsed.map((p) => p.alt)).toEqual(["Second beta shot", "First alpha shot"]);
    expect(parsed[1].bytes.equals(BYTES.one)).toBe(true);
  });
});

describe("path safety", () => {
  it.each(["../escape", "..", "a/b", "/abs", "UPPER", ""])("rejects slug %j", async (slug) => {
    const mapping = [{ alt: /alpha/, slug, name: "first" }];
    await expect(extractImages({ htmlPath, workRoot, mapping })).rejects.toThrow(/invalid slug/);
    expect(fs.existsSync(workRoot)).toBe(false);
  });

  it("rejects a traversal file name", async () => {
    const mapping = [{ alt: /alpha/, slug: "slug-a", name: "../../evil" }];
    await expect(extractImages({ htmlPath, workRoot, mapping })).rejects.toThrow(/invalid file name/);
  });

  it("writes every output under the work root, including the real mapping", async () => {
    const written = await extractImages({ htmlPath, workRoot, mapping: MAPPING });
    for (const f of written) expect(path.resolve(f).startsWith(path.resolve(workRoot) + path.sep)).toBe(true);

    for (const entry of IMAGE_MAPPING) {
      expect(entry.slug).toMatch(/^[a-z0-9-]+$/);
      expect(entry.name).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("fetchLighthouse", () => {
  it("writes the 3 reports to render-performance using the injected fetch", async () => {
    const payloads = new Map(LIGHTHOUSE_REPORTS.map((r, i) => [r.url, Buffer.from([0x89, 0x50, i])]));
    const fetchFn = vi.fn(async (url) => okResponse(payloads.get(url)));

    const written = await fetchLighthouse({ workRoot, fetchFn });

    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(written.map((f) => path.relative(workRoot, f))).toEqual([
      "render-performance/lighthouse-2021-10-28.png",
      "render-performance/lighthouse-2021-10-29.png",
      "render-performance/lighthouse-2021-11-01.png",
    ]);
    LIGHTHOUSE_REPORTS.forEach((r, i) => {
      expect(fs.readFileSync(written[i]).equals(payloads.get(r.url))).toBe(true);
    });
  });

  it("fails with a message naming the URL on a non-200 response, writing nothing", async () => {
    const bad = LIGHTHOUSE_REPORTS[1].url;
    const fetchFn = async (url) => (url === bad ? { status: 404, arrayBuffer: async () => new ArrayBuffer(0) } : okResponse(Buffer.from([1])));

    await expect(fetchLighthouse({ workRoot, fetchFn })).rejects.toThrow(bad);
    expect(fs.existsSync(path.join(workRoot, "render-performance"))).toBe(false);
  });
});

describe("extractWorkSources", () => {
  it("runs both phases with injected inputs and never touches the network", async () => {
    const fetchFn = vi.fn(async () => okResponse(Buffer.from([7, 7, 7])));
    const result = await extractWorkSources({ htmlPath, workRoot, fetchFn, mapping: MAPPING });
    expect(result.images).toHaveLength(3);
    expect(result.lighthouse).toHaveLength(3);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });
});
