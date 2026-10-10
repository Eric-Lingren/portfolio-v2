import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { checkContent, REQUIRED_FRONTMATTER, REQUIRED_SECTIONS } from "../../../scripts/check-content.mjs";
import { generateStaticParams } from "./[slug]/page";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "content/work/kpi-granularity.mdx");
const raw = fs.readFileSync(FILE, "utf8");
const { data, content } = matter(raw);

describe("kpi-granularity case study", () => {
  it("has complete, valid frontmatter", () => {
    for (const key of REQUIRED_FRONTMATTER as string[]) expect(data).toHaveProperty(key);
    expect(data.slug).toBe("kpi-granularity");
    expect(data.order).toBe(1);
    expect(Array.isArray(data.stack)).toBe(true);
    expect(data.outcomes.length).toBeGreaterThan(0);
    expect(data.thumbnail).toMatch(/^\/work\/kpi-granularity\//);
    expect(data.cardNumber === null || typeof data.cardNumber === "string").toBe(true);
  });

  it("body is 600 to 900 words", () => {
    const words = content.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(600);
    expect(words).toBeLessThanOrEqual(900);
  });

  it("has all six sections", () => {
    for (const s of REQUIRED_SECTIONS as string[]) {
      expect(content).toMatch(new RegExp(`^##\\s+${s.replace(/'/g, "['’]")}\\s*$`, "m"));
    }
  });

  it("gives every image alt text", () => {
    const md = [...content.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)];
    for (const m of md) expect(m[1].trim().length).toBeGreaterThan(0);
    const html = [...content.matchAll(/<img\b[^>]*>/gi)];
    for (const m of html) expect(m[0]).toMatch(/\balt=("[^"]+"|'[^']+'|\{[^}]+\})/);
  });

  it("passes content-check with no forbidden patterns", () => {
    const { findings, exitCode } = checkContent({ root: ROOT });
    expect(exitCode).toBe(0);
    const mine = (findings as { file: string; rule: string }[]).filter(
      (f) => f.file === "content/work/kpi-granularity.mdx" && f.rule !== "eric-marker",
    );
    expect(mine).toEqual([]);
  });

  it("is emitted as a static route", () => {
    expect(generateStaticParams().some((p) => p.slug === "kpi-granularity")).toBe(true);
  });
});
