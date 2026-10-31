import { EXPERIENCE, type ExperienceRole } from "./experience";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, SITE_URL } from "./site";

export type ResumeJob = {
  company: string;
  title: string;
  dates: string;
  /** Company website. */
  url: string;
  bullets: readonly string[];
};

export type ResumeProject = {
  name: string;
  dates: string;
  url: string;
  bullets: readonly string[];
};

export type ResumeSkillGroup = { label: string; items: readonly string[] };

/** One education line: the org name links to its website. */
export type ResumeEducation = { org: string; detail: string; url: string };

export type ResumeContactLink = { label: string; href: string };

export type Resume = {
  name: string;
  headline: string;
  stackLines: readonly string[];
  location: string;
  email: string;
  links: readonly ResumeContactLink[];
  summary: string;
  jobs: readonly ResumeJob[];
  projects: readonly ResumeProject[];
  skills: readonly ResumeSkillGroup[];
  education: readonly ResumeEducation[];
};

/** 'Mar 2022 to present' becomes 'Mar 2022 – Present'. */
export function toDisplayDates(dates: string): string {
  const [start, end] = dates.split(" to ");
  const endLabel = end.toLowerCase() === "present" ? "Present" : end;
  return `${start} – ${endLabel}`;
}

/** 'https://www.github.com/Eric-Lingren' becomes 'github.com/Eric-Lingren'. */
export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

/** Bullets per job, keyed by company. Company, title and dates come from experience.ts. */
const JOB_BULLETS: readonly { company: string; url: string; bullets: readonly string[] }[] = [
  {
    company: "Standard Metrics",
    url: "https://standardmetrics.io",
    bullets: [
      "Led a re-architecture of our frontend platform for the team. Design system share of new UI code rose from 22% to 84%.",
      "Owned Reporting Granularity project end to end, so firms can request each KPI at its own cadence. One firm had needed 84 separate requests, and about half of customers now adjust cadences.",
      "Built spreadsheet-grade keyboard navigation, shortcuts, in-cell editing and copy/paste for our metrics grid. The beta reached 35 users across 11 firms before launch.",
      "Took auto-submit from proposal to release ahead of reporting season. 20 portfolio companies adopted it in week one.",
      "Built an AI development workflow and shared with teammates, who adopted pieces. Added to our team's skills marketplace.",
    ],
  },
  {
    company: "InsideOut Development",
    url: "https://insideoutdev.com",
    bullets: [
      "Owned front-end performance for our website. Largest contentful paint dropped from 5.2s to 2.0s, and Lighthouse score rose from 47 to 82.",
      "Cut marketing tech spend by 25% by moving from SlideShare, HubSpot and UberFlip to Strapi and Pardot.",
    ],
  },
  {
    company: "Bryan University",
    url: "https://bryanuniversity.edu",
    bullets: [
      "Taught hundreds of students full-stack development with React, REST APIs and Python, with video feedback on assignments.",
      "Helped shape the course curriculum, giving feedback and design input across iterations.",
    ],
  },
];

const PROJECTS: readonly ResumeProject[] = [
  {
    name: "AI Development Toolkit",
    dates: "Nov 2025 – Present",
    url: "https://github.com/Eric-Lingren/claude-code-toolkit",
    bullets: [
      "Built a multi-agent Claude Code pipeline that takes work from planning interview to reviewed PR, with test-first build agents and separate test and browser verification agents.",
      "Tiered models by cost of error. Haiku runs lookups and tests, Sonnet builds and reviews, Opus handles planning and debugging.",
      "Built LLM evals with multi-judge scoring and learning loops that turns misses into measured fixes for the skills that caused them.",
    ],
  },
];

const SKILLS: readonly ResumeSkillGroup[] = [
  {
    label: "Frontend",
    items: [
      "React",
      "TypeScript",
      "JavaScript",
      "Next.js",
      "HTML",
      "CSS",
      "Storybook",
      "shadcn/ui",
      "design systems",
      "accessibility (a11y)",
    ],
  },
  { label: "Backend", items: ["Node.js", "Python", "Django", "PostgreSQL", "REST APIs"] },
  {
    label: "AI",
    items: [
      "Claude Code",
      "Anthropic API/SDK",
      "Codex",
      "Amp",
      "multi-agent orchestration",
      "LLM evals",
      "LLM-as-judge",
      "MCP",
      "prompt engineering",
    ],
  },
  {
    label: "Testing and tooling",
    items: ["Vitest", "Jest", "Playwright", "Biome", "ts-morph codemods", "Git", "CI/CD", "AWS", "Cloudflare"],
  },
];

const EDUCATION: readonly ResumeEducation[] = [
  { org: "V School", detail: "Full Stack Web Development · 2018", url: "https://vschool.io" },
  { org: "IBM", detail: "Data Science Professional Certificate · 2022", url: "https://www.ibm.com" },
  { org: "Cisco", detail: "CCENT · 2018", url: "https://www.cisco.com" },
];

/** Builds the resume from an experience list, so company, title and dates cannot drift from experience.ts. */
export function buildResume(experience: readonly ExperienceRole[]): Resume {
  return {
    name: "Eric Lingren",
    headline: "Senior Software Engineer",
    stackLines: ["Frontend-focused full stack · React, TypeScript, Node", "AI agents and LLM tooling"],
    location: "Remote · Seattle area",
    email: EMAIL,
    links: [SITE_URL, LINKEDIN_URL, GITHUB_URL].map((href) => ({ label: shortUrl(href), href })),
    summary:
      "Frontend-first full-stack engineer with 7 years building React and TypeScript products. At Standard Metrics, I own frontend platform work on a 15-engineer team and ship data-heavy features for investment firms. I also build multi-agent AI tooling with Claude Code, including orchestration, evals, and model tiering.",
    jobs: JOB_BULLETS.map(({ company, url, bullets }) => {
      const role = experience.find((r) => r.company === company);
      if (!role) throw new Error(`resume: "${company}" is missing from experience.ts`);
      return { company: role.company, title: role.title, dates: toDisplayDates(role.dates), url, bullets };
    }),
    projects: PROJECTS,
    skills: SKILLS,
    education: EDUCATION,
  };
}

export const RESUME: Resume = buildResume(EXPERIENCE);
