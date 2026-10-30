import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { compileBody } from "@/lib/work";
import workImages from "@/content/work-images.json";
import { BeforeAfter } from "./BeforeAfter";
import { Figure } from "./Figure";

const lookup = (src: string) =>
  src === "/work/x/a.webp" || src === "/work/x/b.webp" ? { width: 400, height: 300 } : undefined;
const keys = Object.keys(workImages);
const realDims = (workImages as Record<string, { width: number; height: number }>)[keys[0]];

describe("Figure", () => {
  it("renders figure, linked image with dimensions, and caption", () => {
    const { container } = render(<Figure src="/work/x/a.webp" alt="Alt a" caption="Cap" lookup={lookup} />);
    const fig = container.querySelector("figure")!;
    const a = fig.querySelector("a")!;
    expect(a).toHaveAttribute("href", "/work/x/a.webp");
    expect(a).toHaveAttribute("target", "_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
    expect(a.querySelector(".sr-only")!.textContent).toBe("Open full-size image");
    const img = a.querySelector("img")!;
    expect(img).toHaveAttribute("width", "400");
    expect(img).toHaveAttribute("height", "300");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("alt", "Alt a");
    expect(fig.querySelector("figcaption")!.textContent).toBe("Cap");
  });

  it("uses work-images.json by default", () => {
    const { container } = render(<Figure src={keys[0]} alt="x" />);
    expect(container.querySelector("img")).toHaveAttribute("width", String(realDims.width));
  });

  it("throws on empty alt and on unknown src", () => {
    expect(() => render(<Figure src="/work/x/a.webp" alt="" lookup={lookup} />)).toThrow(/alt/);
    expect(() => render(<Figure src="/work/x/a.webp" alt="  " lookup={lookup} />)).toThrow(/alt/);
    expect(() => render(<Figure src="/work/x/nope.webp" alt="ok" lookup={lookup} />)).toThrow(/work-images/);
  });
});

describe("BeforeAfter", () => {
  const props = { before: "/work/x/a.webp", after: "/work/x/b.webp", beforeAlt: "Old", afterAlt: "New", lookup };

  it("renders both images with labels and alts", () => {
    const { container } = render(<BeforeAfter {...props} caption="Cap" />);
    expect(screen.getByText("Before")).toBeVisible();
    expect(screen.getByText("After")).toBeVisible();
    expect(screen.getByAltText("Old")).toBeInTheDocument();
    expect(screen.getByAltText("New")).toBeInTheDocument();
    container.querySelectorAll("a").forEach((a) => {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a.getAttribute("rel")).toContain("noopener");
    });
    expect(container.querySelector("figcaption")!.textContent).toBe("Cap");
  });

  it("throws on empty alts and unknown src", () => {
    expect(() => render(<BeforeAfter {...props} beforeAlt="" />)).toThrow(/beforeAlt/);
    expect(() => render(<BeforeAfter {...props} afterAlt="" />)).toThrow(/afterAlt/);
    expect(() => render(<BeforeAfter {...props} after="/work/x/missing.webp" />)).toThrow(/work-images/);
  });

  it("stacks wide images (wider than 2:1) and keeps others side by side", () => {
    const wide = (src: string) => (src.startsWith("/work/x/") ? { width: 1400, height: 240 } : undefined);
    const { container: side } = render(<BeforeAfter {...props} />);
    expect(side.querySelector(".case-study__before-after-grid")).not.toHaveAttribute("data-stacked");
    const { container: stacked } = render(<BeforeAfter {...props} lookup={wide} />);
    expect(stacked.querySelector(".case-study__before-after-grid")).toHaveAttribute("data-stacked", "true");
    const css = fs.readFileSync(path.join(process.cwd(), "src/app/work/case-study.css"), "utf8");
    expect(css).toMatch(/\.case-study__before-after-grid\[data-stacked\]\s*{[^}]*grid-template-columns:\s*1fr;/);
  });

  it("css lays out side by side and stacks at 600px and under", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "src/app/work/case-study.css"), "utf8");
    expect(css).toMatch(/\.case-study__before-after-grid\s*{[^}]*grid-template-columns:\s*1fr 1fr/);
    expect(css).toMatch(
      /@container \(max-width: 600px\)\s*{\s*\.case-study__before-after-grid\s*{[^}]*grid-template-columns:\s*1fr;/,
    );
  });
});

describe("MDX integration", () => {
  it("compiles a body using both components", async () => {
    const [a, b] = keys;
    const src = `<Figure src="${a}" alt="Fig alt" caption="Fig cap" />\n\n<BeforeAfter before="${a}" after="${b}" beforeAlt="B" afterAlt="A" caption="BA cap" />`;
    render(await compileBody(src));
    expect(screen.getByAltText("Fig alt")).toBeInTheDocument();
    expect(screen.getByText("Fig cap")).toBeInTheDocument();
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByAltText("A")).toBeInTheDocument();
  });

  it("throws at render for a bad src", async () => {
    const body = await compileBody('<Figure src="/work/nope.webp" alt="x" />');
    expect(() => render(body)).toThrow(/work-images/);
  });
});
