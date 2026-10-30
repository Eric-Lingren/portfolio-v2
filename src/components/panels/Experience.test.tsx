import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { Experience } from "./Experience";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const LAYOUT_PROPS = ["display", "position", "flex-direction", "padding-top", "min-height", "width", "gap"];
const geometry = (el: Element) => LAYOUT_PROPS.map((p) => `${p}:${getComputedStyle(el).getPropertyValue(p)}`).join(";");

afterEach(() => document.head.querySelectorAll("style").forEach((s) => s.remove()));

describe("Experience", () => {
  it("renders 4 rows by start date, oldest first, with exact company, title and dates", () => {
    const { container } = render(<Experience />);
    const rows = [...container.querySelectorAll("[data-role-row]")];
    expect(rows).toHaveLength(4);
    const got = rows.map((r) => [
      r.querySelector(".experience-company")!.textContent,
      r.querySelector(".experience-role")!.textContent,
      [...r.querySelector(".experience-dates")!.children].map((c) => c.textContent).join(" "),
    ]);
    expect(got).toEqual([
      ["V School", "Teaching Assistant", "Jan 2019 to Apr 2019"],
      ["InsideOut Development", "Software Developer", "Apr 2019 to Mar 2022"],
      ["Bryan University", "Adjunct Instructor", "Jun 2020 to Jun 2023"],
      ["Standard Metrics", "Software Engineer", "Mar 2022 to present"],
    ]);
    expect(rows.map((r) => r.hasAttribute("data-current"))).toEqual([false, false, false, true]);
  });

  it("gives every row the same shape: company, title, dates and one scope line", () => {
    const { container } = render(<Experience />);
    for (const row of container.querySelectorAll("[data-role-row]")) {
      expect(row.querySelectorAll("p")).toHaveLength(2);
      expect(row.querySelector(".experience-scope")!.textContent).toMatch(/^\S.*\.$/);
    }
  });

  it("shows each range as start, to, end", () => {
    const { container } = render(<Experience />);
    const dates = container.querySelector(".experience-dates")!;
    expect([...dates.children].map((c) => c.textContent)).toEqual(["Jan 2019", "to", "Apr 2019"]);
  });

  it("has no links in the timeline; case studies live on the Work panel", () => {
    const { container } = render(<Experience />);
    expect(container.querySelector(".experience-list a")).toBeNull();
  });

  it("has no resume button and no pre-engineering footnote", () => {
    const { container } = render(<Experience />);
    expect(container.querySelector(".experience-footnote")).toBeNull();
    expect(screen.queryByRole("link", { name: "Resume" })).toBeNull();
    expect(container.textContent).not.toMatch(/trucks|tech sales/i);
  });

  it("keeps identical geometry in both layers", () => {
    const style = document.createElement("style");
    style.textContent = css + readFileSync(join(process.cwd(), "src/components/panels/experience.css"), "utf8");
    document.head.appendChild(style);
    const { container } = render(<Experience layers="both" />);
    const sketch = container.querySelector('[data-layer="sketch"]')!;
    const polished = container.querySelector('[data-layer="polished"]')!;
    expect(geometry(sketch)).toBe(geometry(polished));
    for (const sel of [".experience", ".experience-row", ".experience-role"]) {
      expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
    }
  });
});
