import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HEADING, REPO_URL, STAGES, fileUrl } from "@/content/ai-toolkit";
import { AIToolkit } from "./AIToolkit";

const skills = STAGES.flatMap((s) => s.skills);
const card = () => screen.getByRole("article");

describe("stage data", () => {
  it("has the five stages in order", () => {
    expect(STAGES.map((s) => s.title)).toEqual(["Plan", "Build", "Review", "Learn", "Improve"]);
  });

  it("gives every skill a question, a name and a tip, with unique ids", () => {
    expect(new Set(skills.map((k) => k.id)).size).toBe(skills.length);
    for (const k of skills) {
      expect(k.question.endsWith("?")).toBe(true);
      expect(k.name.length).toBeGreaterThan(0);
      expect(k.tip.length).toBeGreaterThan(0);
    }
  });

  it("links every skill under the dotfiles repo, folders as trees", () => {
    for (const k of skills) expect(fileUrl(k.path).startsWith("https://github.com/Eric-Lingren/dotfiles/")).toBe(true);
    expect(fileUrl("a/b/")).toBe("https://github.com/Eric-Lingren/dotfiles/tree/main/a/b/");
    expect(fileUrl("a/b.md")).toBe("https://github.com/Eric-Lingren/dotfiles/blob/main/a/b.md");
    expect(REPO_URL.startsWith("https://github.com/Eric-Lingren/dotfiles/")).toBe(true);
  });

  const dotfiles = join(homedir(), ".dotfiles");
  it.skipIf(!existsSync(dotfiles))("points each link at a file that exists locally", () => {
    for (const k of skills) expect(existsSync(join(dotfiles, k.path))).toBe(true);
  });

  it("names no employer-specific terms", () => {
    const text = JSON.stringify(STAGES).toLowerCase();
    for (const w of ["standard metrics", "quaestor", "linear workspace", "portco", "bugbot"]) expect(text).not.toContain(w);
  });
});

describe("AIToolkit", () => {
  it("renders the heading and starts on Plan", () => {
    render(<AIToolkit />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(HEADING);
    expect(card().getAttribute("data-stage")).toBe("plan");
    expect(within(card()).getByText(STAGES[0].summary)).toBeTruthy();
  });

  it("lists each skill of the stage with its tip, each linking to its file", () => {
    render(<AIToolkit />);
    for (const k of STAGES[0].skills) {
      expect(within(card()).getByText(k.tip)).toBeTruthy();
      expect(within(card()).getByRole("link", { name: new RegExp(k.name) }).getAttribute("href")).toBe(fileUrl(k.path));
    }
  });

  it("steps with Next and Back and stops at both ends", () => {
    render(<AIToolkit />);
    const back = screen.getByRole("button", { name: /back/i });
    const next = screen.getByRole("button", { name: /next/i });
    expect(back).toBeDisabled();
    for (let i = 1; i < STAGES.length; i++) {
      fireEvent.click(next);
      expect(card().getAttribute("data-stage")).toBe(STAGES[i].id);
    }
    expect(next).toBeDisabled();
    fireEvent.click(back);
    expect(card().getAttribute("data-stage")).toBe(STAGES.at(-2)!.id);
  });

  it("jumps with the numbered chips and marks the current one", () => {
    render(<AIToolkit />);
    fireEvent.click(screen.getByRole("button", { name: "4: Learn" }));
    expect(card().getAttribute("data-stage")).toBe("learn");
    expect(screen.getByRole("button", { name: "4: Learn" }).getAttribute("aria-current")).toBe("step");
  });

  it("shows every stage in the track, and clicking one jumps to it", () => {
    const { container } = render(<AIToolkit />);
    const stages = container.querySelectorAll(".ai-track > .ai-stage");
    expect(stages).toHaveLength(STAGES.length);
    fireEvent.click(stages[4]);
    expect(card().getAttribute("data-stage")).toBe("improve");
    expect(stages[4].getAttribute("data-active")).toBe("true");
  });

  it("renders the compact strip for narrow screens, and the strip jumps too", () => {
    render(<AIToolkit />);
    const strip = screen.getByTestId("ai-strip");
    expect(within(strip).getAllByRole("button")).toHaveLength(STAGES.length);
    fireEvent.click(within(strip).getByRole("button", { name: /review/i }));
    expect(card().getAttribute("data-stage")).toBe("review");
  });

  it("moves focus to the stage heading after a visitor action, never on mount", () => {
    render(<AIToolkit />);
    const title = within(card()).getByRole("heading", { level: 3 });
    expect(document.activeElement).not.toBe(title);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(document.activeElement).toBe(within(card()).getByRole("heading", { level: 3 }));
  });

  it("stacks a hidden copy of every stage behind the card so stepping never resizes it", () => {
    const { container } = render(<AIToolkit />);
    const ghosts = container.querySelectorAll(".ai-card-stack > .ai-card-ghost");
    expect([...ghosts].map((g) => g.querySelector(".ai-summary")?.textContent)).toEqual(STAGES.map((s) => s.summary));
    for (const g of ghosts) {
      expect(g.getAttribute("aria-hidden")).toBe("true");
      expect(g.hasAttribute("inert")).toBe(true);
    }
  });

  it("links to the case study and the toolkit repo", () => {
    render(<AIToolkit />);
    expect(screen.getByRole("link", { name: /case study/i }).getAttribute("href")).toBe("/work/ai-toolkit");
    expect(screen.getByRole("link", { name: /browse the toolkit/i }).getAttribute("href")).toBe(REPO_URL);
  });

  it("keeps the ai-diagram hook that perf:check tabs through", () => {
    render(<AIToolkit />);
    expect(within(screen.getByTestId("ai-diagram")).getAllByRole("button").length).toBeGreaterThanOrEqual(3);
  });

  it("only shows hover tips on hover-capable pointers", () => {
    const css = readFileSync(join(__dirname, "ai-toolkit.css"), "utf8");
    expect(css).toMatch(/\(hover: hover\) and \(pointer: fine\)[\s\S]*\.ai-skill\[data-tip\]:hover::after/);
  });

  it("holds step-change motion until the visitor steps, keeping the first paint still", () => {
    render(<AIToolkit />);
    const root = screen.getByTestId("ai-diagram");
    expect(root.hasAttribute("data-stepped")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(root.hasAttribute("data-stepped")).toBe(true);
  });

  it("switches every animation off for reduced motion", () => {
    const css = readFileSync(join(__dirname, "ai-toolkit.css"), "utf8");
    expect(css).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*\.ai-root \*::after \{\s*animation: none !important;/);
  });

  it("hides the animated title copy from assistive tech", () => {
    const { container } = render(<AIToolkit />);
    const heroes = container.querySelectorAll(".ai-stage-hero");
    expect(heroes).toHaveLength(STAGES.length);
    heroes.forEach((h) => expect(h.getAttribute("aria-hidden")).toBe("true"));
  });

  it("still shows every question when reduced motion stops the build-up loop", () => {
    const css = readFileSync(join(__dirname, "ai-toolkit.css"), "utf8");
    expect(css).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*\.ai-root \.ai-skill \{\s*opacity: 1 !important;/);
    // Without the loop, the column and its title fall back to fully shown.
    expect(css).toMatch(/@property --ai-in \{[^}]*initial-value: 1;/);
    expect(css).toMatch(/@property --ai-title \{[^}]*initial-value: 1;/);
  });

  it("starts the build-up loop inside the full-board hold so the first paint shows every stage", () => {
    const css = readFileSync(join(__dirname, "ai-toolkit.css"), "utf8");
    const delays = [...css.matchAll(/animation: ai-build-\d [\d.]+s linear (-?[\d.]+)s infinite;/g)].map((m) => Number(m[1]));
    expect(delays).toHaveLength(STAGES.length);
    delays.forEach((d) => expect(d).toBeLessThan(0));
  });

  it("pins the end columns' tips to their outer edge so they stay inside the panel", () => {
    const css = readFileSync(join(__dirname, "ai-toolkit.css"), "utf8");
    expect(css).toMatch(/\.ai-stage:first-child \.ai-skill\[data-tip\]:hover::after \{\s*left: 0;/);
    expect(css).toMatch(/\.ai-stage:last-child \.ai-skill\[data-tip\]:hover::after \{\s*left: auto;\s*right: 0;/);
  });
});
