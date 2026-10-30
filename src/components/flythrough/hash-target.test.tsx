import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlatStack } from "./FlatStack";
import { FlyStage } from "./FlyStage";
import { panelScrollTop } from "./camera";
import { setActiveSection } from "../active-section";
import { hashPanelIndex, initialScrollTop, writeSectionHash } from "./hash-target";
import { PANELS } from "./registry";

const COUNT = PANELS.length;
const WORK = PANELS.findIndex((p) => p.id === "work");

afterEach(() => {
  setActiveSection(null);
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

describe("FlyStage anchor click", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList) as unknown as typeof window.matchMedia;
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  const click = (href: string) => {
    const a = document.createElement("a");
    a.setAttribute("href", href);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  it("writes the clicked panel's hash to the URL", () => {
    window.history.replaceState({}, "", "/#work");
    render(<FlyStage />);
    click("#contact");
    expect(window.location.hash).toBe("#contact");
    click("#hero");
    expect(window.location.hash).toBe("");
    click("#work");
    expect(window.location.hash).toBe("#work");
  });

  it("replaces the history entry instead of pushing one", () => {
    window.history.replaceState({}, "", "/");
    render(<FlyStage />);
    const before = window.history.length;
    click("#work");
    expect(window.history.length).toBe(before);
  });
});

describe("writeSectionHash", () => {
  it("writes #id for a panel and clears the hash for the hero, keeping path and query", () => {
    window.history.replaceState({}, "", "/?view=classic#work");
    writeSectionHash("contact");
    expect(window.location.search).toBe("?view=classic");
    expect(window.location.hash).toBe("#contact");
    writeSectionHash("hero");
    expect(window.location.pathname + window.location.search + window.location.hash).toBe("/?view=classic");
  });

  it("never adds a history entry", () => {
    const before = window.history.length;
    writeSectionHash("work");
    writeSectionHash("contact");
    expect(window.history.length).toBe(before);
  });
});

describe("FlyStage scroll hash", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList) as unknown as typeof window.matchMedia;
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("follows the active section", () => {
    window.history.replaceState({}, "", "/#work");
    render(<FlyStage />);
    act(() => setActiveSection("contact"));
    expect(window.location.hash).toBe("#contact");
    act(() => setActiveSection("hero"));
    expect(window.location.hash).toBe("");
  });

  it("stops following after unmount", () => {
    const { unmount } = render(<FlyStage />);
    unmount();
    act(() => setActiveSection("contact"));
    expect(window.location.hash).toBe("");
  });
});

describe("FlatStack scroll hash", () => {
  let fire: (id: string) => void = () => {};
  beforeEach(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          fire = (id) =>
            cb([{ isIntersecting: true, target: document.getElementById(id)! } as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver);
        }
        observe() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("writes the section crossing the middle of the viewport to the hash", () => {
    Element.prototype.scrollIntoView = vi.fn();
    window.history.replaceState({}, "", "/#work");
    render(<FlatStack />);
    act(() => fire("experience"));
    expect(window.location.hash).toBe("#experience");
    act(() => fire("hero"));
    expect(window.location.hash).toBe("");
  });
});
