import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { RESUME } from "@/content/resume";
import { ResumeDocument, withProofNumbers } from "./ResumeDocument";

const css = readFileSync(join(__dirname, "resume.css"), "utf8");
const doc = new DOMParser().parseFromString(renderToStaticMarkup(<ResumeDocument resume={RESUME} />), "text/html");

/** Body of the first rule (or at-rule block) whose header matches. */
function block(header: RegExp): string {
  return new RegExp(header.source + String.raw`\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}`).exec(css)?.[1] ?? "";
}

describe("resume.css colors", () => {
  it("deep coral text token has AA contrast on white", () => {
    const token = /--resume-coral-text:\s*(#[0-9a-f]{6})/i.exec(css)?.[1];
    expect(token?.toLowerCase()).toBe("#c43d2b");
    expect(contrastRatio(token!, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("uses brand coral for lines and the accent bar", () => {
    expect(css).toMatch(/--resume-coral-line:\s*#ff6b57/i);
    expect(css).toMatch(/\.resume-id\s*\{[^}]*border-left:\s*4px solid var\(--resume-coral-line\)/);
    expect(css).toMatch(/\.resume-section-title\s*\{[^}]*border-bottom:\s*1\.5px solid var\(--resume-coral-line\)/);
  });

  it("uses brand coral for coral text on the dark web theme", () => {
    expect(block(/@media screen/)).toMatch(/--resume-coral-text:\s*#ff6b57/i);
  });
});

describe("resume.css print and type rules", () => {
  it("forces the light palette in print and sets one Letter page", () => {
    const print = block(/@media print/);
    expect(print).toMatch(/--resume-bg:\s*#ffffff/);
    expect(print).toMatch(/--resume-coral-text:\s*#c43d2b/i);
    expect(print).toMatch(/--resume-ink:\s*#16181d/);
    expect(css).toMatch(/@page\s*\{[^}]*size:\s*Letter/);
  });

  it("keeps the name letter-spacing no tighter than -0.01em", () => {
    const spacing = /\.resume-name\s*\{[^}]*letter-spacing:\s*(-?[\d.]+)em/.exec(css)?.[1];
    expect(Number(spacing)).toBeGreaterThanOrEqual(-0.01);
  });

  it("does not use small-caps or lowercase tricks on section headings", () => {
    const heading = block(/\.resume-section-title/);
    expect(heading).not.toMatch(/small-caps|text-transform/);
  });

  it("proof numbers are not bold", () => {
    expect(block(/\.resume-num/)).toMatch(/font-weight:\s*400/);
  });
});

describe("ResumeDocument header", () => {
  it("renders the eyebrow text in the DOM in title case", () => {
    expect(doc.querySelector(".resume-eyebrow")?.textContent).toBe("Senior Software Engineer");
  });

  it("renders contact items one per line in the decided order", () => {
    const items = [...doc.querySelectorAll(".resume-reach li")].map((li) => li.textContent);
    expect(items).toEqual([
      "Remote · Seattle area",
      RESUME.email,
      "ericlingren.com",
      "linkedin.com/in/ericlingren",
      "github.com/Eric-Lingren",
    ]);
  });

  it("renders the stack as two separate lines", () => {
    const lines = [...doc.querySelectorAll(".resume-stack")].map((p) => p.textContent);
    expect(lines).toEqual(["Frontend-focused full stack · React, TypeScript, Node", "AI agents and LLM tooling"]);
  });
});

describe("proof numbers", () => {
  it("wraps metrics in a dedicated non-bold element", () => {
    const nums = [...doc.querySelectorAll("span.resume-num")].map((n) => n.textContent);
    for (const expected of ["22%", "84%", "20", "35", "11"]) expect(nums).toContain(expected);
    expect(doc.querySelector("b, strong, h1 .resume-num")).toBeNull();
  });

  it("leaves compounds like 15-engineer alone", () => {
    const html = renderToStaticMarkup(<>{withProofNumbers("a 15-engineer team grew 22% in 5.2s")}</>);
    expect(html).toContain('<span class="resume-num">22%</span>');
    expect(html).toContain('<span class="resume-num">5.2s</span>');
    expect(html).not.toContain(">15<");
  });
});
