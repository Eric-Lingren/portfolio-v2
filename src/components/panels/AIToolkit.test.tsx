import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HEADING, KEYWORDS, REPO_URL, STAGES, fileUrl } from "@/content/ai-toolkit";
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

  it("links every skill under the public toolkit repo, folders as trees", () => {
    expect(REPO_URL).toBe("https://github.com/Eric-Lingren/claude-code-toolkit");
    for (const k of skills) expect(fileUrl(k.path).startsWith(`${REPO_URL}/`)).toBe(true);
    expect(fileUrl("a/b/")).toBe(`${REPO_URL}/tree/main/a/b/`);
    expect(fileUrl("a/b.md")).toBe(`${REPO_URL}/blob/main/a/b.md`);
  });

  // The toolkit source lives in the private dotfiles repo, and publish.json decides what goes public.
  const dotfiles = join(homedir(), ".dotfiles", "claude-code-shared");
  const publisher = join(dotfiles, "scripts", "publish", "publish-toolkit.py");
  it.skipIf(!existsSync(dotfiles))("points each link at a file that exists in the toolkit source", () => {
    for (const k of skills) expect(existsSync(join(dotfiles, k.path)), k.path).toBe(true);
  });

  it.skipIf(!existsSync(publisher))("only links files the publish manifest makes public", () => {
    const published = execFileSync("python3", [publisher, "--list"], { encoding: "utf8" }).split("\n");
    for (const k of skills) {
      const ok = k.path.endsWith("/") ? published.some((f) => f.startsWith(k.path)) : published.includes(k.path);
      expect(ok, k.path).toBe(true);
    }
  });

  it.skipIf(!existsSync(dotfiles))("tags each skill with the model its file runs on", () => {
    for (const k of skills.filter((x) => !x.path.endsWith("/"))) {
      const model = readFileSync(join(dotfiles, k.path), "utf8").match(/^model: (\w+)$/m)?.[1];
      expect(model, k.name).toBe(k.model.toLowerCase());
    }
  });

  it("names no employer-specific terms", () => {
    const text = JSON.stringify([STAGES, KEYWORDS]).toLowerCase();
    for (const w of ["standard metrics", "quaestor", "linear workspace", "portco", "bugbot"]) expect(text).not.toContain(w);
  });
});

describe("AIToolkit", () => {
  const track = () => screen.getByTestId("ai-diagram").querySelector(".ai-track")!;
  const stageButtons = () => within(track() as HTMLElement).getAllByRole("button");

  it("renders the heading and starts on Plan", () => {
    render(<AIToolkit />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(HEADING);
    expect(card().getAttribute("data-stage")).toBe("plan");
    expect(within(card()).getByText(STAGES[0].summary)).toBeTruthy();
  });

  it("lists the toolkit keywords under the heading", () => {
    render(<AIToolkit />);
    const list = screen.getByRole("list", { name: /skills and tooling/i });
    expect(within(list).getAllByRole("listitem").map((li) => li.textContent)).toEqual([...KEYWORDS]);
  });

  it("shows the model tag beside each skill in the stage card", () => {
    render(<AIToolkit />);
    for (const li of within(card()).getAllByRole("listitem")) {
      const name = within(li).getByRole("link").textContent!.replace(" ↗", "");
      const skill = STAGES[0].skills.find((k) => k.name === name)!;
      expect(li.querySelector(".ai-skill-model")?.textContent).toBe(skill.model);
    }
  });

  it("lists each skill of the stage with its tip, each linking to its file", () => {
    render(<AIToolkit />);
    for (const k of STAGES[0].skills) {
      expect(within(card()).getByText(k.tip)).toBeTruthy();
      expect(within(card()).getByRole("link", { name: new RegExp(k.name) }).getAttribute("href")).toBe(fileUrl(k.path));
    }
  });

  it("shows the five stages in the track as title-only buttons", () => {
    render(<AIToolkit />);
    expect(stageButtons().map((b) => b.textContent?.trim())).toEqual(STAGES.map((s, i) => `${i + 1} ${s.title}`));
    expect(stageButtons()[0].getAttribute("aria-current")).toBe("step");
  });

  it("switches the card when a stage is hovered, focused or clicked", () => {
    render(<AIToolkit />);
    fireEvent.mouseEnter(stageButtons()[1]);
    expect(card().getAttribute("data-stage")).toBe("build");
    fireEvent.focus(stageButtons()[3]);
    expect(card().getAttribute("data-stage")).toBe("learn");
    fireEvent.click(stageButtons()[4]);
    expect(card().getAttribute("data-stage")).toBe("improve");
    expect(stageButtons()[4].getAttribute("aria-current")).toBe("step");
  });

  it("keeps the last hovered stage when the pointer leaves", () => {
    render(<AIToolkit />);
    fireEvent.mouseEnter(stageButtons()[2]);
    fireEvent.mouseLeave(stageButtons()[2]);
    expect(card().getAttribute("data-stage")).toBe("review");
  });

  it("renders the compact strip for narrow screens, and the strip jumps too", () => {
    render(<AIToolkit />);
    const strip = screen.getByTestId("ai-strip");
    expect(within(strip).getAllByRole("button")).toHaveLength(STAGES.length);
    fireEvent.click(within(strip).getByRole("button", { name: /review/i }));
    expect(card().getAttribute("data-stage")).toBe("review");
  });

  it("stacks a hidden copy of every stage behind the card so switching never resizes it", () => {
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

  it("runs no animations, so the panel holds still", () => {
    const css = readFileSync(join(__dirname, "ai-toolkit.css"), "utf8");
    expect(css).not.toMatch(/@keyframes|animation:|transition:/);
  });
});
