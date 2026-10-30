import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("opens off-site markdown links in a new tab", async () => {
    const study = getStudy("fixture-study", { includeFixtures: true });
    render(<CaseStudyView study={study!}>{await compileBody(study!.content)}</CaseStudyView>);
    const link = screen.getByRole("link", { name: "the repo" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  describe("back link", () => {
    const renderStudy = async () => {
      const study = getStudy("fixture-study", { includeFixtures: true });
      render(<CaseStudyView study={study!}>{await compileBody(study!.content)}</CaseStudyView>);
      return screen.getByRole("link", { name: "Back" });
    };
    const arriveFrom = (referrer: string, historyLength: number) => {
      vi.spyOn(document, "referrer", "get").mockReturnValue(referrer);
      vi.spyOn(window.history, "length", "get").mockReturnValue(historyLength);
    };
    const click = (link: HTMLElement, init: MouseEventInit = {}) =>
      fireEvent(link, new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init }));

    let back: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    });
    afterEach(() => vi.restoreAllMocks());

    it("falls back to the Selected Work panel", async () => {
      expect(await renderStudy()).toHaveAttribute("href", "/#work");
    });

    it("goes back in history when the reader came from this site, keeping mode and scroll", async () => {
      arriveFrom(`${window.location.origin}/?view=classic`, 3);
      const link = await renderStudy();
      click(link);
      expect(back).toHaveBeenCalledOnce();
    });

    it("follows the href on a direct visit, from another site, or in a fresh tab", async () => {
      const link = await renderStudy();
      for (const [referrer, length] of [
        ["", 3],
        ["https://www.linkedin.com/feed/", 3],
        [`${window.location.origin}/`, 1],
      ] as const) {
        arriveFrom(referrer, length);
        click(link);
      }
      expect(back).not.toHaveBeenCalled();
    });

    it("leaves modified clicks (open in new tab) to the browser", async () => {
      arriveFrom(`${window.location.origin}/`, 3);
      const link = await renderStudy();
      click(link, { metaKey: true });
      click(link, { ctrlKey: true });
      expect(back).not.toHaveBeenCalled();
    });
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
