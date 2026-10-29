import fs from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CaseStudyView } from "@/components/CaseStudyView";
import { compileBody, getStudies, getStudy } from "@/lib/work";
import { generateStaticParams } from "./[slug]/page";

const SECTIONS = ["Context", "Problem", "My role", "Key decisions", "Impact", "What I'd do next"];

describe("work route", () => {
  it("renders the fixture with summary box and all six sections", async () => {
    const study = getStudy("fixture-study", { includeFixtures: true });
    expect(study).toBeDefined();
    render(<CaseStudyView study={study!}>{await compileBody(study!.content)}</CaseStudyView>);

    const summary = screen.getByRole("complementary", { name: "Summary" });
    for (const label of ["Role", "Timeline", "Stack", "Outcomes"]) {
      expect(within(summary).getByText(label)).toBeInTheDocument();
    }
    expect(within(summary).getByText("Fixture outcome one")).toBeInTheDocument();
    expect(within(summary).getByText("TypeScript, Next.js, MDX")).toBeInTheDocument();

    for (const s of SECTIONS) {
      expect(screen.getByRole("heading", { level: 2, name: s })).toBeInTheDocument();
    }
  });

  it("links back to the Selected Work panel", async () => {
    const study = getStudy("fixture-study", { includeFixtures: true });
    render(<CaseStudyView study={study!}>{await compileBody(study!.content)}</CaseStudyView>);
    expect(screen.getByRole("link", { name: "Back to selected work" })).toHaveAttribute("href", "/#work");
  });

  it("excludes fixtures from production studies and static params", () => {
    expect(getStudies().some((s) => s.fixture)).toBe(false);
    expect(getStudy("fixture-study")).toBeUndefined();
    expect(generateStaticParams().some((p) => p.slug === "fixture-study")).toBe(false);
  });

  it("emits a placeholder param when there are no production studies", () => {
    if (getStudies().length === 0) {
      expect(generateStaticParams()).toEqual([{ slug: "_none" }]);
    }
  });
});

describe("case study typography", () => {
  const css = fs.readFileSync(path.join(__dirname, "case-study.css"), "utf8");
  const rule = (sel: string) => css.match(new RegExp(`${sel.replace(/[.]/g, "\\.")}\\s*{([^}]*)}`))?.[1] ?? "";

  it("uses 18px / 1.68 body in a 720px column", () => {
    expect(rule(".case-study__body")).toMatch(/font-size:\s*18px/);
    expect(rule(".case-study__body")).toMatch(/line-height:\s*1\.68/);
    expect(rule(".case-study__column")).toMatch(/max-width:\s*720px/);
  });

  it("styles pull quote, meta strip, and links per tokens", () => {
    expect(rule(".case-study__body blockquote")).toMatch(/border-left:\s*3px solid var\(--accent\)/);
    expect(rule(".case-study__body blockquote")).toMatch(/background:\s*var\(--po-surface\)/);
    expect(rule(".case-study__summary")).toMatch(/background:\s*var\(--po-surface\)/);
    expect(rule(".case-study__body a")).toMatch(/var\(--accent-2\)/);
  });
});
