import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { compileBody, getStudy } from "@/lib/work";
import { wordMinFor } from "../../../scripts/check-content.mjs";
import { generateStaticParams } from "./[slug]/page";

const SLUG = "ai-toolkit";
const file = path.join(process.cwd(), "content/work", `${SLUG}.mdx`);
const SECTIONS = ["Context", "Problem", "My role", "Key decisions", "Impact", "What I'd do next"];
const FRONTMATTER = [
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

function read() {
  return matter(fs.readFileSync(file, "utf8"));
}

describe("ai-toolkit case study", () => {
  it("has full summary frontmatter and a thumbnail under /work/ai-toolkit/", () => {
    const { data } = read();
    for (const key of FRONTMATTER) expect(data).toHaveProperty(key);
    expect(data.slug).toBe(SLUG);
    expect(data.thumbnail).toMatch(/^\/work\/ai-toolkit\//);
  });

  it("has the six required sections", () => {
    const { content } = read();
    for (const s of SECTIONS) {
      expect(content).toMatch(new RegExp(`^##\\s+${s.replace(/'/g, "['’]")}\\s*$`, "m"));
    }
  });

  it("has a 'built by this pipeline' section", () => {
    expect(read().content).toMatch(/^##\s+Built by this pipeline\s*$/m);
  });

  it("is 600-900 words", () => {
    const words = read().content.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(wordMinFor(SLUG));
    expect(words).toBeLessThanOrEqual(900);
  });

  it("has no dollar figures and no raw work-profile counts", () => {
    const raw = fs.readFileSync(file, "utf8");
    expect(raw).not.toContain("$");
    expect(raw).not.toMatch(/\b\d[\d,]*\s*(?:PRs?|pull requests?|files?|lines?|LOC|commits?|tickets?|projects?)\b/i);
  });

  it("is registered as a production study and emitted as a route", () => {
    expect(getStudy(SLUG)).toBeDefined();
    expect(generateStaticParams().some((p) => p.slug === SLUG)).toBe(true);
  });

  it("compiles to MDX with the three model-tier badges", async () => {
    const study = getStudy(SLUG)!;
    const body = await compileBody(study.content);
    const html = JSON.stringify(body);
    for (const tier of ["Haiku", "Sonnet", "Opus"]) expect(html).toContain(tier);
  });
});
