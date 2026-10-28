import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import type { Testimonial } from "@/content/testimonials";
import { Testimonials } from "./Testimonials";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const LAYOUT_PROPS = ["display", "position", "flex-direction", "padding-top", "min-height", "width", "gap"];
const geometry = (el: Element) =>
  LAYOUT_PROPS.map((p) => `${p}:${getComputedStyle(el).getPropertyValue(p)}`).join(";");

afterEach(() => document.head.querySelectorAll("style").forEach((s) => s.remove()));

const fixture = (n: number): Testimonial[] =>
  Array.from({ length: n }, (_, i) => ({
    quote: `Quote number ${i}`,
    roleLabel: `Role ${i}`,
    sourceType: "Slack message",
    employer: "Acme",
    year: 2020 + i,
    original: `shot-${i}`,
  }));

describe("Testimonials", () => {
  it.each([4, 6])("renders %i uniform excerpt cards with no images", (n) => {
    const { container } = render(<Testimonials testimonials={fixture(n)} />);
    const cards = [...container.querySelectorAll("li.testimonial-card")];
    expect(cards).toHaveLength(n);
    expect(new Set(cards.map((c) => c.className)).size).toBe(1);
    cards.forEach((c, i) => {
      expect(c.querySelector("blockquote")!.textContent).toBe(`“Quote number ${i}”`);
      expect(c.querySelector(".testimonial-source")!.textContent).toBe(`Role ${i} · Slack message · Acme · ${2020 + i}`);
      expect(c.querySelector("img")).toBeNull();
      const order = [...c.children].map((el) => el.tagName);
      expect(order).toEqual(["BLOCKQUOTE", "P", "A"]);
    });
    expect(container.querySelector("[data-testimonial-placeholder]")).toBeNull();
  });

  it("links each card to its original screenshot with the shared button classes", () => {
    const { container } = render(<Testimonials testimonials={fixture(4)} />);
    const links = [...container.querySelectorAll<HTMLAnchorElement>("li.testimonial-card a")];
    expect(links).toHaveLength(4);
    const resumeClasses = ["btn", "btn-primary"];
    links.forEach((a, i) => {
      expect(a).toHaveAttribute("href", `/testimonials/shot-${i}.png`);
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("aria-label", "View original screenshot");
      expect(a.textContent).toContain("View original");
      expect(a.firstElementChild).toBe(a.querySelector("svg.btn-icon"));
      expect(a.className.split(" ")).toEqual(resumeClasses);
    });
  });

  it("renders 4 marked placeholder cards with the same structure and no link", () => {
    const { container } = render(<Testimonials testimonials={[]} />);
    const cards = container.querySelectorAll("li.testimonial-card[data-testimonial-placeholder]");
    expect(cards).toHaveLength(4);
    cards.forEach((c) => {
      expect(c.querySelector("blockquote")).not.toBeNull();
      expect(c.querySelector(".testimonial-source")).not.toBeNull();
      expect(c.querySelector("a")).toBeNull();
    });
    expect(container.textContent).toContain("[ERIC:");
    expect(container.querySelector("img")).toBeNull();
  });

  it("uses the shared 600px breakpoint and no italics in the card CSS", () => {
    const cardCss = readFileSync(join(process.cwd(), "src/components/panels/testimonials.css"), "utf8");
    expect(cardCss).toMatch(/repeat\(2,/);
    expect(cardCss).toMatch(/max-width: 600px/);
    expect(cardCss).not.toMatch(/italic/);
    expect(cardCss).not.toMatch(/testimonial-frame/);
  });

  it("keeps identical geometry in both layers", () => {
    const style = document.createElement("style");
    style.textContent = css + readFileSync(join(process.cwd(), "src/components/panels/testimonials.css"), "utf8");
    document.head.appendChild(style);
    for (const manifest of [fixture(6), []]) {
      const { container, unmount } = render(<Testimonials layers="both" testimonials={manifest} />);
      const sketch = container.querySelector('[data-layer="sketch"]')!;
      const polished = container.querySelector('[data-layer="polished"]')!;
      expect(geometry(sketch)).toBe(geometry(polished));
      for (const sel of [".testimonials", ".testimonials-grid", ".testimonial-card"]) {
        expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
      }
      unmount();
    }
  });
});
