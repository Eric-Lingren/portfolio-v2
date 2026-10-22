import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { checkContent, REQUIRED_FRONTMATTER, REQUIRED_SECTIONS } from "../../../scripts/check-content.mjs";

const ROOT = path.join(__dirname, "..", "..", "..");
const FILE = path.join(ROOT, "content", "work", "metrics-tab-v2.mdx");
const parsed = matter(fs.readFileSync(FILE, "utf8"));

function words(body: string) {
  return body.split(/\s+/).filter(Boolean).length;
}

describe("metrics-tab-v2 case study", () => {
  it("has complete frontmatter", () => {
    for (const key of REQUIRED_FRONTMATTER) expect(parsed.data).toHaveProperty(key);
    expect(parsed.data.slug).toBe("metrics-tab-v2");
    expect(parsed.data.order).toBe(3);
    expect(parsed.data.cardNumber).toBeNull();
    expect(parsed.data.thumbnail).toMatch(/^\/work\/metrics-tab-v2\//);
    expect(Array.isArray(parsed.data.stack)).toBe(true);
    expect(parsed.data.outcomes.length).toBeGreaterThan(0);
  });

  it("body is 600 to 900 words", () => {
    const n = words(parsed.content);
    expect(n).toBeGreaterThanOrEqual(600);
    expect(n).toBeLessThanOrEqual(900);
  });

  it("contains all six sections", () => {
    for (const s of REQUIRED_SECTIONS) {
      const re = new RegExp(`^##\\s+${s.replace(/'/g, "['’]")}\\s*$`, "m");
      expect(parsed.content).toMatch(re);
    }
  });

  it("gives every image alt text", () => {
    const md = [...parsed.content.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)];
    for (const m of md) expect(m[1].trim()).not.toBe("");
    const html = [...parsed.content.matchAll(/<img\b[^>]*>/gi)];
    for (const m of html) expect(m[0]).toMatch(/\balt\s*=\s*"[^"]+"/);
  });

  it("passes content-check with no findings besides ERIC markers", () => {
    const { findings, exitCode } = checkContent({ root: ROOT });
    const mine = findings.filter((f: { file: string }) => f.file === "content/work/metrics-tab-v2.mdx");
    expect(exitCode).toBe(0);
    expect(mine.filter((f: { rule: string }) => f.rule !== "eric-marker")).toEqual([]);
  });

  it("is emitted by static export", () => {
    const out = path.join(ROOT, "out", "work", "metrics-tab-v2.html");
    if (!fs.existsSync(path.join(ROOT, "out"))) return; // checked after `next build`
    expect(fs.existsSync(out)).toBe(true);
  });
});
