import type { ResumeVariant } from "../../resume-variants";

const variant: ResumeVariant = {
  summaryLastLine: "FIXTURE-BETA-LAST-LINE.",
  skills: [
    { label: "Backend", items: ["REST APIs", "PostgreSQL", "Django", "Python", "Node.js"] },
    { label: "Frontend", items: ["React", "TypeScript", "JavaScript", "Next.js", "HTML", "CSS", "Storybook", "shadcn/ui", "design systems", "accessibility (a11y)"] },
    { label: "AI", items: ["Claude Code", "Anthropic API/SDK", "multi-agent orchestration", "LLM evals", "LLM-as-judge", "MCP", "prompt engineering"] },
    { label: "Testing and tooling", items: ["Vitest", "Jest", "Playwright", "Biome", "ts-morph codemods", "Git", "CI/CD", "AWS", "Cloudflare"] },
  ],
};
export default variant;
