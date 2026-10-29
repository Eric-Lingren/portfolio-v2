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
    const cards = [...container.querySelectorAll("a.testimonial-card")];
    expect(cards).toHaveLength(n);
    expect(new Set(cards.map((c) => c.className)).size).toBe(1);
    cards.forEach((c, i) => {
      expect(c.querySelector("blockquote")!.textContent).toBe(`“Quote number ${i}”`);
      expect(c.querySelector(".testimonial-source")!.textContent).toBe(`Role ${i} · Acme · ${2020 + i}`);
      expect(c.querySelector("img")).toBeNull();
      const order = [...c.children].map((el) => el.tagName);
      expect(order).toEqual(["BLOCKQUOTE", "P", "SPAN"]);
      expect(c.parentElement!.tagName).toBe("LI");
    });
  });

  it("makes each whole card a link to its original screenshot, with no button", () => {
    const { container } = render(<Testimonials testimonials={fixture(4)} />);
    const links = [...container.querySelectorAll<HTMLAnchorElement>("a.testimonial-card")];
    expect(links).toHaveLength(4);
    links.forEach((a, i) => {
      expect(a).toHaveAttribute("href", `/testimonials/shot-${i}.png`);
      expect(a).toHaveAttribute("target", "_blank");
      expect(a.querySelector(".sr-only")!.textContent).toBe("View original screenshot (opens in a new tab)");
      expect(a.textContent).toContain(`Quote number ${i}`);
    });
    expect(container.querySelector(".btn")).toBeNull();
  });

  it("wraps each highlight phrase in a mark and keeps the full quote text", () => {
    const [first, second, third] = fixture(3);
    const cards = [
      { ...first, quote: "Shipped it in record time.", highlights: ["in record time"] },
      { ...second, quote: "Plain quote.", highlights: ["not present"] },
      {
        ...third,
        quote: "Great owner, fast fixes, kept me updated.",
        highlights: ["kept me updated", "Great owner", "owner, fast", "missing"],
      },
    ];
    const { container } = render(<Testimonials testimonials={cards} />);
    const [a, b, c] = container.querySelectorAll("blockquote");
    expect(a.textContent).toBe("“Shipped it in record time.”");
    expect(a.querySelector("mark.testimonial-highlight")!.textContent).toBe("in record time");
    expect(b.textContent).toBe("“Plain quote.”");
    expect(b.querySelector("mark")).toBeNull();
    expect(c.textContent).toBe("“Great owner, fast fixes, kept me updated.”");
    expect([...c.querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["Great owner", "kept me updated"]);
  });

  it("renders no cards and no placeholder markers when the list is empty", () => {
    const { container } = render(<Testimonials testimonials={[]} />);
    expect(container.querySelectorAll("a.testimonial-card")).toHaveLength(0);
    expect(container.textContent).not.toContain("[ERIC:");
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
      const selectors = [".testimonials", ".testimonials-grid", ...(manifest.length ? [".testimonial-card"] : [])];
      for (const sel of selectors) {
        expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
      }
      unmount();
    }
  });
});
