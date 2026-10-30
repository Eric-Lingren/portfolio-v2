export type ExperienceRole = {
  company: string;
  title: string;
  dates: string;
  /** One plain line on what the role was. */
  scope: string;
};

/** Engineering and teaching roles only, newest first. Shared with the resume build. */
export const EXPERIENCE: readonly ExperienceRole[] = [
  {
    company: "Standard Metrics",
    title: "Software Engineer",
    dates: "Mar 2022 to present",
    scope: "Build the tools VC firms use to collect and report on portfolio company data.",
  },
  {
    company: "InsideOut Development",
    title: "Software Developer",
    dates: "Apr 2019 to Mar 2022",
    scope: "Built the backend for coaching tools companies use to develop and train their leaders.",
  },
  {
    company: "Bryan University",
    title: "Adjunct Instructor",
    dates: "Jun 2020 to Jun 2023",
    scope: "Taught university students to build full-stack apps with React, APIs and Python.",
  },
  {
    company: "V School",
    title: "Teaching Assistant",
    dates: "Jan 2019 to Apr 2019",
    scope: "Mentored bootcamp students through React, Node and MongoDB.",
  },
];
