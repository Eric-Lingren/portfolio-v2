export interface Finding {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: "error" | "warn";
}
export const REQUIRED_SECTIONS: string[];
export const REQUIRED_FRONTMATTER: string[];
export function checkContent(opts?: { root?: string; strict?: boolean }): {
  findings: Finding[];
  exitCode: number;
};
