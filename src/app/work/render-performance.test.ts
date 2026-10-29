import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { checkContent, REQUIRED_FRONTMATTER, REQUIRED_SECTIONS, wordMinFor } from "../../../scripts/check-content.mjs";

const ROOT = path.join(__dirname, "..", "..", "..");
const FILE = path.join(ROOT, "content", "work", "render-performance.mdx");
const parsed = matter(fs.readFileSync(FILE, "utf8"));

function words(body: string) {
  return body.split(/\s+/).filter(Boolean).length;
}

describe("render-performance case study", () => {
  it("has complete frontmatter", () => {
    for (const key of REQUIRED_FRONTMATTER) expect(parsed.data).toHaveProperty(key);
    expect(parsed.data.slug).toBe("render-performance");
    expect(parsed.data.order).toBe(5);
    expect(parsed.data.cardNumber).toBeNull();
    expect(parsed.data.thumbnail).toMatch(/^\/work\/render-performance\//);
    expect(Array.isArray(parsed.data.stack)).toBe(true);
    expect(parsed.data.outcomes.length).toBeGreaterThan(0);
  });

  it("body is 600 to 900 words", () => {
    const n = words(parsed.content);
    expect(n).toBeGreaterThanOrEqual(wordMinFor("render-performance"));
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

  it("does not use the unverified 300% claim as a headline or proof point", () => {
    const fm = JSON.stringify(parsed.data);
    expect(fm).not.toMatch(/300/);
    expect(parsed.content).toMatch(/\[ERIC: how was the 300% measured\?\]/);
  });

  it("passes content-check with no findings besides ERIC markers", () => {
    const { findings, exitCode } = checkContent({ root: ROOT });
    const mine = findings.filter((f: { file: string }) => f.file === "content/work/render-performance.mdx");
    expect(exitCode).toBe(0);
    expect(mine.filter((f: { rule: string }) => f.rule !== "eric-marker")).toEqual([]);
  });

  it("is emitted by static export", () => {
    const out = path.join(ROOT, "out", "work", "render-performance.html");
    if (!fs.existsSync(path.join(ROOT, "out"))) return; // checked after `next build`
    expect(fs.existsSync(out)).toBe(true);
  });
});
