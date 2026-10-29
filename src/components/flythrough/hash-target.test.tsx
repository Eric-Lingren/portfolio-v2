import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlatStack } from "./FlatStack";
import { FlyStage } from "./FlyStage";
import { panelScrollTop } from "./camera";
import { hashPanelIndex, initialScrollTop } from "./hash-target";
import { PANELS } from "./registry";

const COUNT = PANELS.length;
const WORK = PANELS.findIndex((p) => p.id === "work");

afterEach(() => {
  window.history.replaceState({}, "", "/");
  vi.restoreAllMocks();
});

describe("hashPanelIndex", () => {
  it("maps a registry id to its index and ignores everything else", () => {
    expect(WORK).toBeGreaterThan(0);
    expect(hashPanelIndex("#work")).toBe(WORK);
    expect(hashPanelIndex("#hero")).toBe(0);
    expect(hashPanelIndex("#nope")).toBe(-1);
    expect(hashPanelIndex("")).toBe(-1);
    expect(hashPanelIndex("#")).toBe(-1);
  });
});

describe("initialScrollTop", () => {
  it("is the registry index's panelScrollTop for a known hash", () => {
    expect(initialScrollTop("#work", COUNT, 800)).toBe(panelScrollTop(WORK, COUNT, 800));
    expect(initialScrollTop("#work", COUNT, 800)).toBeGreaterThan(0);
  });
  it("is the top for an unknown or empty hash", () => {
    expect(initialScrollTop("#unknown", COUNT, 800)).toBe(0);
    expect(initialScrollTop("", COUNT, 800)).toBe(0);
  });
});

describe("FlyStage initial scroll", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList) as unknown as typeof window.matchMedia;
  });

  it("jumps to the panel's stop with no animation for #work", () => {
    window.history.replaceState({}, "", "/#work");
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<FlyStage />);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({
      top: panelScrollTop(WORK, COUNT, window.innerHeight),
      left: 0,
      behavior: "instant",
    });
  });

  it("leaves the scroll at the top for an unknown hash", () => {
    window.history.replaceState({}, "", "/#unknown");
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<FlyStage />);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe("FlatStack hash", () => {
  it("has an element with id work and scrolls it into view for #work", () => {
    window.history.replaceState({}, "", "/#work");
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const { container } = render(<FlatStack />);
    const el = container.querySelector("#work");
    expect(el).not.toBeNull();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(el);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "start" });
  });

  it("ignores an unknown hash", () => {
    window.history.replaceState({}, "", "/#unknown");
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<FlatStack />);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
