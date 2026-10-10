import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildResumeHtml, countPdfPages, loadResume } from "./build-resume.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PDF = path.join(ROOT, "public/eric-lingren-resume.pdf");
const SOURCE = fs.readFileSync(path.join(ROOT, "content/resume/resume.mdx"), "utf8");

describe("resume content", () => {
  const html = buildResumeHtml();
  const text = `${SOURCE}\n${html}`;

  it("has no phone number", () => {
    expect(text).not.toMatch(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/);
    expect(text).not.toMatch(/\+\d[\d\s().-]{8,}/);
  });

  it("has no town and no pre-engineering career", () => {
    expect(text).not.toMatch(/trucking|truck driver|tech sales|account management|pre-engineering/i);
    // The town itself is deliberately not written down; this guards "City, ST" patterns.
    expect(text).not.toMatch(/\b[A-Z][a-z]+,\s(?:CA|OR|WA|NV|AZ|UT|ID|TX|CO)\b/);
  });

  it("has no PR, file, or line count phrases", () => {
    expect(text).not.toMatch(/\b\d[\d,]*\+?\s+(?:PRs?|pull requests?|files?|lines?(?: of code)?|commits?)\b/i);
    expect(text).not.toMatch(/\b(?:LOC|lines of code)\b/i);
  });

  it("positions as frontend-first and reuses the experience roles", () => {
    const data = loadResume();
    expect(data.headline).toMatch(/frontend-first/i);
    expect(data.headline).not.toMatch(/backend/i);
    expect(html).toContain("Standard Metrics");
    expect(html).toContain("Mar 2022 to present");
  });

  it("marks the cross-check with an ERIC marker", () => {
    expect(SOURCE).toContain("[ERIC: cross-check against LinkedIn export and 2022 resume]");
  });
});

// Cheap: parses the committed PDF. The build script itself asserts one page when regenerating.
describe.skipIf(!fs.existsSync(PDF))("resume PDF", () => {
  it("is exactly one page", async () => {
    expect(await countPdfPages(fs.readFileSync(PDF))).toBe(1);
  });
});
