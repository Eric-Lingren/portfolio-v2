// Pure helpers for the AI stats snapshot: parsing local analytics inputs and
// validating the static snapshot. No cost, dollar, raw work-profile count or
// project name may ever reach src/content/ai-stats.json.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const MODELS = ["haiku", "sonnet", "opus"];
const TOP_KEYS = ["sample", "sampleNote", "generatedAt", "efficiency", "improvement", "volume"];
const EFFICIENCY_KEYS = ["modelMix", "tierAdherencePct"];
const IMPROVEMENT_KEYS = ["learningsAppliedPct", "benchmarkBeforePct", "benchmarkAfterPct"];
const VOLUME_KEYS = ["skills", "agents"];

const COST_KEY = /cost|spend|usd|price|dollar|bill|budget/i;
const COUNT_KEY = /session|request|turn|project|repo|token|message|\bcount\b|total/i;
const DOLLAR_VALUE = /\$\s*\d|\d\s*(usd|dollars?)\b|\busd\b/i;
const PROJECT_VALUE = /\/Users\/|-Users-|worktrees|\bKEY-\d+|Quaestor|Standard Metrics/i;

const pct = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;

function walk(value, path, visit) {
  visit(value, path);
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k, visit);
  }
}

/** Returns a list of human-readable problems; empty means the snapshot is acceptable. */
export function validateSnapshot(data) {
  const errors = [];
  if (!data || typeof data !== "object" || Array.isArray(data)) return ["snapshot must be an object"];

  // Forbidden categories, checked everywhere in the tree.
  walk(data, "", (value, path) => {
    const key = path.split(".").pop().replace(/\[\d+\]$/, "");
    if (key && COST_KEY.test(key)) errors.push(`cost key not allowed: ${path}`);
    if (key && COUNT_KEY.test(key) && !path.startsWith("volume.")) errors.push(`raw work-profile count key not allowed: ${path}`);
    if (typeof value === "string") {
      if (DOLLAR_VALUE.test(value)) errors.push(`dollar value not allowed: ${path}`);
      if (PROJECT_VALUE.test(value)) errors.push(`project name or path not allowed: ${path}`);
    }
  });

  const unknown = (obj, allowed, where) => {
    for (const k of Object.keys(obj)) if (!allowed.includes(k)) errors.push(`unknown key: ${where ? `${where}.` : ""}${k}`);
  };
  unknown(data, TOP_KEYS, "");

  if (data.sample !== undefined && typeof data.sample !== "boolean") errors.push("sample must be a boolean");
  if (data.sampleNote !== undefined && typeof data.sampleNote !== "string") errors.push("sampleNote must be a string");
  if (data.sample === true && !String(data.sampleNote ?? "").includes("[ERIC:")) {
    errors.push("sample snapshot must carry an [ERIC: ...] marker in sampleNote");
  }
  if (typeof data.generatedAt !== "string" || Number.isNaN(Date.parse(data.generatedAt))) {
    errors.push("generatedAt must be an ISO date string");
  }

  const eff = data.efficiency;
  if (!eff || typeof eff !== "object") errors.push("efficiency is required");
  else {
    unknown(eff, EFFICIENCY_KEYS, "efficiency");
    if (!pct(eff.tierAdherencePct)) errors.push("efficiency.tierAdherencePct must be a percentage 0-100");
    const mix = eff.modelMix;
    if (!mix || typeof mix !== "object") errors.push("efficiency.modelMix is required");
    else {
      unknown(mix, MODELS, "efficiency.modelMix");
      for (const m of MODELS) if (!pct(mix[m])) errors.push(`efficiency.modelMix.${m} must be a percentage 0-100`);
      const sum = MODELS.reduce((s, m) => s + (Number(mix[m]) || 0), 0);
      if (Math.abs(sum - 100) > 2) errors.push("efficiency.modelMix must sum to about 100");
    }
  }

  const imp = data.improvement;
  if (!imp || typeof imp !== "object") errors.push("improvement is required");
  else {
    unknown(imp, IMPROVEMENT_KEYS, "improvement");
    for (const k of IMPROVEMENT_KEYS) if (!pct(imp[k])) errors.push(`improvement.${k} must be a percentage 0-100`);
  }

  const vol = data.volume;
  if (!vol || typeof vol !== "object") errors.push("volume is required");
  else {
    unknown(vol, VOLUME_KEYS, "volume");
    for (const k of VOLUME_KEYS) if (!Number.isInteger(vol[k]) || vol[k] < 0) errors.push(`volume.${k} must be a non-negative integer`);
  }

  return [...new Set(errors)];
}

/** Share of each model across every "MODEL MIX" section, weighted by turns. Percentages sum to 100. */
export function parseModelMix(text) {
  const totals = Object.fromEntries(MODELS.map((m) => [m, 0]));
  let inMix = false;
  for (const line of text.split("\n")) {
    if (/^---\s*MODEL MIX/.test(line)) {
      inMix = true;
      continue;
    }
    if (inMix && /^(---|===)/.test(line)) inMix = false;
    if (!inMix) continue;
    const m = line.match(/^\s*[\d.]+%\s+(\w+)\s+(\d+)\s*$/);
    if (m && MODELS.includes(m[1])) totals[m[1]] += Number(m[2]);
  }
  const sum = MODELS.reduce((s, m) => s + totals[m], 0);
  if (sum === 0) throw new Error("no model mix found in usage report");
  // Largest-remainder rounding so the three shares add to exactly 100.
  const raw = MODELS.map((m) => (totals[m] / sum) * 100);
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - floors[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left-- > 0) floors[i] += 1;
  }
  return Object.fromEntries(MODELS.map((m, i) => [m, floors[i]]));
}

/** Tier adherence percentage from the digest header ("adher.  24%  ..."). */
export function parseAdherence(text) {
  const m = text.match(/^\s*adher\.\s+(\d+(?:\.\d+)?)%/m);
  if (!m) throw new Error("no tier adherence line found in usage report");
  return Math.round(Number(m[1]));
}

/** Percent of captured learnings whose status is "applied". */
export function learningsAppliedPct(jsonl) {
  const rows = jsonl.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  if (rows.length === 0) throw new Error("no learnings found");
  return Math.round((rows.filter((r) => r.status === "applied").length / rows.length) * 100);
}

/** Mean first-run and latest-run behavioral score across skills that have at least two runs. */
export function benchmarkBeforeAfter(scoreFiles) {
  const before = [];
  const after = [];
  for (const file of scoreFiles) {
    const runs = (file.runs ?? [])
      .filter((r) => typeof r.behavioral_score === "number")
      .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
    if (runs.length < 2) continue;
    before.push(runs[0].behavioral_score);
    after.push(runs.at(-1).behavioral_score);
  }
  if (before.length === 0) throw new Error("no skill benchmark has two or more runs");
  const mean = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  return { before: mean(before), after: mean(after) };
}

function listFiles(dir, pred, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) listFiles(p, pred, out);
    else if (pred(name, p)) out.push(p);
  }
  return out;
}

/** Reads a claude-code-shared style directory and returns the snapshot (without sample markers). */
export function buildSnapshot(input, generatedAt) {
  const reportsDir = join(input, "usage-reports");
  const reports = readdirSync(reportsDir).filter((f) => /^usage-.*\.txt$/.test(f)).sort();
  if (reports.length === 0) throw new Error(`no usage-*.txt in ${reportsDir}`);
  const latest = readFileSync(join(reportsDir, reports.at(-1)), "utf8");

  const learnings = readFileSync(join(input, "learnings", "unified-learnings.jsonl"), "utf8");

  const runsDir = join(input, "skills", "improve-skill-benchmarks", "runs");
  const scoreFiles = existsSync(runsDir)
    ? listFiles(runsDir, (n) => n === "scores.json").map((p) => JSON.parse(readFileSync(p, "utf8")))
    : [];
  const bench = benchmarkBeforeAfter(scoreFiles);

  const skillsDir = join(input, "skills");
  const skills = readdirSync(skillsDir).filter((n) => existsSync(join(skillsDir, n, "SKILL.md"))).length;
  const agentsDir = join(input, "agents");
  const agents = existsSync(agentsDir) ? listFiles(agentsDir, (n) => n.endsWith(".md") && n !== "README.md").length : 0;

  return {
    generatedAt,
    efficiency: { modelMix: parseModelMix(latest), tierAdherencePct: parseAdherence(latest) },
    improvement: {
      learningsAppliedPct: learningsAppliedPct(learnings),
      benchmarkBeforePct: bench.before,
      benchmarkAfterPct: bench.after,
    },
    volume: { skills, agents },
  };
}
