#!/usr/bin/env node
// Content hygiene checker for case studies and site copy.
// Usage: node scripts/check-content.mjs [--strict] [--root <dir>]
// Default mode warns on everything and exits 0. --strict (the production launch
// gate) exits 1 on STRICT_RULES: unresolved [ERIC: markers, testimonial
// placeholders, internal links, phone numbers, and PR/file/line count claims in
// headline-class copy. Structure rules (sections, word count, frontmatter keys)
// stay warnings. Case-study rules apply to content/work/*.mdx.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

export const REQUIRED_SECTIONS = [
  "Context",
  "Problem",
  "My role",
  "Key decisions",
  "Impact",
  "What I'd do next",
];
export const REQUIRED_FRONTMATTER = [
  "title",
  "slug",
  "role",
  "timeline",
  "stack",
  "outcomes",
  "cardOutcome",
  "cardNumber",
  "cardNumberLabel",
  "thumbnail",
  "order",
];
export const WORD_MIN = 600;
export const WORD_MAX = 900;

const SCAN_DIRS = ["content", "src/content", "src/components/panels"];
export const STRICT_RULES = new Set([
  "eric-marker",
  "testimonials-placeholder",
  "internal-link",
  "phone",
  "myfxbook",
  "blocklist",
  "headline-count",
]);
// Case study frontmatter keys that surface as headlines or card copy.
const HEADLINE_KEYS = new Set(["title", "cardOutcome", "cardNumber", "cardNumberLabel", "outcomes"]);
// Files whose whole text is headline-class copy (pillars, Experience, resume).
const HEADLINE_FILES = new Set([
  "src/content/positioning.ts",
  "src/content/experience.ts",
  "content/resume/resume.mdx",
]);
const isTestFile = (file) => /\.test\.[cm]?[jt]sx?$/.test(file);
const TEXT_EXT = new Set([".md", ".mdx", ".ts", ".tsx", ".json", ".txt"]);

const LINK_PATTERNS = [
  [/github\.com\/(?!Eric-Lingren(?:[/\s"')\]]|$))[\w.-]+/i, "private/other github org link"],
  [/linear\.app/i, "linear.app link"],
  [/notion\.so/i, "notion.so link"],
  [/slack\.com/i, "slack.com link"],
  [/localhost/i, "localhost link"],
];
const PHONE = /(?<!\d)(?:\+?\d{1,2}[\s.-])?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/;
const COUNT_PHRASE =
  /\b\d[\d,]*\s*(?:PRs?|pull requests?|files?|lines?(?:\s+of\s+code)?|LOC|commits?)\b/i;

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (TEXT_EXT.has(path.extname(entry.name)) && !isTestFile(entry.name)) out.push(full);
  }
  return out;
}

function readBlocklist(root) {
  const file = path.join(root, "docs/private/blocklist.txt");
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

function isCaseStudy(root, file) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  return /^content\/work\/[^/]+\.mdx$/.test(rel);
}

function hasSection(body, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['\u2019]");
  return new RegExp(`^#{2,3}\\s+${escaped}\\s*$`, "mi").test(body);
}

export function checkContent({ root = process.cwd(), strict = false } = {}) {
  const findings = [];
  const blocklist = readBlocklist(root);
  const add = (file, line, rule, message) =>
    findings.push({
      file: path.relative(root, file).split(path.sep).join("/"),
      line,
      rule,
      message,
      severity: STRICT_RULES.has(rule) ? "error" : "warn",
    });

  for (const dir of SCAN_DIRS) {
    for (const file of walk(path.join(root, dir))) {
      const raw = fs.readFileSync(file, "utf8");
      const lines = raw.split("\n");
      const rel = path.relative(root, file).split(path.sep).join("/");
      lines.forEach((text, i) => {
        const n = i + 1;
        if (HEADLINE_FILES.has(rel) && COUNT_PHRASE.test(text)) {
          add(file, n, "headline-count", "PR/file/line counts are not impact; keep them out of headline copy");
        }
        if (text.includes("[ERIC:")) add(file, n, "eric-marker", "unresolved [ERIC: marker");
        for (const [re, label] of LINK_PATTERNS) {
          if (re.test(text)) add(file, n, "internal-link", label);
        }
        if (PHONE.test(text)) add(file, n, "phone", "phone-number pattern");
        if (/myfxbook/i.test(text)) add(file, n, "myfxbook", "myfxbook mention");
        for (const word of blocklist) {
          if (text.toLowerCase().includes(word.toLowerCase())) {
            add(file, n, "blocklist", "blocklisted name");
          }
        }
      });

      if (!isCaseStudy(root, file)) continue;
      let parsed;
      try {
        parsed = matter(raw);
      } catch {
        add(file, 1, "frontmatter", "frontmatter failed to parse");
        continue;
      }
      const fmLines = raw.startsWith("---")
        ? lines.findIndex((l, i) => i > 0 && l.trim() === "---") + 1
        : 0;
      for (const key of REQUIRED_FRONTMATTER) {
        if (!(key in parsed.data)) {
          add(file, 1, "frontmatter", `missing summary frontmatter: ${key}`);
        }
      }
      let key = null;
      for (let i = 0; i < fmLines; i++) {
        const m = /^([A-Za-z]\w*):/.exec(lines[i]);
        if (m) key = m[1];
        if (key && HEADLINE_KEYS.has(key) && COUNT_PHRASE.test(lines[i])) {
          add(file, i + 1, "headline-count", `count claim in ${key}; counts belong in body text only`);
        }
      }
      for (const section of REQUIRED_SECTIONS) {
        if (!hasSection(parsed.content, section)) {
          add(file, fmLines + 1, "section", `missing required section: ${section}`);
        }
      }
      const words = parsed.content.split(/\s+/).filter(Boolean).length;
      if (words < WORD_MIN || words > WORD_MAX) {
        add(
          file,
          fmLines + 1,
          "word-count",
          `body is ${words} words (expected ${WORD_MIN}-${WORD_MAX})`,
        );
      }
    }
  }

  const manifest = path.join(root, "src/content/testimonials.ts");
  if (fs.existsSync(manifest)) {
    const count = (fs.readFileSync(manifest, "utf8").match(/\boriginal\s*:\s*["'`]/g) ?? []).length;
    if (count < 4 || count > 6) {
      add(
        manifest,
        1,
        "testimonials-placeholder",
        `testimonials has ${count} card(s); placeholders render until it has 4-6`,
      );
    }
  }

  const errors = findings.filter((f) => f.severity === "error");
  return { findings, exitCode: strict && errors.length > 0 ? 1 : 0 };
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const rootIdx = args.indexOf("--root");
  const root = rootIdx >= 0 ? path.resolve(args[rootIdx + 1]) : process.cwd();
  const { findings, exitCode } = checkContent({ root, strict });
  for (const f of findings) {
    const tag = f.severity === "error" && strict ? "error" : "warn";
    console.log(`${f.file}:${f.line} ${tag} [${f.rule}] ${f.message}`);
  }
  console.log(`content:check ${findings.length} finding(s)${strict ? " (strict)" : ""}`);
  process.exit(exitCode);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
