#!/usr/bin/env node
// Writes src/content/ai-stats.json from local Claude Code analytics.
//   npm run stats:snapshot [-- --input <dir>] [--out <file>] [--generated-at <iso>]
// <dir> defaults to ~/.dotfiles/claude-code-shared and must contain usage-reports/,
// learnings/unified-learnings.jsonl and skills/improve-skill-benchmarks/runs/.
// Output holds percentages, before/after ratios and the skills/agents volume only.

import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSnapshot, validateSnapshot } from "./ai-stats-lib.mjs";

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

export function run(argv, root = resolve(dirname(fileURLToPath(import.meta.url)), "..")) {
  const input = resolve(arg(argv, "--input") ?? resolve(homedir(), ".dotfiles/claude-code-shared"));
  const out = resolve(root, arg(argv, "--out") ?? "src/content/ai-stats.json");
  const generatedAt = arg(argv, "--generated-at") ?? new Date().toISOString();

  const snapshot = buildSnapshot(input, generatedAt);
  const errors = validateSnapshot(snapshot);
  if (errors.length > 0) throw new Error(`snapshot rejected:\n  ${errors.join("\n  ")}`);

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`);
  return { out, snapshot };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { out } = run(process.argv.slice(2));
    console.log(`wrote ${out}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
