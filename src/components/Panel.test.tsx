import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { Panel, Redline } from "./Panel";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

const LAYOUT_PROPS = [
  "display",
  "position",
  "flex-direction",
  "justify-content",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "min-height",
  "width",
  "height",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "gap",
];

function geometry(el: Element) {
  const cs = getComputedStyle(el);
  return LAYOUT_PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";");
}

function setup(extra?: boolean) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  return render(
    <Panel name="Sample" layers="both">
      <p className="a">one</p>
      <p className="b">two</p>
      {extra ? <Redline>note</Redline> : null}
    </Panel>,
  );
}

afterEach(() => {
  document.head.querySelectorAll("style").forEach((s) => s.remove());
});

describe("Panel", () => {
  it("renders identical geometry and border widths in both layers", () => {
    const { container } = setup();
    const sketch = container.querySelector('[data-layer="sketch"]')!;
    const polished = container.querySelector('[data-layer="polished"]')!;
    expect(getComputedStyle(sketch).borderTopWidth).toBe("1.5px");
    expect(getComputedStyle(polished).borderTopWidth).toBe("1.5px");
    expect(getComputedStyle(sketch).borderTopStyle).toBe("dashed");
    expect(getComputedStyle(polished).borderTopStyle).toBe("solid");
    expect(geometry(sketch)).toBe(geometry(polished));
    for (const sel of [".a", ".b", ".panel-tag"]) {
      expect(geometry(sketch.querySelector(sel)!)).toBe(geometry(polished.querySelector(sel)!));
    }
  });

  it("offsets the polished layer by 1px translateZ when both layers render", () => {
    const { container } = setup();
    expect(container.querySelector<HTMLElement>('[data-layer="polished"]')!.style.transform).toBe("translateZ(1px)");
    expect(container.querySelector<HTMLElement>('[data-layer="sketch"]')!.style.transform).toBe("translateZ(0px)");
  });

  it("shows the component tag with z position", () => {
    const { container } = setup();
    expect(container.querySelector(".panel-tag")!.textContent).toBe("<Sample /> z=0");
  });

  it("redline notes are absolutely positioned and do not change sibling layout", () => {
    const first = setup();
    const before = geometry(first.container.querySelector('[data-layer="sketch"] .b')!);
    first.unmount();
    const withNote = setup(true);
    const note = withNote.container.querySelector(".redline")!;
    expect(getComputedStyle(note).position).toBe("absolute");
    expect(geometry(withNote.container.querySelector('[data-layer="sketch"] .b')!)).toBe(before);
  });
});
