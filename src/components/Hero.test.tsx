import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { StageContext } from "./flythrough/stage-context";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("has the exact eyebrow", () => {
    render(<Hero />);
    expect(screen.getByText("FRONTEND-FIRST FULL-STACK ENGINEER").textContent).toBe(
      "FRONTEND-FIRST FULL-STACK ENGINEER",
    );
  });

  it("links View work to #work and email to the mailto helper", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "View work" })).toHaveAttribute("href", "#work");
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:ericlingren@gmail.com?subject=Hello%20from%20ericlingren.com",
    );
  });

  it("gives each CTA a decorative arrow that stays out of its accessible name", () => {
    render(<Hero />);
    const arrow = (name: string) => screen.getByRole("link", { name }).querySelector(".btn-arrow");
    expect(arrow("View work")).toHaveTextContent("→");
    expect(arrow("View work")).toHaveAttribute("aria-hidden", "true");
    expect(arrow("Email me")).toHaveTextContent("↗");
    expect(arrow("Email me")).toHaveClass("btn-arrow--out");
    expect(arrow("Email me")).toHaveAttribute("aria-hidden", "true");
  });

  it("glows every button and nudges its arrow on hover and keyboard focus, and holds still for reduced motion", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toMatch(/--coral-glow:\s*0 0 0 1px #ff6b57,\s*0 0 28px rgba\(255, 107, 87, 0\.45\)/);
    const rule = (sel: RegExp) => new RegExp(sel.source + String.raw`\s*\{([^}]*)\}`).exec(css)?.[1] ?? "";
    expect(rule(/\.btn-primary:is\(:hover, :focus-visible\)/)).toMatch(/box-shadow: var\(--coral-glow\)/);
    expect(rule(/\.btn-outline:is\(:hover, :focus-visible\)/)).toMatch(/box-shadow: var\(--cyan-glow\)/);
    expect(rule(/:is\(:hover, :focus-visible\) \.btn-arrow/)).toMatch(/transform: translateX\(4px\)/);
    expect(rule(/:is\(:hover, :focus-visible\) \.btn-arrow--out/)).toMatch(/transform: translate\(2px, -2px\)/);
    expect(rule(/:is\(:hover, :focus-visible\) \.btn-arrow--down/)).toMatch(/transform: translateY\(3px\)/);
    // The sketch wireframe stays flat: no glow or tint bleeds onto it.
    expect(rule(/\.panel-layer--sketch \.btn:is\(:hover, :focus-visible\)/)).toMatch(/box-shadow: none/);
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*\.btn-arrow[^{]*\{\s*transition: none/);
  });

  it("contains no photo", () => {
    const { container } = render(<Hero />);
    expect(container.querySelectorAll("img, picture, svg, [style*='background-image']")).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/profile/i);
  });

  it("shows the component tag in the 3D stage only", () => {
    const { unmount } = render(<Hero />);
    expect(screen.queryByText("<Hero /> z=0")).toBeNull();
    unmount();
    render(
      <StageContext.Provider value={true}>
        <Hero />
      </StageContext.Provider>,
    );
    expect(screen.getAllByText("<Hero /> z=0").length).toBeGreaterThan(0);
  });

  it("is present in static HTML with no JS", () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(html).toContain("FRONTEND-FIRST FULL-STACK ENGINEER");
    expect(html).toContain("View work");
    expect(html).not.toContain("<script");
  });
});
