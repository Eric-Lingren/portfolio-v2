import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Resume, ResumeSkillGroup } from "./resume";

/**
 * A per-posting variant. It may only replace the summary's last sentence and
 * reorder skill groups and the items inside them.
 */
export type ResumeVariant = {
  /** Replaces the final sentence of the base summary. */
  summaryLastLine: string;
  /** Same groups and items as the base, in the order this posting wants. */
  skills: readonly ResumeSkillGroup[];
};

/** Folder holding the real per-posting variants. The public /resume page never imports it. */
export const VARIANTS_DIR = resolveVariantsDir();

/** import.meta.url is not a file URL under jsdom, so fall back to the project root (cwd). */
function resolveVariantsDir(): string {
  const url = new URL("./resume.variants/", import.meta.url);
  return url.protocol === "file:" ? fileURLToPath(url) : resolve(process.cwd(), "src/content/resume.variants") + "/";
}

/** Everything before the summary's last sentence (or last line, if the summary has newlines). */
function summaryHead(summary: string): string {
  const lines = summary.split("\n");
  const tail = lines.pop() ?? "";
  const prefix = lines.length ? `${lines.join("\n")}\n` : "";
  const match = tail.match(/^(.*[.!?]\s+)[^.!?]*[.!?]?$/s);
  return prefix + (match ? match[1] : "");
}

function checkSkills(base: readonly ResumeSkillGroup[], next: readonly ResumeSkillGroup[]): void {
  for (const group of next) {
    const baseGroup = base.find((g) => g.label === group.label);
    if (!baseGroup) throw new Error(`variant adds skill group not in base: "${group.label}"`);
    for (const item of group.items) {
      if (!baseGroup.items.includes(item)) {
        throw new Error(`variant adds skill not in base: "${item}" (group "${group.label}")`);
      }
    }
    if (new Set(group.items).size !== group.items.length) {
      throw new Error(`variant repeats a skill in group "${group.label}"`);
    }
  }
  for (const baseGroup of base) {
    const group = next.find((g) => g.label === baseGroup.label);
    if (!group) throw new Error(`variant removes skill group: "${baseGroup.label}"`);
    for (const item of baseGroup.items) {
      if (!group.items.includes(item)) {
        throw new Error(`variant removes skill from base: "${item}" (group "${baseGroup.label}")`);
      }
    }
  }
}

/** Pure: returns a new resume with the variant applied. Throws if the variant adds or removes a skill. */
export function applyVariant(base: Resume, variant: ResumeVariant): Resume {
  checkSkills(base.skills, variant.skills);
  return {
    ...base,
    summary: `${summaryHead(base.summary)}${variant.summaryLastLine}`,
    skills: variant.skills.map((g) => ({ label: g.label, items: [...g.items] })),
  };
}

/**
 * Variant names (file names without extension) found in a folder. Skips index
 * files, helpers (leading underscore), tests and declaration files. Only uses
 * node:fs, so it works under vitest and plain node/tsx.
 */
export function listVariants(dir: string = VARIANTS_DIR): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return entries
    .filter((f) => f.endsWith(".ts") && !/\.(test|d)\.ts$/.test(f) && !f.startsWith("_") && f !== "index.ts")
    .map((f) => f.slice(0, -3))
    .sort();
}
