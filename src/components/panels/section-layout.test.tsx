import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { AIToolkit } from "./AIToolkit";
import { Contact } from "./Contact";
import { Experience } from "./Experience";
import { SelectedWork } from "./SelectedWork";
import { Testimonials } from "./Testimonials";
import { WhatIDo } from "./WhatIDo";

const PANELS: [string, ReactElement][] = [
  ["WhatIDo", <WhatIDo key="w" />],
  ["SelectedWork", <SelectedWork key="s" />],
  ["AIToolkit", <AIToolkit key="a" />],
  ["Experience", <Experience key="e" />],
  ["Testimonials", <Testimonials key="t" />],
  ["Contact", <Contact key="c" />],
];

describe("standard section layout", () => {
  it.each(PANELS)("%s is a .section whose first block holds its single .section-title", (_, panel) => {
    const { container } = render(panel);
    const section = container.querySelector(".panel-layer > .section")!;
    expect(section).not.toBeNull();
    const titles = section.querySelectorAll("h2");
    expect(titles).toHaveLength(1);
    expect(titles[0]).toHaveClass("section-title");
    // The title is the section's first block, alone or inside a .section-head with its subline.
    const first = section.firstElementChild!;
    expect(first === titles[0] || (first.classList.contains("section-head") && first.firstElementChild === titles[0])).toBe(true);
  });

  it.each(PANELS)("%s puts its buttons in a .section-actions row", (_, panel) => {
    const { container } = render(panel);
    for (const btn of container.querySelectorAll(".btn")) {
      expect(btn.parentElement).toHaveClass("section-actions");
    }
  });

  it("leaves section titles and button sizing to globals.css", () => {
    const dir = join(process.cwd(), "src/components/panels");
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".css"))) {
      const css = readFileSync(join(dir, file), "utf8");
      expect(css, file).not.toMatch(/section-title/);
      expect(css, file).not.toMatch(/\.btn\s*\{/);
    }
  });
});
