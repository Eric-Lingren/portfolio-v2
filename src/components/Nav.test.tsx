import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setActiveSection } from "@/components/active-section";
import { MOBILE_QUERY } from "@/components/flythrough/mode";
import { Nav, viewHref } from "./Nav";

afterEach(() => {
  window.history.replaceState({}, "", "/");
  setActiveSection(null);
});

describe("Nav", () => {
  it("renders all anchors and the switch, with no resume link", () => {
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
    expect(screen.queryByRole("link", { name: "Resume" })).toBeNull();
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
      ["button", "Menu"],
      ["link", "What I do"],
      ["link", "Work"],
      ["link", "AI toolkit"],
      ["link", "Experience"],
      ["link", "Testimonials"],
      ["link", "Contact"],
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

  it("keeps the bar to one line below desktop: links in one sideways-scrolling row", () => {
    const css = readFileSync("src/components/nav.css", "utf8");
    const narrow = css.slice(css.indexOf("@media (max-width: 1100px)"), css.indexOf("/* Menu toggle"));
    expect(narrow).toMatch(/\.site-nav__links \{[^}]*flex-wrap: nowrap;[^}]*overflow-x: auto;/);
    expect(narrow).toMatch(/\.site-nav \{[^}]*flex-wrap: nowrap;/);
  });

  it("Menu toggles the section links and says so with aria-expanded", () => {
    render(<Nav navigate={() => {}} />);
    const toggle = screen.getByRole("button", { name: "Menu" });
    const header = screen.getByRole("banner");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", screen.getByRole("navigation", { name: "Sections" }).id);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(header).toHaveAttribute("data-open");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(header).not.toHaveAttribute("data-open");
  });

  it("closes the menu on a link tap, Escape (focus back on Menu) or a tap outside the bar", () => {
    render(<Nav navigate={() => {}} />);
    const toggle = screen.getByRole("button", { name: "Menu" });

    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("link", { name: "Work" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle);

    fireEvent.click(toggle);
    fireEvent.pointerDown(screen.getByRole("link", { name: "Contact" }));
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerDown(document.body);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("on phones shows Menu, folds the links into a panel and hides the view switch, using mode.ts's query", () => {
    const css = readFileSync("src/components/nav.css", "utf8");
    expect(/\.site-nav__toggle \{[^}]*display: none;/.test(css)).toBe(true);
    const phone = css.slice(css.indexOf(`@media ${MOBILE_QUERY}`));
    expect(phone.length).toBeLessThan(css.length);
    expect(phone).toMatch(/\.site-nav \.site-nav__toggle \{[^}]*display: inline-flex;/);
    expect(phone).toMatch(/\.site-nav \.site-nav__links \{[^}]*display: none;/);
    expect(phone).toMatch(/\.site-nav\[data-open\] \.site-nav__links \{[^}]*display: flex;/);
    expect(phone).toMatch(/\.view-switch \{[^}]*display: none;/);
  });
});
