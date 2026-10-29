export interface Finding {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: "error" | "warn";
}
export const REQUIRED_SECTIONS: string[];
export const REQUIRED_FRONTMATTER: string[];
export const STRICT_RULES: Set<string>;
export const WORD_MIN: number;
export const WORD_MAX: number;
export const WORD_MIN_OVERRIDES: Record<string, number>;
export function wordMinFor(slug: string): number;
export function checkContent(opts?: { root?: string; strict?: boolean }): {
  findings: Finding[];
  exitCode: number;
};
