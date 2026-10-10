export type ExperienceHighlight = {
  text: string;
  /** Case study route, when one exists. */
  href?: string;
};

export type ExperienceRole = {
  company: string;
  title: string;
  dates: string;
  scope: string;
  highlights: ExperienceHighlight[];
};

/** Engineering and teaching roles only, newest first. Shared with the resume build. */
export const EXPERIENCE: readonly ExperienceRole[] = [
  {
    company: "Standard Metrics",
    title: "Software Engineer",
    dates: "Mar 2022 to present",
    scope: "Frontend-first full-stack work on the product investors and portfolio companies use to share data.",
    highlights: [
      {
        text: "Let firms ask each portfolio company for each KPI at its own cadence, inside one Information Request.",
        href: "/work/kpi-granularity",
      },
      {
        text: "Rebuilt the investor report page, then added the auto-submit toggle.",
        href: "/work/investor-reports",
      },
      {
        text: "Led the migration that folded three UI folders into one component tree.",
        href: "/work/frontend-platform",
      },
    ],
  },
  {
    company: "InsideOut Development",
    title: "Software Developer",
    dates: "Apr 2019 to Mar 2022",
    scope: "Full-stack web development for client projects. [ERIC: confirm scope line]",
    highlights: [
      {
        text: "Cut render time on [ERIC: what was slow].",
        href: "/work/render-performance",
      },
    ],
  },
  {
    company: "Bryan University",
    title: "Adjunct Instructor",
    dates: "Jun 2020 to Jun 2023",
    scope: "Taught web development to students alongside full-time engineering work. [ERIC: confirm course scope]",
    highlights: [],
  },
  {
    company: "V School",
    title: "MERN Instructor/TA",
    dates: "Jan to Apr 2019",
    scope: "Helped bootcamp students build full-stack MERN projects. [ERIC: confirm scope line]",
    highlights: [],
  },
];

export const PRE_ENGINEERING_FOOTNOTE =
  "Before engineering: international tech sales, account management, then long-haul trucking, then self-taught and V School in 2018.";
