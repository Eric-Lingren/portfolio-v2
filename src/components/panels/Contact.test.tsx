import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import { Footer } from "../Footer";
import { Contact } from "./Contact";

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

  it("links GitHub, LinkedIn and the resume", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://www.github.com/Eric-Lingren");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    expect(screen.getByRole("link", { name: "Resume (PDF)" })).toHaveAttribute("href", "/eric-lingren-resume.pdf");
  });

  it("shows the invitation line and the photo at 150px", () => {
    const { container } = render(<Contact />);
    expect(container.textContent).toContain("Building something interesting? Let's talk.");
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("width", "150");
    expect(img).toHaveAttribute("height", "150");
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
    expect(geometry(polished.querySelector(".contact-photo")!)).toContain("width:150px");
  });
});

describe("Footer", () => {
  it("has the exact text and repo link", () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toBe(
      "Based near Seattle. Sailing, vintage games, 50+ countries.Built with Next.js and CSS 3D. Source on GitHub.",
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
