import type { ResumeVariant } from "../../resume-variants";

const variant: ResumeVariant = {
  summaryLastLine: "FIXTURE-ALPHA-LAST-LINE.",
  skills: [
    { label: "AI", items: ["MCP", "Claude Code", "Anthropic API/SDK", "Codex", "Amp", "multi-agent orchestration", "LLM evals", "LLM-as-judge", "prompt engineering"] },
    { label: "Frontend", items: ["TypeScript", "React", "JavaScript", "Next.js", "HTML", "CSS", "Storybook", "shadcn/ui", "design systems", "accessibility (a11y)"] },
    { label: "Backend", items: ["Node.js", "Python", "Django", "PostgreSQL", "REST APIs"] },
    { label: "Testing and tooling", items: ["Vitest", "Jest", "Playwright", "Biome", "ts-morph codemods", "Git", "CI/CD", "AWS", "Cloudflare"] },
  ],
};
export default variant;
