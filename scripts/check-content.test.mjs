import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { checkContent } from "./check-content.mjs";

const SECTIONS = ["Context", "Problem", "My role", "Key decisions", "Impact", "What I'd do next"];
const FM = `---
title: T
slug: t
role: Lead
timeline: 2024
stack: [a]
outcomes: [b]
cardOutcome: c
cardNumber: null
cardNumberLabel: x
thumbnail: /t.png
order: 1
---
`;

function body(words = 700, extra = "") {
  const per = Math.floor(words / SECTIONS.length);
  return SECTIONS.map((s) => `## ${s}\n\n${"word ".repeat(per)}${extra}\n`).join("\n");
}

const dirs = [];
function project(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cc-"));
  dirs.push(root);
  for (const [rel, text] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, text);
  }
  return root;
}
afterEach(() => {
  while (dirs.length) fs.rmSync(dirs.pop(), { recursive: true, force: true });
});

const rules = (root) => checkContent({ root }).findings.map((f) => f.rule);

describe("check-content rules", () => {
  it("passes a clean case study", () => {
    const root = project({ "content/work/a.mdx": FM + body() });
    expect(checkContent({ root }).findings).toEqual([]);
  });

  it("flags [ERIC: markers with file:line", () => {
    const root = project({ "content/work/a.mdx": FM + body(700, "[ERIC: fill]") });
    const f = checkContent({ root }).findings.find((x) => x.rule === "eric-marker");
    expect(f?.file).toBe("content/work/a.mdx");
    expect(f?.line).toBeGreaterThan(12);
  });

  it.each([
    ["github org", "see https://github.com/acme-private/repo", "internal-link"],
    ["linear", "https://linear.app/x/issue/1", "internal-link"],
    ["notion", "https://notion.so/page", "internal-link"],
    ["slack", "https://team.slack.com/x", "internal-link"],
    ["localhost", "http://localhost:3000", "internal-link"],
    ["phone", "call 555-123-4567", "phone"],
    ["myfxbook", "Myfxbook stats", "myfxbook"],
  ])("flags %s", (_n, text, rule) => {
    const root = project({ "src/content/x.md": text });
    expect(rules(root)).toContain(rule);
  });

  describe("testimonials manifest", () => {
    const card = (i) => `{ quote: "q", roleLabel: "Engineer", sourceType: "Slack", employer: "Acme", year: 2024, original: "t${i}" }`;
    const manifestRoot = (entries) =>
      project({ "src/content/testimonials.ts": `export const TESTIMONIALS = [${entries.join(",")}];` });

    it("flags an empty manifest as a strict error", () => {
      const root = manifestRoot([]);
      const f = checkContent({ root, strict: true });
      expect(f.findings.map((x) => x.rule)).toContain("testimonials-placeholder");
      expect(f.exitCode).toBe(1);
    });

    it("flags a manifest outside 4-6 cards", () => {
      expect(rules(manifestRoot([card(1), card(2), card(3)]))).toContain("testimonials-placeholder");
      expect(rules(manifestRoot([1, 2, 3, 4, 5, 6, 7].map(card)))).toContain("testimonials-placeholder");
    });

    it("accepts 4-6 cards and ignores a missing manifest", () => {
      const ok = manifestRoot([1, 2, 3, 4].map(card));
      expect(checkContent({ root: ok, strict: true }).exitCode).toBe(0);
      expect(rules(project({}))).not.toContain("testimonials-placeholder");
    });
  });

  it("allows github.com/Eric-Lingren links", () => {
    const root = project({ "src/content/x.md": "https://github.com/Eric-Lingren/portfolio" });
    expect(rules(root)).not.toContain("internal-link");
  });

  it("flags missing sections", () => {
    const root = project({ "content/work/a.mdx": FM + body().replace("## Impact", "## Other") });
    const msgs = checkContent({ root }).findings.filter((f) => f.rule === "section");
    expect(msgs.map((m) => m.message).join()).toContain("Impact");
  });

  it("flags word counts outside 600-900", () => {
    expect(rules(project({ "content/work/a.mdx": FM + body(200) }))).toContain("word-count");
    expect(rules(project({ "content/work/a.mdx": FM + body(1500) }))).toContain("word-count");
  });

  it("flags missing summary frontmatter", () => {
    const fm = FM.replace("role: Lead\n", "");
    const root = project({ "content/work/a.mdx": fm + body() });
    expect(rules(root)).toContain("frontmatter");
  });

  it("flags counts in frontmatter but allows them in body", () => {
    const fm = FM.replace("cardOutcome: c", "cardOutcome: Shipped 120 PRs");
    expect(rules(project({ "content/work/a.mdx": fm + body() }))).toContain("headline-count");
    const ok = project({ "content/work/a.mdx": FM + body(700, "Touched 40 files.") });
    expect(rules(ok)).not.toContain("headline-count");
  });

  it("uses git-ignored blocklist when present", () => {
    const root = project({
      "docs/private/blocklist.txt": "# names\nAcme Corp\n",
      "src/content/x.md": "worked with acme corp",
    });
    expect(rules(root)).toContain("blocklist");
  });
});

describe("check-content modes", () => {
  const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "check-content.mjs");

  it("default mode warns on [ERIC: and exits 0", () => {
    const root = project({ "content/a.md": "[ERIC: todo]" });
    const out = execFileSync("node", [script, "--root", root]).toString();
    expect(out).toContain("content/a.md:1");
  });

  it("--strict exits non-zero on [ERIC:", () => {
    const root = project({ "content/a.md": "[ERIC: todo]" });
    const r = spawnSync("node", [script, "--strict", "--root", root]);
    expect(r.status).toBe(1);
  });

  it("--strict does not fail on structure-only warnings", () => {
    const root = project({ "content/work/a.mdx": FM + body(200) });
    const r = spawnSync("node", [script, "--strict", "--root", root]);
    expect(r.status).toBe(0);
  });

  it("--strict reports file:line for every violation", () => {
    const root = project({
      "content/a.md": "ok\n[ERIC: todo]\ncall 555-123-4567\nhttp://localhost:3000",
    });
    const r = spawnSync("node", [script, "--strict", "--root", root]);
    expect(r.status).toBe(1);
    const out = r.stdout.toString();
    expect(out).toContain("content/a.md:2 error [eric-marker]");
    expect(out).toContain("content/a.md:3 error [phone]");
    expect(out).toContain("content/a.md:4 error [internal-link]");
  });
});

describe("strict launch gate", () => {
  const strictRules = (files) => {
    const r = checkContent({ root: project(files), strict: true });
    return { rules: r.findings.filter((f) => f.severity === "error").map((f) => f.rule), exitCode: r.exitCode };
  };

  it("passes a fully clean tree", () => {
    const card = (i) => `{ original: "t${i}" }`;
    const r = strictRules({
      "content/work/a.mdx": FM + body(),
      "src/content/testimonials.ts": `export const TESTIMONIALS = [${[1, 2, 3, 4].map(card).join(",")}];`,
      "src/content/positioning.ts": 'export const A = "Plain sentence.";',
    });
    expect(r).toEqual({ rules: [], exitCode: 0 });
  });

  it.each([
    ["eric marker in json", { "src/content/work-cards.json": '{"note":"[ERIC: confirm card copy]"}' }, "eric-marker"],
    ["panel component marker", { "src/components/panels/X.tsx": "<p>[ERIC: fix]</p>" }, "eric-marker"],
    ["resume marker", { "content/resume/resume.mdx": "- Cut render time on [ERIC: what]." }, "eric-marker"],
    ["placeholder testimonials", { "src/content/testimonials.ts": "export const TESTIMONIALS = [];" }, "testimonials-placeholder"],
    ["internal link", { "src/components/panels/X.tsx": '<a href="https://linear.app/x">x</a>' }, "internal-link"],
    ["phone", { "content/resume/resume.mdx": "Call (555) 123-4567" }, "phone"],
    ["count in positioning", { "src/content/positioning.ts": 'const a = "Merged 300 PRs";' }, "headline-count"],
    ["count in experience", { "src/content/experience.ts": 'text: "Touched 40 files",' }, "headline-count"],
    ["count in resume", { "content/resume/resume.mdx": "- Wrote 20,000 lines of code" }, "headline-count"],
    ["count in title", { "content/work/a.mdx": FM.replace("title: T", "title: 90 PRs later") + body() }, "headline-count"],
    [
      "count in outcomes list",
      { "content/work/a.mdx": FM.replace("outcomes: [b]", "outcomes:\n  - 12 commits") + body() },
      "headline-count",
    ],
  ])("fails on %s", (_n, files, rule) => {
    const r = strictRules(files);
    expect(r.rules).toContain(rule);
    expect(r.exitCode).toBe(1);
  });

  it("ignores test files and counts outside headline fields", () => {
    const r = strictRules({
      "src/components/panels/X.test.tsx": "[ERIC: in a test] 555-123-4567",
      "src/content/ai-toolkit.ts": 'const a = "Touched 40 files";',
    });
    expect(r).toEqual({ rules: [], exitCode: 0 });
  });
});
