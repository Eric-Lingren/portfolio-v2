import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RenderModeContext } from "@/components/flythrough/render-mode";
import { setStageScroll, stepFromProgress } from "@/components/flythrough/dwell-store";
import { panelScrollProgress } from "@/components/flythrough/camera";
import { FLY_CONFIG } from "@/components/flythrough/config";
import { ALL_STEPS, FEEDBACK_EDGE, INTRO, LEARNING_LOOP, NODES, REVIEW, STEPS, fileUrl, nodeById } from "@/content/ai-toolkit";
import { AIToolkit, stepState } from "./AIToolkit";

const COUNT = 7;
const INDEX = 2;
const Z = -INDEX * FLY_CONFIG.depth;

afterEach(() => setStageScroll(0, 1));

describe("diagram data", () => {
  it("has 4 to 6 forward steps plus a learning-loop feedback edge back to the first", () => {
    expect(STEPS.length).toBeGreaterThanOrEqual(4);
    expect(STEPS.length).toBeLessThanOrEqual(6);
    expect(FEEDBACK_EDGE.from).toBe(LEARNING_LOOP.id);
    expect(FEEDBACK_EDGE.to).toBe(STEPS[0].id);
    expect(ALL_STEPS.at(-1)).toBe(LEARNING_LOOP);
  });

  it("references only known nodes, each used once, with a valid tier", () => {
    const used = ALL_STEPS.flatMap((s) => s.nodes);
    expect(new Set(used).size).toBe(used.length);
    for (const id of used) expect(NODES.some((n) => n.id === id)).toBe(true);
    for (const n of NODES) expect(["Haiku", "Sonnet", "Opus"]).toContain(n.tier);
  });

  it("links every node under the dotfiles repo", () => {
    for (const n of NODES) {
      expect(fileUrl(n.path).startsWith("https://github.com/Eric-Lingren/dotfiles/")).toBe(true);
    }
  });

  const dotfiles = join(homedir(), ".dotfiles");
  it.skipIf(!existsSync(dotfiles))("points each link at a file that exists locally", () => {
    for (const n of NODES) expect(existsSync(join(dotfiles, n.path))).toBe(true);
  });

  it("names no employer-specific terms", () => {
    const text = JSON.stringify([NODES, ALL_STEPS, INTRO]).toLowerCase();
    for (const w of ["standard metrics", "quaestor", "linear workspace"]) expect(text).not.toContain(w);
  });

  it("flags unconfirmed copy for content:check", () => {
    expect(REVIEW.length).toBeGreaterThan(0);
    expect(REVIEW.every((r) => r.startsWith("[ERIC:"))).toBe(true);
  });
});

describe("scroll-step functions", () => {
  it("stepFromProgress maps dwell progress to a step and clamps", () => {
    expect(stepFromProgress(0, 7)).toBe(0);
    expect(stepFromProgress(0.5, 7)).toBe(3);
    expect(stepFromProgress(0.999, 7)).toBe(6);
    expect(stepFromProgress(1, 7)).toBe(6);
    expect(stepFromProgress(-1, 7)).toBe(0);
    expect(stepFromProgress(5, 7)).toBe(6);
    expect(stepFromProgress(0.7, 1)).toBe(0);
  });

  it("stepFromProgress is monotonic and visits every step", () => {
    const seen = new Set<number>();
    let prev = 0;
    for (let k = 0; k <= 1000; k++) {
      const s = stepFromProgress(k / 1000, 7);
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
      seen.add(s);
    }
    expect(seen.size).toBe(7);
  });

  it("stepState marks earlier steps done, the current active, later upcoming", () => {
    expect([0, 1, 2, 3].map((i) => stepState(i, 2))).toEqual(["done", "done", "active", "upcoming"]);
    expect(stepState(6, ALL_STEPS.length)).toBe("done");
  });
});

describe("AIToolkit", () => {
  it("renders every step and node in reading order", () => {
    const { container } = render(<AIToolkit />);
    const ids = [...container.querySelectorAll("[data-step]")].map((el) => el.getAttribute("data-step"));
    expect(ids).toEqual(ALL_STEPS.map((s) => s.id));
    expect(container.querySelectorAll("[data-node]")).toHaveLength(ALL_STEPS.flatMap((s) => s.nodes).length);
    expect(screen.getByTestId("ai-diagram")).toBeTruthy();
    expect(screen.getByTestId("ai-feedback-edge").getAttribute("data-to")).toBe(STEPS[0].id);
  });

  it("makes each node a button with an accessible name and a tier badge", () => {
    render(<AIToolkit />);
    for (const n of NODES) {
      const btn = screen.getByRole("button", { name: new RegExp(`^${n.name}\\s*${n.tier}$`, "i") });
      expect(btn.tagName).toBe("BUTTON");
    }
  });

  it("opens and closes the inspect panel with tier, inputs/outputs and a dotfiles link", () => {
    render(<AIToolkit />);
    expect(screen.queryByTestId("ai-inspect")).toBeNull();
    const node = nodeById("tdd");
    const btn = screen.getByRole("button", { name: /^tdd/ });
    fireEvent.click(btn);
    const panel = screen.getByTestId("ai-inspect");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(within(panel).getByText(node.tier)).toBeTruthy();
    expect(within(panel).getByText("Inputs")).toBeTruthy();
    expect(within(panel).getByText("Outputs")).toBeTruthy();
    for (const x of [...node.inputs, ...node.outputs]) expect(within(panel).getByText(x)).toBeTruthy();
    const link = within(panel).getByRole("link") as HTMLAnchorElement;
    expect(link.href.startsWith("https://github.com/Eric-Lingren/dotfiles/")).toBe(true);
    fireEvent.click(within(panel).getByRole("button", { name: "Close" }));
    expect(screen.queryByTestId("ai-inspect")).toBeNull();
    fireEvent.click(btn);
    fireEvent.keyDown(screen.getByTestId("ai-inspect"), { key: "Escape" });
    expect(screen.queryByTestId("ai-inspect")).toBeNull();
  });

  it("every node opens an inspect panel with a dotfiles URL", () => {
    render(<AIToolkit />);
    for (const n of NODES) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${n.name}\\s*${n.tier}$`, "i") }));
      const link = within(screen.getByTestId("ai-inspect")).getByRole("link") as HTMLAnchorElement;
      expect(link.href.startsWith("https://github.com/Eric-Lingren/dotfiles/")).toBe(true);
    }
  });

  it("links to the case study", () => {
    render(<AIToolkit />);
    expect(screen.getByRole("link", { name: /case study/i }).getAttribute("href")).toBe("/work/ai-toolkit");
  });

  it("complete mode (default) shows all steps done with no scroll stepping", () => {
    const { container } = render(<AIToolkit />);
    act(() => setStageScroll(0, COUNT)); // scroll position must not matter
    const states = [...container.querySelectorAll("[data-step]")].map((el) => el.getAttribute("data-state"));
    expect(states).toEqual(ALL_STEPS.map(() => "done"));
  });

  it("staged mode steps with scroll through the dwell", () => {
    const { container } = render(
      <RenderModeContext.Provider value="staged">
        <AIToolkit z={Z} />
      </RenderModeContext.Provider>,
    );
    const active = () => container.querySelector('[data-state="active"]')?.getAttribute("data-step");
    const start = panelScrollProgress(INDEX, COUNT);
    const span = FLY_CONFIG.dwell[INDEX] / (COUNT - 1 + FLY_CONFIG.dwell[INDEX]);
    act(() => setStageScroll(start, COUNT));
    expect(active()).toBe(ALL_STEPS[0].id);
    act(() => setStageScroll(start + span * 0.5, COUNT));
    expect(active()).toBe(ALL_STEPS[3].id);
    act(() => setStageScroll(start + span, COUNT));
    expect(active()).toBe(LEARNING_LOOP.id);
    act(() => setStageScroll(start + span * 0.5, COUNT));
    expect(active()).toBe(ALL_STEPS[3].id); // reversible
    // every step stays in the DOM regardless
    expect(container.querySelectorAll("[data-step]")).toHaveLength(ALL_STEPS.length);
  });
});
