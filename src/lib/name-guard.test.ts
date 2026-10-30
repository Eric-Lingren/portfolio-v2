// @vitest-environment node
import { describe, expect, it } from "vitest";
// @ts-expect-error untyped .mjs script
import { looksLikePersonalName } from "../../scripts/name-guard.mjs";

describe("looksLikePersonalName", () => {
  it("flags names and blocklisted terms, allows roles", () => {
    expect(looksLikePersonalName("Jane Doe")).toBe(true);
    expect(looksLikePersonalName("Role Label", ["label"])).toBe(true);
    expect(looksLikePersonalName("Staff Engineer")).toBe(false);
    expect(looksLikePersonalName("Former manager")).toBe(false);
  });
});
