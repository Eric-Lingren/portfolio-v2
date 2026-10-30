import { readFileSync } from "node:fs";
import { BRAND_MARK_RECTS } from "./BrandMark";

describe("BrandMark", () => {
  it("draws the same bars as the favicon", () => {
    const svg = readFileSync("src/app/icon.svg", "utf8");
    const rects = [
      ...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[0-9a-f]+)"\/>/g),
    ].map(([, x, y, width, height, fill]) => ({ x: +x, y: +y, width: +width, height: +height, fill }));
    expect(rects).toEqual(BRAND_MARK_RECTS);
  });
});
