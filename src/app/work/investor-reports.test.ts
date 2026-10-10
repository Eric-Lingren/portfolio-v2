// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { checkContent } from "../../../scripts/check-content.mjs";
import { getStudy } from "@/lib/work";
import { generateStaticParams } from "./[slug]/page";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "content/work/investor-reports.mdx");
const SLUG = "investor-reports";

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
const SECTIONS = ["Context", "Problem", "My role", "Key decisions", "Impact", "What I'd do next"];

const parsed = matter(fs.readFileSync(FILE, "utf8"));

describe("investor-reports case study", () => {
  it("has complete, valid frontmatter", () => {
    for (const key of KEYS) expect(parsed.data).toHaveProperty(key);
    expect(parsed.data.slug).toBe(SLUG);
    expect(parsed.data.order).toBe(2);
    expect(parsed.data.stack.length).toBeGreaterThan(0);
    expect(parsed.data.outcomes.length).toBeGreaterThan(0);
    expect(parsed.data.thumbnail).toMatch(/^\/work\/investor-reports\//);
    expect(getStudy(SLUG)?.title).toBe(parsed.data.title);
  });

  it("keeps PR/file/line counts out of frontmatter", () => {
    const fm = JSON.stringify(parsed.data);
    expect(fm).not.toMatch(/\b\d+\s*(PRs?|pull requests?|files?|lines?|commits?)\b/i);
  });

  it("body is 600 to 900 words", () => {
    const words = parsed.content.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(600);
    expect(words).toBeLessThanOrEqual(900);
  });

  it("has all six sections", () => {
    for (const s of SECTIONS) {
      const re = new RegExp(`^##\\s+${s.replace(/'/g, "['’]")}\\s*$`, "m");
      expect(parsed.content).toMatch(re);
    }
  });

  it("gives every image meaningful alt text", () => {
    const md = [...parsed.content.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)];
    const html = [...parsed.content.matchAll(/<img\b[^>]*>/gi)];
    for (const m of md) expect(m[1].trim().length).toBeGreaterThan(5);
    for (const m of html) expect(m[0]).toMatch(/\balt="[^"]{6,}"/);
  });

  it("passes content-check with no forbidden patterns", () => {
    const { findings } = checkContent({ root: ROOT });
    const mine = findings.filter(
      (f: { file: string; rule: string }) =>
        f.file === "content/work/investor-reports.mdx" && f.rule !== "eric-marker",
    );
    expect(mine).toEqual([]);
  });

  it("is emitted by static export params", () => {
    expect(generateStaticParams().some((p) => p.slug === SLUG)).toBe(true);
  });
});
