import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { checkContent } from "../../../scripts/check-content.mjs";
import { generateStaticParams } from "./[slug]/page";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "content/work/frontend-platform.mdx");
const REL = "content/work/frontend-platform.mdx";
const SECTIONS = ["Context", "Problem", "My role", "Key decisions", "Impact", "What I'd do next"];
const KEYS = [
  "title",
  "slug",
  "role",
  "timeline",
  "stack",
  "outcomes",
  "cardOutcome",
  "cardNumber",
  "cardNumberLabel",
  "thumbnail",
  "order",
];

const parsed = matter(fs.readFileSync(FILE, "utf8"));

describe("frontend-platform case study", () => {
  it("has complete, well-typed frontmatter", () => {
    for (const k of KEYS) expect(parsed.data, k).toHaveProperty(k);
    expect(parsed.data.slug).toBe("frontend-platform");
    expect(parsed.data.order).toBe(3);
    expect(Array.isArray(parsed.data.stack)).toBe(true);
    expect(parsed.data.outcomes.length).toBeGreaterThan(0);
    expect(parsed.data.thumbnail).toMatch(/^\/work\/frontend-platform\//);
    expect(parsed.data.cardNumber === null || typeof parsed.data.cardNumber === "string").toBe(true);
  });

  it("has 600 to 900 words in the body", () => {
    const words = parsed.content.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(600);
    expect(words).toBeLessThanOrEqual(900);
  });

  it("has all six required sections", () => {
    for (const s of SECTIONS) {
      expect(parsed.content, s).toMatch(new RegExp(`^## ${s}\\s*$`, "m"));
    }
  });

  it("gives every image alt text", () => {
    const md = [...parsed.content.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)];
    for (const m of md) expect(m[1].trim().length, m[0]).toBeGreaterThan(0);
    const html = [...parsed.content.matchAll(/<img\b[^>]*>/g)];
    for (const m of html) expect(m[0], m[0]).toMatch(/\balt="[^"]+"/);
  });

  it("passes content-check with no non-marker findings", () => {
    const { findings } = checkContent({ root: ROOT, strict: false });
    const mine = findings.filter((f: { file: string; rule: string }) => f.file === REL && f.rule !== "eric-marker");
    expect(mine).toEqual([]);
  });

  it("is emitted by static export params", () => {
    expect(generateStaticParams().some((p) => p.slug === "frontend-platform")).toBe(true);
  });

  it("does not claim colleague test-speed gains", () => {
    expect(parsed.content).not.toMatch(/\d+%\s+faster/i);
  });
});
