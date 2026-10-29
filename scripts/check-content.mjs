#!/usr/bin/env node
// Content hygiene checker for case studies and site copy.
// Usage: node scripts/check-content.mjs [--strict] [--root <dir>]
// Default mode warns on everything and exits 0. --strict (the production launch
// gate) exits 1 on STRICT_RULES: unresolved [ERIC: markers, testimonial
// problems, internal links, phone numbers, and PR/file/line count claims in
// headline-class copy.
// Testimonials: src/content/testimonials.ts is loaded as data (child node
// process, native TS stripping). Checks: 4 or 6 cards (testimonials-placeholder);
// each card has non-empty quote/roleLabel/sourceType/employer, an integer year,
// an `original` matching [A-Za-z0-9_-]+ that resolves to
// public/testimonials/<original>.png, a quote of 30 words or fewer, an optional
// highlight that appears verbatim in the quote, and every
// PNG in public/testimonials/ is used by a card (testimonials-card); name guard
// on roleLabel and quote text plus email/@handle/URL patterns in quotes, using
// docs/private/testimonials/name-blocklist.txt (testimonials-name). The owner's
// own name is always allowed. A missing blocklist skips term matching with a
// warning; pattern checks still run. Structure rules (sections, word count, frontmatter keys)
// stay warnings. Case-study rules apply to content/work/*.mdx.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";
import { looksLikePersonalName } from "./name-guard.mjs";
import { CARD_SLUGS } from "./generate-work-cards.mjs";

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
// Per-slug lower bound overrides (slug -> number). Empty until a page is cut
// below WORD_MIN on purpose; the word-count check uses `override ?? WORD_MIN`.
export const WORD_MIN_OVERRIDES = {};
export const wordMinFor = (slug) => WORD_MIN_OVERRIDES[slug] ?? WORD_MIN;

const SCAN_DIRS = ["content", "src/content", "src/components/panels"];
export const STRICT_RULES = new Set([
  "eric-marker",
  "testimonials-placeholder",
  "testimonials-card",
  "testimonials-name",
  "internal-link",
  "phone",
  "myfxbook",
  "blocklist",
  "headline-count",
  "work-thumbnail-missing",
  "work-figure",
  "work-orphan",
  "work-internal-url",
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

const OWNER_NAMES = new Set(["eric", "eric lingren"]);
const QUOTE_WORD_MAX = 30;
const CARD_STRINGS = ["quote", "roleLabel", "sourceType", "employer"];

function readTestimonialBlocklist(root) {
  const file = path.join(root, "docs/private/testimonials/name-blocklist.txt");
  if (!fs.existsSync(file)) return null;
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !OWNER_NAMES.has(l.toLowerCase()));
}

// Loads TESTIMONIALS by importing the .ts file in a child node process.
function loadTestimonials(file) {
  const code = `import(${JSON.stringify(pathToFileURL(file).href)}).then((m) => { process.stdout.write(JSON.stringify(m.TESTIMONIALS)); });`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    encoding: "utf8",
  });
  if (r.status !== 0) return { error: (r.stderr || "load failed").trim().split("\n")[0] };
  try {
    const data = JSON.parse(r.stdout);
    if (!Array.isArray(data)) return { error: "TESTIMONIALS is not an array" };
    return { cards: data };
  } catch {
    return { error: "TESTIMONIALS is not serializable data" };
  }
}

function checkTestimonials(root, file, add) {
  const loaded = loadTestimonials(file);
  if (loaded.error) {
    add(file, 1, "testimonials-placeholder", `testimonials.ts could not be loaded: ${loaded.error}`);
    return;
  }
  const cards = loaded.cards;
  if (cards.length !== 4 && cards.length !== 6) {
    add(file, 1, "testimonials-placeholder", `testimonials has ${cards.length} card(s); need exactly 4 or 6`);
  }
  const blocklist = readTestimonialBlocklist(root);
  if (blocklist === null) {
    add(
      file,
      1,
      "testimonials-name-blocklist-missing",
      "docs/private/testimonials/name-blocklist.txt not found; name term matching skipped",
    );
  }
  const imgDir = path.join(root, "public/testimonials");
  const used = new Set();
  cards.forEach((card, i) => {
    const c = card && typeof card === "object" ? card : {};
    const at = `card ${i + 1}`;
    for (const key of CARD_STRINGS) {
      if (typeof c[key] !== "string" || !c[key].trim()) {
        add(file, 1, "testimonials-card", `${at}: ${key} must be a non-empty string`);
      }
    }
    if (!Number.isInteger(c.year)) add(file, 1, "testimonials-card", `${at}: year must be an integer`);
    if (typeof c.original !== "string" || !/^[A-Za-z0-9_-]+$/.test(c.original)) {
      add(file, 1, "testimonials-card", `${at}: original must match [A-Za-z0-9_-]+`);
    } else {
      used.add(`${c.original}.png`);
      if (!fs.existsSync(path.join(imgDir, `${c.original}.png`))) {
        add(file, 1, "testimonials-card", `${at}: public/testimonials/${c.original}.png does not exist`);
      }
    }
    const quote = typeof c.quote === "string" ? c.quote : "";
    if (c.highlight !== undefined && (typeof c.highlight !== "string" || !c.highlight.trim() || !quote.includes(c.highlight))) {
      add(file, 1, "testimonials-card", `${at}: highlight must be a non-empty phrase taken verbatim from the quote`);
    }
    const words = quote.split(/\s+/).filter(Boolean).length;
    if (words > QUOTE_WORD_MAX) {
      add(file, 1, "testimonials-card", `${at}: quote is ${words} words (max ${QUOTE_WORD_MAX})`);
    }
    if (typeof c.roleLabel === "string" && c.roleLabel.trim() && looksLikePersonalName(c.roleLabel, blocklist ?? [])) {
      add(file, 1, "testimonials-name", `${at}: roleLabel looks like a personal name`);
    }
    for (const name of blocklist ?? []) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}_])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}_])`, "iu");
      if (re.test(quote)) add(file, 1, "testimonials-name", `${at}: quote contains a blocklisted name`);
    }
    if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(quote)) add(file, 1, "testimonials-name", `${at}: quote contains an email`);
    if (/(?<![\w])@\w+/.test(quote)) add(file, 1, "testimonials-name", `${at}: quote contains an @handle`);
    if (/https?:\/\/|www\./i.test(quote)) add(file, 1, "testimonials-name", `${at}: quote contains a URL`);
  });
  if (fs.existsSync(imgDir)) {
    for (const name of fs.readdirSync(imgDir)) {
      if (name.toLowerCase().endsWith(".png") && !used.has(name)) {
        add(file, 1, "testimonials-card", `public/testimonials/${name} is not used by any card`);
      }
    }
  }
}

const WORK_URL_PATTERNS = [
  [/slack\.com/i, "Slack URL"],
  [/linear\.app/i, "Linear URL"],
  [/notion\.(?:so|com|site)/i, "Notion URL"],
  [/github\.com\/Quaestor-Technologies/i, "Quaestor-Technologies GitHub link"],
];

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

// Parses name="v", name='v' and name={"v"} attributes from a JSX tag body.
function parseAttrs(body) {
  const attrs = {};
  const re = /([A-Za-z]\w*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)\s*\})/g;
  let m;
  while ((m = re.exec(body))) attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? m[5] ?? m[6] ?? "";
  return attrs;
}

const FIGURE_REQUIRED = {
  Figure: ["src", "alt", "caption"],
  BeforeAfter: ["before", "after", "beforeAlt", "afterAlt", "caption"],
};
const FIGURE_SRC_KEYS = { Figure: ["src"], BeforeAfter: ["before", "after"] };

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

// Work images: card thumbnails, Figure/BeforeAfter props, orphans, internal URLs.
function checkWork(root, add) {
  const cardsFile = path.join(root, "src/content/work-cards.json");
  const imagesFile = path.join(root, "src/content/work-images.json");
  const cards = readJson(cardsFile);
  const images = readJson(imagesFile) ?? {};
  const referenced = new Set();
  const publicHas = (src) => fs.existsSync(path.join(root, "public", src));

  if (Array.isArray(cards)) {
    for (const card of cards) {
      if (!card || typeof card.thumbnail !== "string") continue;
      referenced.add(card.thumbnail);
      if (!CARD_SLUGS.includes(card.slug)) continue;
      if (!publicHas(card.thumbnail)) {
        add(cardsFile, 1, "work-thumbnail-missing", `${card.slug}: public${card.thumbnail} does not exist`);
      }
    }
    fs.readFileSync(cardsFile, "utf8")
      .split("\n")
      .forEach((text, i) => {
        for (const [re, label] of WORK_URL_PATTERNS) {
          if (re.test(text)) add(cardsFile, i + 1, "work-internal-url", label);
        }
      });
  }

  for (const file of walkFiles(path.join(root, "content/work")).filter((f) => f.endsWith(".mdx"))) {
    const raw = fs.readFileSync(file, "utf8");
    raw.split("\n").forEach((text, i) => {
      for (const [re, label] of WORK_URL_PATTERNS) {
        if (re.test(text)) add(file, i + 1, "work-internal-url", label);
      }
    });
    const tagRe = /<(Figure|BeforeAfter)\b([\s\S]*?)\/?>/g;
    let m;
    while ((m = tagRe.exec(raw))) {
      const [, tag, inner] = m;
      const line = lineOf(raw, m.index);
      const attrs = parseAttrs(inner);
      for (const key of FIGURE_REQUIRED[tag]) {
        if (typeof attrs[key] !== "string" || !attrs[key].trim()) {
          add(file, line, "work-figure", `<${tag}> ${key} must be non-empty`);
        }
      }
      for (const key of FIGURE_SRC_KEYS[tag]) {
        const src = attrs[key];
        if (typeof src !== "string" || !src.trim()) continue;
        referenced.add(src);
        if (!publicHas(src)) add(file, line, "work-figure", `<${tag}> ${key} ${src} does not exist in public/`);
        if (!(src in images)) add(file, line, "work-figure", `<${tag}> ${key} ${src} is not in work-images.json`);
      }
    }
  }

  for (const full of walkFiles(path.join(root, "public/work"))) {
    const src = "/" + path.relative(path.join(root, "public"), full).split(path.sep).join("/");
    if (!referenced.has(src)) add(full, 1, "work-orphan", `public${src} is not used by any card or Figure/BeforeAfter`);
  }
  for (const src of Object.keys(images)) {
    if (!publicHas(src)) add(imagesFile, 1, "work-orphan", `work-images.json entry ${src} has no file in public/`);
  }
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
      const slug =
        typeof parsed.data.slug === "string" && parsed.data.slug ? parsed.data.slug : path.basename(file, ".mdx");
      const wordMin = wordMinFor(slug);
      if (words < wordMin || words > WORD_MAX) {
        add(
          file,
          fmLines + 1,
          "word-count",
          `body is ${words} words (expected ${wordMin}-${WORD_MAX})`,
        );
      }
    }
  }

  const testimonialsFile = path.join(root, "src/content/testimonials.ts");
  if (fs.existsSync(testimonialsFile)) checkTestimonials(root, testimonialsFile, add);

  checkWork(root, add);

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
