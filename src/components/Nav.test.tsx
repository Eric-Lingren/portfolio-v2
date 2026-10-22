import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setActiveSection } from "@/components/active-section";
import { RESUME_PATH } from "@/content/site";
import { Nav, viewHref } from "./Nav";

afterEach(() => {
  window.history.replaceState({}, "", "/");
  setActiveSection(null);
});

describe("Nav", () => {
  it("renders all anchors, the switch and the resume link", () => {
    render(<Nav navigate={() => {}} />);
    for (const [label, id] of [
      ["What I do", "what-i-do"],
      ["Work", "work"],
      ["AI toolkit", "ai-toolkit"],
      ["Experience", "experience"],
      ["Testimonials", "testimonials"],
      ["Contact", "contact"],
    ]) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", `#${id}`);
    }
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Interactive" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Classic" })).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Resume" })).toHaveAttribute("href", RESUME_PATH);
  });

  it("switching to Classic sets ?view=classic, and back removes it", () => {
    const navigate = vi.fn();
    const { unmount } = render(<Nav navigate={navigate} />);
    fireEvent.click(screen.getByRole("radio", { name: "Classic" }));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(new URL(navigate.mock.calls[0][0]).searchParams.get("view")).toBe("classic");
    unmount();

    window.history.replaceState({}, "", "/?view=classic");
    const back = vi.fn();
    render(<Nav navigate={back} />);
    expect(screen.getByRole("radio", { name: "Classic" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Interactive" }));
    expect(new URL(back.mock.calls[0][0]).searchParams.has("view")).toBe(false);
  });

  it("viewHref preserves other params", () => {
    expect(viewHref("classic", "http://x.test/?debug=perf")).toBe("http://x.test/?debug=perf&view=classic");
  });

  it("keyboard tab order reaches every control", async () => {
    const user = userEvent.setup();
    render(<Nav navigate={() => {}} />);
    const order: [string, string][] = [
      ["link", "Eric Lingren"],
      ["link", "What I do"],
      ["link", "Work"],
      ["link", "AI toolkit"],
      ["link", "Experience"],
      ["link", "Testimonials"],
      ["link", "Contact"],
      ["link", "Resume"],
      ["radio", "Interactive"],
      ["radio", "Classic"],
    ];
    for (const [role, name] of order) {
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name }));
    }
  });

  it("brand links home and section numbers stay out of link names", () => {
    render(<Nav navigate={() => {}} />);
    expect(screen.getByRole("link", { name: "Eric Lingren" })).toHaveAttribute("href", "#hero");
    expect(screen.getByRole("link", { name: "Work" }).textContent).toBe("02Work");
  });

  it("marks the active section with aria-current and follows changes", () => {
    render(<Nav navigate={() => {}} />);
    expect(document.querySelector("[aria-current]")).toBeNull();
    act(() => setActiveSection("work"));
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "location");
    act(() => setActiveSection("contact"));
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("aria-current", "location");
    act(() => setActiveSection("hero"));
    expect(document.querySelector("[aria-current]")).toBeNull();
  });

  it("styles a visible focus ring for nav controls", () => {
    const css = readFileSync("src/components/nav.css", "utf8");
    expect(css).toMatch(/\.site-nav a:focus-visible/);
    expect(css).toMatch(/\.site-nav button:focus-visible/);
    expect(css).toMatch(/outline: 2px solid/);
  });

  it("fills the resume link with the accent, hover included, like the hero's primary CTA", () => {
    const css = readFileSync("src/components/nav.css", "utf8");
    const block = /\.site-nav a\.site-nav__resume:hover\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(block).toMatch(/background: var\(--accent-fill\)/);
    expect(block).toMatch(/color: var\(--on-accent-fill\)/);
  });

  it("gives Resume a decorative arrow and the hero CTA's coral glow on hover and focus", () => {
    render(<Nav navigate={() => {}} />);
    const arrow = screen.getByRole("link", { name: "Resume" }).querySelector(".btn-arrow--out");
    expect(arrow).toHaveTextContent("↗");
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    const css = readFileSync("src/components/nav.css", "utf8");
    const block = /\.site-nav a\.site-nav__resume:is\(:hover, :focus-visible\)\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(block).toMatch(/box-shadow: var\(--coral-glow\)/);
  });

  it("keeps the view switch out of the top bar, pinned small to the viewport's bottom-right corner", () => {
    render(<Nav navigate={() => {}} />);
    expect(within(screen.getByRole("banner")).queryByRole("radiogroup")).toBeNull();
    const css = readFileSync("src/components/nav.css", "utf8");
    const block = /\.view-switch\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(block).toMatch(/position: fixed/);
    expect(block).toMatch(/right: 1rem/);
    expect(block).toMatch(/bottom: /);
    expect(block).toMatch(/font-size: 0\.6875rem/);
    expect(css).toMatch(/\.view-switch button:focus-visible/);
  });
});
