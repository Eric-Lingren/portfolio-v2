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
    expect(STAGES.map((s) => s.title)).toEqual(["Plan", "Build", "Catch", "Learn", "Improve"]);
  });

  it("gives every skill a question, a name and a tip, with unique ids", () => {
    expect(new Set(skills.map((k) => k.id)).size).toBe(skills.length);
    for (const k of skills) {
      expect(k.question.endsWith("?")).toBe(true);
      expect(k.name.length).toBeGreaterThan(0);
      expect(k.tip.length).toBeGreaterThan(0);
    }
  });

  it("links skill files under the dotfiles repo", () => {
    for (const k of skills) if (k.path) expect(fileUrl(k.path).startsWith("https://github.com/Eric-Lingren/dotfiles/")).toBe(true);
    expect(REPO_URL.startsWith("https://github.com/Eric-Lingren/dotfiles/")).toBe(true);
  });

  const dotfiles = join(homedir(), ".dotfiles");
  it.skipIf(!existsSync(dotfiles))("points each link at a file that exists locally", () => {
    for (const k of skills) if (k.path) expect(existsSync(join(dotfiles, k.path))).toBe(true);
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

  it("lists each skill of the stage with its tip, linking those that have a file", () => {
    render(<AIToolkit />);
    for (const k of STAGES[0].skills) {
      expect(within(card()).getByText(k.tip)).toBeTruthy();
      if (k.path) expect(within(card()).getByRole("link", { name: new RegExp(k.name) }).getAttribute("href")).toBe(fileUrl(k.path));
      else expect(within(card()).queryByRole("link", { name: new RegExp(k.name) })).toBeNull();
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

  it("falls back to the flat strip without matchMedia, and the strip jumps too", () => {
    render(<AIToolkit />);
    const strip = screen.getByTestId("ai-strip");
    expect(within(strip).getAllByRole("button")).toHaveLength(STAGES.length);
    fireEvent.click(within(strip).getByRole("button", { name: /catch/i }));
    expect(card().getAttribute("data-stage")).toBe("catch");
  });

  it("moves focus to the stage heading after a visitor action, never on mount", () => {
    render(<AIToolkit />);
    const title = within(card()).getByRole("heading", { level: 3 });
    expect(document.activeElement).not.toBe(title);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(document.activeElement).toBe(within(card()).getByRole("heading", { level: 3 }));
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
});
