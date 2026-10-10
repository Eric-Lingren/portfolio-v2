import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { EXPERIENCE, PRE_ENGINEERING_FOOTNOTE } from "@/content/experience";
import { RESUME_PATH } from "@/content/site";
import { Experience } from "./Experience";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const LAYOUT_PROPS = ["display", "position", "flex-direction", "padding-top", "min-height", "width", "gap"];
const geometry = (el: Element) =>
  LAYOUT_PROPS.map((p) => `${p}:${getComputedStyle(el).getPropertyValue(p)}`).join(";");

afterEach(() => document.head.querySelectorAll("style").forEach((s) => s.remove()));

describe("Experience", () => {
  it("renders 4 rows in order with exact company, title and dates", () => {
    const { container } = render(<Experience />);
    const rows = [...container.querySelectorAll("[data-role-row]")];
    expect(rows).toHaveLength(4);
    const got = rows.map((r) => [
      r.querySelector(".experience-company")!.textContent,
      r.querySelector(".experience-role")!.textContent,
      r.querySelector(".experience-dates")!.textContent,
    ]);
    expect(got).toEqual([
      ["Standard Metrics", "Software Engineer", "Mar 2022 to present"],
      ["InsideOut Development", "Software Developer", "Apr 2019 to Mar 2022"],
      ["Bryan University", "Adjunct Instructor", "Jun 2020 to Jun 2023"],
      ["V School", "MERN Instructor/TA", "Jan to Apr 2019"],
    ]);
  });

  it("has at most 3 highlights per row and every link resolves to a route", () => {
    for (const role of EXPERIENCE) {
      expect(role.highlights.length).toBeLessThanOrEqual(3);
      for (const h of role.highlights) {
        if (!h.href) continue;
        const slug = h.href.replace("/work/", "");
        expect(h.href.startsWith("/work/")).toBe(true);
        expect(existsSync(join(process.cwd(), "content/work", `${slug}.mdx`))).toBe(true);
      }
    }
  });

  it("links Standard Metrics and InsideOut highlights to their case studies", () => {
    expect(EXPERIENCE[0].highlights.map((h) => h.href)).toEqual([
      "/work/kpi-granularity",
      "/work/investor-reports",
      "/work/frontend-platform",
    ]);
    expect(EXPERIENCE[1].highlights.map((h) => h.href)).toEqual(["/work/render-performance"]);
  });

  it("has no count phrases or pre-engineering career in highlights", () => {
    for (const role of EXPERIENCE) {
      for (const h of role.highlights) {
        expect(h.text).not.toMatch(/\b\d+\s*(PRs?|pull requests?|files?|lines?|commits?)\b/i);
        expect(h.text).not.toMatch(/trucking|sales|account management/i);
      }
    }
  });

  it("links the resume at the shared path", () => {
    render(<Experience />);
    expect(screen.getByRole("link", { name: "Download resume (PDF)" })).toHaveAttribute("href", RESUME_PATH);
  });

  it("ends with a single-line pre-engineering footnote", () => {
    const { container } = render(<Experience />);
    const notes = container.querySelectorAll(".experience-footnote");
    expect(notes).toHaveLength(1);
    expect(notes[0].textContent).toBe(PRE_ENGINEERING_FOOTNOTE);
    expect(PRE_ENGINEERING_FOOTNOTE).not.toContain("\n");
    expect(container.querySelector(".experience")!.lastElementChild).toBe(notes[0]);
  });

  it("keeps identical geometry in both layers", () => {
    const style = document.createElement("style");
    style.textContent = css + readFileSync(join(process.cwd(), "src/components/panels/experience.css"), "utf8");
    document.head.appendChild(style);
    const { container } = render(<Experience layers="both" />);
    const sketch = container.querySelector('[data-layer="sketch"]')!;
    const polished = container.querySelector('[data-layer="polished"]')!;
    expect(geometry(sketch)).toBe(geometry(polished));
    for (const sel of [".experience", ".experience-row", ".experience-head", ".experience-footnote", ".btn"]) {
      expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
    }
  });
});
