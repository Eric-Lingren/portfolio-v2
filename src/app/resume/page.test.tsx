import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResumeDocument } from "@/components/ResumeDocument";
import { RESUME } from "@/content/resume";
import { PHONE } from "@/content/resume-contact";
import { EMAIL } from "@/content/site";
import ResumePage, { metadata } from "./page";

const html = renderToStaticMarkup(<ResumePage />);
const doc = new DOMParser().parseFromString(html, "text/html");

describe("/resume page", () => {
  it("exports metadata", () => {
    expect(metadata.title).toBe("Eric Lingren | Resume");
    expect(typeof metadata.description).toBe("string");
  });

  it("includes the email and the three short URLs, each linked", () => {
    expect(html).toContain(EMAIL);
    for (const short of ["ericlingren.com", "linkedin.com/in/ericlingren", "github.com/Eric-Lingren"]) {
      expect(html).toContain(short);
      const link = [...doc.querySelectorAll("a")].find((a) => a.textContent === short);
      expect(link, `${short} should be a link`).toBeDefined();
      expect(link!.getAttribute("href")).toMatch(/^https:\/\//);
    }
    expect(doc.querySelector(`a[href^="mailto:${EMAIL}"]`)).not.toBeNull();
  });

  it("contains no phone number digits", () => {
    const digits = PHONE.replace(/\D/g, "");
    expect(html).not.toContain(PHONE);
    expect(html).not.toContain(digits);
    expect(html).not.toContain("707-7067");
    expect(doc.body.textContent!.replace(/\D/g, "")).not.toContain(digits);
  });

  it("never imports the contact module", () => {
    for (const file of ["src/app/resume/page.tsx", "src/components/ResumeDocument.tsx"]) {
      expect(readFileSync(path.resolve(process.cwd(), file), "utf8")).not.toMatch(/resume-contact/);
    }
  });

  it("has an h1 with a normal space and plain-text h2 sections", () => {
    const h1s = doc.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe("Eric Lingren");
    expect(h1s[0].textContent).not.toContain(" ");
    expect(h1s[0].children).toHaveLength(0);

    const h2s = [...doc.querySelectorAll("h2")];
    expect(h2s.map((h) => h.textContent)).toEqual(["Summary", "Experience", "Projects", "Skills", "Education"]);
    for (const h of h2s) expect(h.children).toHaveLength(0);
  });

  it("renders header contact items one per line", () => {
    const items = [...doc.querySelectorAll("header ul li")].map((li) => li.textContent);
    expect(items).toEqual([
      "Remote · Seattle area",
      EMAIL,
      "ericlingren.com",
      "linkedin.com/in/ericlingren",
      "github.com/Eric-Lingren",
    ]);
  });

  it("renders jobs with ul/li bullets", () => {
    expect(doc.querySelectorAll("h3").length).toBe(RESUME.jobs.length + RESUME.projects.length);
    const sm = RESUME.jobs[0];
    expect(html).toContain(sm.dates);
    expect(doc.querySelectorAll("section ul li").length).toBeGreaterThan(sm.bullets.length);
  });
});

describe("ResumeDocument phone prop", () => {
  it("renders the phone only when given", () => {
    expect(renderToStaticMarkup(<ResumeDocument resume={RESUME} />)).not.toContain(PHONE);
    const withPhone = renderToStaticMarkup(<ResumeDocument resume={RESUME} phone={PHONE} />);
    expect(withPhone).toContain(PHONE);
  });
});
