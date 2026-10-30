import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResumeDocument } from "@/components/ResumeDocument";
import alpha from "./__fixtures__/resume.variants/fixture-alpha";
import { RESUME } from "./resume";
import { VARIANTS_DIR, applyVariant, listVariants, type ResumeVariant } from "./resume-variants";

const FIXTURES = resolve(process.cwd(), "src/content/__fixtures__/resume.variants");

describe("applyVariant", () => {
  it("replaces only the summary last line and reorders skills", () => {
    const before = structuredClone(RESUME);
    const out = applyVariant(RESUME, alpha);
    expect(RESUME).toEqual(before);
    expect(out.summary.endsWith("FIXTURE-ALPHA-LAST-LINE.")).toBe(true);
    expect(out.summary).toContain("Frontend-first full-stack engineer with 7 years");
    expect(out.summary).not.toContain("I also build multi-agent AI tooling");
    expect(out.skills.map((g) => g.label)).toEqual(["AI", "Frontend", "Backend", "Testing and tooling"]);
    expect(out.skills[0].items[0]).toBe("MCP");
    expect({ ...out, summary: "", skills: [] }).toEqual({ ...RESUME, summary: "", skills: [] });
    const flat = (r: typeof RESUME) => r.skills.flatMap((g) => g.items).sort();
    expect(flat(out)).toEqual(flat(RESUME));
  });

  it("rejects an added skill, naming it", () => {
    const bad: ResumeVariant = {
      ...alpha,
      skills: alpha.skills.map((g) => (g.label === "AI" ? { ...g, items: [...g.items, "Rust"] } : g)),
    };
    expect(() => applyVariant(RESUME, bad)).toThrow(/Rust/);
  });

  it("rejects a removed skill, naming it", () => {
    const bad: ResumeVariant = {
      ...alpha,
      skills: alpha.skills.map((g) => (g.label === "AI" ? { ...g, items: g.items.filter((i) => i !== "MCP") } : g)),
    };
    expect(() => applyVariant(RESUME, bad)).toThrow(/MCP/);
  });

  it("rejects a removed group", () => {
    expect(() => applyVariant(RESUME, { ...alpha, skills: alpha.skills.slice(1) })).toThrow(/AI/);
  });
});

describe("listVariants", () => {
  it("returns fixture names and excludes index and helper files", () => {
    expect(listVariants(FIXTURES)).toEqual(["fixture-alpha", "fixture-beta"]);
  });

  it("returns an array for the real folder, even if it does not exist yet", () => {
    expect(Array.isArray(listVariants())).toBe(true);
    expect(VARIANTS_DIR.endsWith("resume.variants/")).toBe(true);
    expect(listVariants("/nonexistent/dir")).toEqual([]);
  });
});

describe("public /resume page isolation", () => {
  it("does not import resume.variants or resume-variants", () => {
    const page = readFileSync(resolve(process.cwd(), "src/app/resume/page.tsx"), "utf8");
    expect(page).not.toMatch(/resume[.-]variants/);
    const doc = readFileSync(resolve(process.cwd(), "src/components/ResumeDocument.tsx"), "utf8");
    expect(doc).not.toMatch(/resume[.-]variants/);
  });

  it("renders no fixture variant text", () => {
    const html = renderToStaticMarkup(createElement(ResumeDocument, { resume: RESUME }));
    expect(html).not.toContain("FIXTURE-");
  });
});
