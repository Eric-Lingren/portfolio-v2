import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { checkContent, WORD_MIN_OVERRIDES } from "./check-content.mjs";

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

  describe("testimonials cards", () => {
    const mk = (i, over = {}) => ({
      quote: "Fast and careful.",
      roleLabel: "Engineering Manager",
      sourceType: "Slack",
      employer: "Acme",
      year: 2024,
      original: `t${i}`,
      ...over,
    });
    const tRoot = (cards, extra = {}, pngs = cards.map((c) => c.original)) =>
      project({
        "src/content/testimonials.ts": `export const TESTIMONIALS = ${JSON.stringify(cards)};`,
        ...Object.fromEntries(pngs.map((n) => [`public/testimonials/${n}.png`, "x"])),
        ...extra,
      });
    const n = (k) => Array.from({ length: k }, (_, i) => mk(i + 1));
    const strict = (root) => {
      const r = checkContent({ root, strict: true });
      return { rules: r.findings.filter((f) => f.severity === "error").map((f) => f.rule), exitCode: r.exitCode };
    };

    it("passes 4 and 6 cards", () => {
      expect(strict(tRoot(n(4)))).toEqual({ rules: [], exitCode: 0 });
      expect(strict(tRoot(n(6)))).toEqual({ rules: [], exitCode: 0 });
    });

    it.each([0, 3, 5, 7])("fails %i cards", (k) => {
      const r = strict(tRoot(n(k)));
      expect(r.rules).toContain("testimonials-placeholder");
      expect(r.exitCode).toBe(1);
    });

    it("ignores a missing file and fails an unloadable one", () => {
      expect(rules(project({}))).not.toContain("testimonials-placeholder");
      const bad = project({ "src/content/testimonials.ts": "export const TESTIMONIALS = ;;(" });
      expect(strict(bad).rules).toContain("testimonials-placeholder");
    });

    it("fails an original with no PNG and an unused PNG", () => {
      const cards = n(4);
      expect(strict(tRoot(cards, {}, ["t1", "t2", "t3"])).rules).toContain("testimonials-card");
      expect(strict(tRoot(cards, {}, ["t1", "t2", "t3", "t4", "stray"])).rules).toContain("testimonials-card");
    });

    it("enforces 30-word quotes", () => {
      const words = (k) => Array(k).fill("w").join(" ");
      const withQuote = (q) => [mk(1, { quote: q }), ...n(4).slice(1)];
      expect(strict(tRoot(withQuote(words(30)))).rules).toEqual([]);
      expect(strict(tRoot(withQuote(words(31)))).rules).toContain("testimonials-card");
    });

    it("fails empty fields, bad year and bad original", () => {
      for (const over of [{ employer: "" }, { quote: " " }, { year: 2024.5 }, { year: "2024" }, { original: "a/b" }]) {
        const cards = [mk(1, over), ...n(4).slice(1)];
        expect(strict(tRoot(cards, {}, ["t1", "t2", "t3", "t4"])).rules).toContain("testimonials-card");
      }
    });

    it("accepts verbatim highlights and fails any not in the quote", () => {
      const withHl = (h) => [mk(1, { highlights: h }), ...n(4).slice(1)];
      expect(strict(tRoot(withHl(["careful"]))).rules).toEqual([]);
      expect(strict(tRoot(withHl([]))).rules).toEqual([]);
      expect(strict(tRoot(withHl(["careful", "slow"]))).rules).toContain("testimonials-card");
      expect(strict(tRoot(withHl([""]))).rules).toContain("testimonials-card");
      expect(strict(tRoot(withHl("careful"))).rules).toContain("testimonials-card");
    });

    describe("name guard", () => {
      const bl = { "docs/private/testimonials/name-blocklist.txt": "# names\nJane Doe\nEric\n" };
      const withQuote = (q, over = {}) => [mk(1, { quote: q, ...over }), ...n(4).slice(1)];
      it("fails blocklisted names and name-like roleLabels", () => {
        expect(strict(tRoot(withQuote("Jane Doe was great"), bl)).rules).toContain("testimonials-name");
        expect(strict(tRoot(withQuote("ok", { roleLabel: "Jane Doe" }), bl)).rules).toContain("testimonials-name");
        expect(strict(tRoot(withQuote("ok", { roleLabel: "Jane Doe" }))).rules).toContain("testimonials-name");
      });
      it("allows the owner and digits", () => {
        expect(strict(tRoot(withQuote("Eric shipped it, 2x faster"), bl))).toEqual({ rules: [], exitCode: 0 });
        expect(strict(tRoot(withQuote("Eric Lingren shipped it"), bl))).toEqual({ rules: [], exitCode: 0 });
      });
      it("matches whole words only", () => {
        expect(strict(tRoot(withQuote("Janet Doer"), bl)).rules).toEqual([]);
      });
      it.each(["mail a@b.com", "ping @someone", "see https://x.io/a", "see www.x.io"])("fails pattern %s", (q) => {
        expect(strict(tRoot(withQuote(q))).rules).toContain("testimonials-name");
      });
      it("warns and skips terms when the blocklist is absent", () => {
        const r = checkContent({ root: tRoot(withQuote("Jane Doe was great")), strict: true });
        expect(r.exitCode).toBe(0);
        const w = r.findings.find((f) => f.rule === "testimonials-name-blocklist-missing");
        expect(w?.severity).toBe("warn");
        expect(strict(tRoot(withQuote("mail a@b.com"))).exitCode).toBe(1);
      });
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
    const card = (i) =>
      `{ quote: "q", roleLabel: "Engineer", sourceType: "Slack", employer: "Acme", year: 2024, original: "t${i}" }`;
    const r = strictRules({
      ...Object.fromEntries([1, 2, 3, 4].map((i) => [`public/testimonials/t${i}.png`, "x"])),
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

describe("work image and copy gate", () => {
  const strict = (files) => {
    const r = checkContent({ root: project(files), strict: true });
    return {
      rules: r.findings.filter((f) => f.severity === "error").map((f) => f.rule),
      exitCode: r.exitCode,
      findings: r.findings,
    };
  };
  const card = (slug, thumb = `/work/${slug}/thumb.webp`, extra = {}) => ({
    slug,
    title: slug,
    outcome: "Did a thing.",
    number: null,
    numberLabel: "",
    thumbnail: thumb,
    hasThumbnail: true,
    ...extra,
  });
  const cardsJson = (cards) => JSON.stringify(cards);
  const imgs = (...srcs) => JSON.stringify(Object.fromEntries(srcs.map((s) => [s, { width: 10, height: 10 }])));
  const mdx = (tags) => FM + body() + "\n" + tags + "\n";
  const clean = {
    "src/content/work-cards.json": cardsJson([card("kpi-granularity")]),
    "public/work/kpi-granularity/thumb.webp": "x",
    "src/content/work-images.json": imgs("/work/kpi-granularity/a.webp", "/work/kpi-granularity/b.webp"),
    "public/work/kpi-granularity/a.webp": "x",
    "public/work/kpi-granularity/b.webp": "x",
  };
  const goodFigure = '<Figure src="/work/kpi-granularity/a.webp" alt="A chart" caption="A caption" />';
  const goodBA =
    '<BeforeAfter before="/work/kpi-granularity/a.webp" after="/work/kpi-granularity/b.webp" beforeAlt="Old" afterAlt="New" caption="Cap" />';

  it("passes a consistent work tree", () => {
    const r = strict({ ...clean, "content/work/a.mdx": mdx(goodFigure + "\n" + goodBA) });
    expect(r.rules).toEqual([]);
    expect(r.exitCode).toBe(0);
  });

  describe("work-thumbnail-missing", () => {
    it("fails a panel card whose thumbnail file is missing", () => {
      const r = strict({ "src/content/work-cards.json": cardsJson([card("frontend-platform")]) });
      expect(r.rules).toContain("work-thumbnail-missing");
      expect(r.exitCode).toBe(1);
    });

    it("does not check ai-toolkit", () => {
      const r = strict({ "src/content/work-cards.json": cardsJson([card("ai-toolkit")]) });
      expect(r.rules).not.toContain("work-thumbnail-missing");
    });
  });

  describe("work-figure", () => {
    const run = (tags, over = {}) => strict({ ...clean, ...over, "content/work/a.mdx": mdx(tags) });

    it.each([
      ["empty alt", '<Figure src="/work/kpi-granularity/a.webp" alt="" caption="c" />'],
      ["no caption", '<Figure src="/work/kpi-granularity/a.webp" alt="a" />'],
      ["src not in public", '<Figure src="/work/kpi-granularity/zzz.webp" alt="a" caption="c" />'],
      ["expression props and no caption", '<Figure\n  src={"/work/kpi-granularity/a.webp"}\n  alt={"a"}\n/>'],
    ])("fails a Figure with %s", (_n, tags) => {
      expect(run(tags).rules).toContain("work-figure");
    });

    it("fails a src in public but not in work-images.json", () => {
      const r = run('<Figure src="/work/kpi-granularity/c.webp" alt="a" caption="c" />', {
        "public/work/kpi-granularity/c.webp": "x",
      });
      expect(r.findings.some((f) => f.rule === "work-figure" && /work-images\.json/.test(f.message))).toBe(true);
    });

    it("fails a BeforeAfter missing afterAlt", () => {
      const r = run(
        '<BeforeAfter before="/work/kpi-granularity/a.webp" after="/work/kpi-granularity/b.webp" beforeAlt="Old" caption="c" />',
      );
      expect(r.findings.some((f) => f.rule === "work-figure" && f.message.includes("afterAlt"))).toBe(true);
    });

    it("fails a BeforeAfter with a missing file", () => {
      const r = run(
        '<BeforeAfter before="/work/kpi-granularity/a.webp" after="/work/kpi-granularity/nope.webp" beforeAlt="o" afterAlt="n" caption="c" />',
      );
      expect(r.rules).toContain("work-figure");
    });
  });

  describe("work-orphan", () => {
    it("fails an unreferenced file in public/work", () => {
      const r = strict({
        ...clean,
        "content/work/a.mdx": mdx(goodFigure + "\n" + goodBA),
        "public/work/kpi-granularity/stray.webp": "x",
      });
      expect(r.findings.some((f) => f.rule === "work-orphan" && f.message.includes("stray.webp"))).toBe(true);
      expect(r.exitCode).toBe(1);
    });

    it("fails a work-images.json entry with no file", () => {
      const r = strict({
        ...clean,
        "src/content/work-images.json": imgs(
          "/work/kpi-granularity/a.webp",
          "/work/kpi-granularity/b.webp",
          "/work/kpi-granularity/ghost.webp",
        ),
        "content/work/a.mdx": mdx(goodFigure + "\n" + goodBA),
      });
      expect(r.findings.some((f) => f.rule === "work-orphan" && f.message.includes("ghost.webp"))).toBe(true);
    });

    it("counts a file referenced only by a card thumbnail as used", () => {
      const r = strict({
        "src/content/work-cards.json": cardsJson([card("kpi-granularity")]),
        "public/work/kpi-granularity/thumb.webp": "x",
      });
      expect(r.rules).toEqual([]);
    });
  });

  describe("work-internal-url", () => {
    const urls = [
      ["Slack", "https://standard-metrics.slack.com/archives/C1"],
      ["Linear", "https://linear.app/sm/issue/SM-1"],
      ["Notion", "https://app.notion.com/p/abc"],
      ["Quaestor-Technologies", "https://github.com/Quaestor-Technologies/Quaestor-Web/pull/9"],
    ];

    it.each(urls)("fails a %s URL in work MDX", (_n, url) => {
      const r = strict({ ...clean, "content/work/a.mdx": mdx(`See ${url}`) });
      expect(r.rules).toContain("work-internal-url");
    });

    it.each(urls)("fails a %s URL in work-cards.json", (_n, url) => {
      const r = strict({
        ...clean,
        "src/content/work-cards.json": cardsJson([card("kpi-granularity", undefined, { outcome: `See ${url}` })]),
      });
      expect(r.rules).toContain("work-internal-url");
    });
  });

  it("flags an [ERIC: marker in a work-cards.json cardOutcome", () => {
    const r = strict({
      ...clean,
      "src/content/work-cards.json": cardsJson([card("kpi-granularity", undefined, { cardOutcome: "[ERIC: fill this]" })]),
    });
    expect(r.rules).toContain("eric-marker");
    expect(r.exitCode).toBe(1);
  });
});

describe("WORD_MIN_OVERRIDES", () => {
  it("lets a listed slug pass at 450 words while the same count fails without it", () => {
    const files = { "content/work/a.mdx": FM + body(450) };
    expect(WORD_MIN_OVERRIDES).toEqual({});
    expect(rules(project(files))).toContain("word-count");
    WORD_MIN_OVERRIDES.t = 450;
    try {
      expect(rules(project(files))).not.toContain("word-count");
    } finally {
      delete WORD_MIN_OVERRIDES.t;
    }
  });
});
