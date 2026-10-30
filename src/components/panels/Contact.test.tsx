import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import { Footer } from "../Footer";
import { Contact } from "./Contact";
import { GITHUB_REPO_URL, GITHUB_URL, LINKEDIN_URL, TRAVEL_MAP_URL } from "@/content/site";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const LAYOUT_PROPS = ["display", "position", "flex-direction", "padding-top", "min-height", "width", "height", "gap"];
const geometry = (el: Element) =>
  LAYOUT_PROPS.map((p) => `${p}:${getComputedStyle(el).getPropertyValue(p)}`).join(";");

afterEach(() => {
  document.head.querySelectorAll("style").forEach((s) => s.remove());
  vi.restoreAllMocks();
});

describe("Contact", () => {
  it("copies the email and announces Copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<Contact />);
    fireEvent.click(screen.getByRole("button", { name: "Copy email" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied"));
    expect(writeText).toHaveBeenCalledWith("ericlingren@gmail.com");
  });

  it("copies when the address itself is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<Contact />);
    fireEvent.click(screen.getByRole("button", { name: "ericlingren@gmail.com" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied"));
    expect(writeText).toHaveBeenCalledWith("ericlingren@gmail.com");
  });

  it("confirms a copy with the check icon only, then flips back", async () => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
    render(<Contact />);
    const button = screen.getByRole("button", { name: "Copy email" });
    const before = button.innerHTML;
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied"));
    expect(screen.getByRole("status")).toHaveClass("sr-only");
    expect(button.innerHTML).not.toBe(before);
    await waitFor(() => expect(button.innerHTML).toBe(before), { timeout: 3000 });
  });

  it("falls back to execCommand when navigator.clipboard is missing", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const exec = vi.fn().mockReturnValue(true);
    (document as unknown as { execCommand: unknown }).execCommand = exec;
    render(<Contact />);
    fireEvent.click(screen.getByRole("button", { name: "Copy email" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied"));
    expect(exec).toHaveBeenCalledWith("copy");
  });

  it("uses an exact mailto href with the subject", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: "Send an email" })).toHaveAttribute(
      "href",
      "mailto:ericlingren@gmail.com?subject=Hello%20from%20ericlingren.com",
    );
  });

  it("gives Copy email a decorative copy icon that turns into a check once copied", async () => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
    render(<Contact />);
    const button = screen.getByRole("button", { name: "Copy email" });
    const before = button.innerHTML;
    expect(button.querySelector("svg.btn-icon")).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(button);
    await waitFor(() => expect(button.innerHTML).not.toBe(before));
    expect(button.querySelector("svg.btn-icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("gives every Contact button a decorative icon first", () => {
    const { container } = render(<Contact />);
    const buttons = container.querySelectorAll(".contact :is(.btn, .icon-btn)");
    expect(buttons).toHaveLength(5);
    for (const b of buttons) {
      expect(b.firstElementChild).toHaveClass("btn-icon");
      expect(b.firstElementChild).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("puts bare icon Copy email and Send an email buttons beside the address", () => {
    const { container } = render(<Contact />);
    const row = container.querySelector(".contact-email")!;
    expect(row.querySelector(".contact-email__address")).toHaveTextContent("ericlingren@gmail.com");
    for (const el of [
      screen.getByRole("button", { name: "Copy email" }),
      screen.getByRole("link", { name: "Send an email" }),
    ]) {
      expect(el.parentElement).toBe(row);
      expect(el).toHaveClass("icon-btn");
      expect(el).not.toHaveClass("btn");
      expect(el.textContent).toBe("");
    }
  });

  it("links GitHub, LinkedIn and Resume as shared buttons, icon then label", () => {
    const { container } = render(<Contact />);
    for (const name of ["GitHub", "LinkedIn", "Resume"]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveClass("btn", "btn-outline", "contact-btn");
      expect(link.parentElement).toHaveClass("contact-links");
      expect(link.firstElementChild).toHaveClass("btn-icon");
      expect(link.firstElementChild).toHaveAttribute("aria-hidden", "true");
    }
    expect(container.querySelectorAll(".contact-links .btn")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://www.github.com/Eric-Lingren");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    const resume = screen.getByRole("link", { name: "Resume" });
    expect(resume).toHaveAttribute("href", "/resume");
    expect(resume).not.toHaveAttribute("target");
  });

  it("shows the invitation line and the photo at 200px", () => {
    const { container } = render(<Contact />);
    expect(container.textContent).toContain("Building something interesting? Let's talk.");
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("width", "200");
    expect(img).toHaveAttribute("height", "200");
  });

  it("contains no phone, Calendly, availability or role-fit text (whole page)", () => {
    const { container } = render(<Home />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
    expect(text).not.toMatch(/calendly|book a call|open to|available for|role fit/i);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("keeps identical geometry in both layers", () => {
    const style = document.createElement("style");
    style.textContent = css + readFileSync(join(process.cwd(), "src/components/panels/contact.css"), "utf8");
    document.head.appendChild(style);
    const { container } = render(<Contact layers="both" />);
    const sketch = container.querySelector('[data-layer="sketch"]')!;
    const polished = container.querySelector('[data-layer="polished"]')!;
    expect(geometry(sketch)).toBe(geometry(polished));
    for (const sel of [".contact", ".contact-main", ".contact-photo", ".contact-cta", ".contact-links"]) {
      expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
    }
    expect(geometry(polished.querySelector(".contact-photo")!)).toContain("width:200px");
  });
});

describe("Footer", () => {
  it("has the exact text and repo link", () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toBe(
      "Based near Seattle. Sailing, retro video games, and travel (50+ countries).Built with Next.js and CSS 3D. Source on GitHub.",
    );
    expect(screen.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/Eric-Lingren/portfolio-v2",
    );
  });

  it("is page-level, after the fly-through loader, with the flat stack carrying the panel", () => {
    const { container } = render(<Home />);
    expect(container.querySelector("main > footer.site-footer")).not.toBeNull();
    expect(container.textContent).toContain("Based near Seattle.");
    expect(container.textContent).toContain("Building something interesting? Let's talk.");
  });
});

describe("external links", () => {
  it("open every off-site link on the home page in a new tab, with no opener", () => {
    const { container } = render(<Home />);
    const external = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')];
    expect(external.map((a) => a.getAttribute("href"))).toEqual(
      expect.arrayContaining([GITHUB_URL, LINKEDIN_URL, GITHUB_REPO_URL, TRAVEL_MAP_URL]),
    );
    for (const a of external) {
      expect(a, a.href).toHaveAttribute("target", "_blank");
      expect(a.getAttribute("rel"), a.href).toMatch(/noopener/);
    }
  });
});
