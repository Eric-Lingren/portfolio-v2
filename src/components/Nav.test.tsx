import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RESUME_PATH } from "@/content/site";
import { Nav, viewHref } from "./Nav";

afterEach(() => window.history.replaceState({}, "", "/"));

describe("Nav", () => {
  it("renders all anchors, the switch and the resume link", () => {
    render(<Nav navigate={() => {}} />);
    for (const [label, id] of [
      ["Positioning", "positioning"],
      ["AI toolkit", "ai-toolkit"],
      ["Work", "work"],
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
      ["link", "Positioning"],
      ["link", "AI toolkit"],
      ["link", "Work"],
      ["link", "Experience"],
      ["link", "Testimonials"],
      ["link", "Contact"],
      ["radio", "Interactive"],
      ["radio", "Classic"],
      ["link", "Resume"],
    ];
    for (const [role, name] of order) {
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name }));
    }
  });

  it("styles a visible focus ring for nav controls", () => {
    const css = readFileSync("src/components/nav.css", "utf8");
    expect(css).toMatch(/\.site-nav a:focus-visible/);
    expect(css).toMatch(/\.site-nav button:focus-visible/);
    expect(css).toMatch(/outline: 2px solid/);
  });
});
