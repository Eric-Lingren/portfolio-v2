import { describe, expect, it } from "vitest";
import { EXPERIENCE } from "./experience";
import { RESUME, buildResume, toDisplayDates } from "./resume";

describe("toDisplayDates", () => {
  it("converts the experience date format for display", () => {
    expect(toDisplayDates("Mar 2022 to present")).toBe("Mar 2022 – Present");
    expect(toDisplayDates("Apr 2019 to Mar 2022")).toBe("Apr 2019 – Mar 2022");
  });
});

describe("resume jobs vs experience.ts", () => {
  it("matches company, title and dates for every job", () => {
    expect(RESUME.jobs.length).toBeGreaterThan(0);
    for (const job of RESUME.jobs) {
      const source = EXPERIENCE.find((r) => r.company === job.company);
      expect(source, `${job.company} must exist in experience.ts`).toBeDefined();
      expect(job.title).toBe(source!.title);
      expect(job.dates).toBe(toDisplayDates(source!.dates));
    }
  });

  it("keeps the real titles and leaves V School out", () => {
    expect(RESUME.jobs.map((j) => [j.company, j.title])).toEqual([
      ["Standard Metrics", "Software Engineer"],
      ["InsideOut Development", "Software Developer"],
      ["Bryan University", "Adjunct Instructor"],
    ]);
  });

  it("follows experience.ts when a title changes", () => {
    const changed = EXPERIENCE.map((r) =>
      r.company === "Standard Metrics" ? { ...r, title: "Staff Engineer", dates: "Jan 2020 to present" } : r,
    );
    const job = buildResume(changed).jobs.find((j) => j.company === "Standard Metrics");
    expect(job?.title).toBe("Staff Engineer");
    expect(job?.dates).toBe("Jan 2020 – Present");
  });

  it("fails loudly when a company is missing from experience.ts", () => {
    expect(() => buildResume(EXPERIENCE.filter((r) => r.company !== "Bryan University"))).toThrow(/Bryan University/);
  });
});

describe("resume content", () => {
  it("has the headline, stack lines and location", () => {
    expect(RESUME.headline).toBe("Senior Software Engineer");
    expect(RESUME.stackLines).toEqual([
      "Frontend-focused full stack · React, TypeScript, Node",
      "AI agents and LLM tooling",
    ]);
    expect(RESUME.location).toBe("Remote · Seattle area");
  });

  it("lists the Standard Metrics bullets in the decided order", () => {
    const sm = RESUME.jobs.find((j) => j.company === "Standard Metrics")!;
    expect(sm.bullets).toHaveLength(5);
    expect(sm.bullets[0]).toMatch(/22% to 84%/);
    expect(sm.bullets[0]).toMatch(/re-architecture of our frontend platform/);
    expect(RESUME.summary).toMatch(/15-engineer team/);
    expect(sm.bullets[1]).toMatch(/Reporting Granularity/);
    expect(sm.bullets[2]).toMatch(/35 users across 11 firms/);
    expect(sm.bullets[3]).toMatch(/20 portfolio companies/);
    expect(sm.bullets[4]).toMatch(/AI development workflow/);
  });

  it("has the toolkit project with its own dates and link", () => {
    expect(RESUME.projects).toHaveLength(1);
    const p = RESUME.projects[0];
    expect(p.name).toBe("AI Development Toolkit");
    expect(p).not.toHaveProperty("role");
    expect(p.dates).toBe("Nov 2025 – Present");
    expect(p.url).toBe("https://github.com/Eric-Lingren/claude-code-toolkit");
    expect(p.bullets).toHaveLength(3);
  });

  it("has the right bullet counts for the other jobs", () => {
    expect(RESUME.jobs.find((j) => j.company === "InsideOut Development")!.bullets).toHaveLength(2);
    expect(RESUME.jobs.find((j) => j.company === "Bryan University")!.bullets).toHaveLength(2);
  });

  it("includes the required skills and excludes the dropped ones", () => {
    const all = RESUME.skills.flatMap((g) => g.items);
    for (const wanted of ["Django", "Anthropic API/SDK", "accessibility (a11y)"]) {
      expect(all).toContain(wanted);
    }
    for (const dropped of [
      "GraphQL",
      "MQL4",
      "Wireshark",
      "Flutter",
      "Salesforce",
      "NGINX",
      "React Native",
      "MongoDB",
      "MySQL",
    ]) {
      expect(all).not.toContain(dropped);
    }
    expect(RESUME.skills.map((g) => g.label)).toEqual(["Frontend", "Backend", "AI", "Testing and tooling"]);
  });

  it("has the education block", () => {
    expect(RESUME.education).toEqual([
      { org: "V School", detail: "Full Stack Web Development · 2018", url: "https://vschool.io" },
      { org: "IBM", detail: "Data Science Professional Certificate · 2022", url: "https://www.ibm.com" },
      { org: "Cisco", detail: "CCENT · 2018", url: "https://www.cisco.com" },
    ]);
  });

  it("links every company to its website", () => {
    expect(RESUME.jobs.map((j) => [j.company, j.url])).toEqual([
      ["Standard Metrics", "https://standardmetrics.io"],
      ["InsideOut Development", "https://insideoutdev.com"],
      ["Bryan University", "https://bryanuniversity.edu"],
    ]);
  });

  it("uses no em dashes in any copy", () => {
    expect(JSON.stringify(RESUME)).not.toContain("—");
  });
});
