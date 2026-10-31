import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResumeDocument } from "@/components/ResumeDocument";
import { RESUME } from "@/content/resume";
import { EMAIL } from "@/content/site";
import alpha from "@/content/__fixtures__/resume.variants/fixture-alpha";
import beta from "@/content/__fixtures__/resume.variants/fixture-beta";
import ResumePage, { metadata } from "./page";

const PHONE = "(555) 010-4477";
const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
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

  it("contains no phone number", () => {
    expect(doc.body.textContent).not.toMatch(PHONE_PATTERN);
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

  it("links every contact item except location to its site", () => {
    const links = [...doc.querySelectorAll("header ul li a")].map((a) => [a.textContent, a.getAttribute("href")]);
    expect(links).toEqual([
      [EMAIL, `mailto:${EMAIL}`],
      ["ericlingren.com", "https://www.ericlingren.com"],
      ["linkedin.com/in/ericlingren", "https://www.linkedin.com/in/ericlingren/"],
      ["github.com/Eric-Lingren", "https://www.github.com/Eric-Lingren"],
    ]);
  });

  it("links each company name and education org to its website", () => {
    const companies = [...doc.querySelectorAll("h3 a")].map((a) => [a.textContent, a.getAttribute("href")]);
    expect(companies).toEqual([
      ...RESUME.jobs.map((j) => [j.company, j.url]),
      ...RESUME.projects.map((p) => [p.name, p.url]),
    ]);
    const orgs = [...doc.querySelectorAll("section:last-of-type li a")].map((a) => [a.textContent, a.getAttribute("href")]);
    expect(orgs).toEqual(RESUME.education.map((e) => [e.org, e.url]));
  });

  it("opens every web link in a new tab with noopener noreferrer", () => {
    const web = [...doc.querySelectorAll("a")].filter((a) => !a.getAttribute("href")!.startsWith("mailto:"));
    expect(web.length).toBeGreaterThan(8);
    for (const a of web) {
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("renders jobs with ul/li bullets", () => {
    expect(doc.querySelectorAll("h3").length).toBe(RESUME.jobs.length + RESUME.projects.length);
    const sm = RESUME.jobs[0];
    expect(html).toContain(sm.dates);
    expect(doc.querySelectorAll("section ul li").length).toBeGreaterThan(sm.bullets.length);
  });
});

describe("Download PDF link", () => {
  const link = [...doc.querySelectorAll("a")].find((a) => a.textContent === "Download PDF");

  it("links to the PDF with the shared button classes", () => {
    expect(link).toBeDefined();
    expect(link!.getAttribute("href")).toBe("/eric-lingren-resume.pdf");
    expect(link!.classList.contains("btn")).toBe(true);
    expect(link!.classList.contains("btn-outline")).toBe(true);
  });

  it("is hidden by the print stylesheet", () => {
    expect(link!.closest(".resume-download")).not.toBeNull();
    const css = readFileSync(path.resolve(process.cwd(), "src/app/resume/resume-page.css"), "utf8");
    expect(css).toMatch(/@media print\s*{[^]*\.resume-download\s*{[^}]*display:\s*none/);
  });
});

describe("static export privacy", () => {
  const file = ["out/resume.html", "out/resume/index.html"].map((f) => path.resolve(process.cwd(), f)).find((f) => existsSync(f));

  it.skipIf(!file)("built out/resume has no phone number and no variant text", () => {
    const built = readFileSync(file!, "utf8");
    expect(built).not.toMatch(PHONE_PATTERN);
    for (const v of [alpha, beta]) expect(built).not.toContain(v.summaryLastLine);
  });
});

describe("ResumeDocument phone prop", () => {
  it("renders the phone only when given", () => {
    expect(renderToStaticMarkup(<ResumeDocument resume={RESUME} />)).not.toContain(PHONE);
    const withPhone = renderToStaticMarkup(<ResumeDocument resume={RESUME} phone={PHONE} />);
    expect(withPhone).toContain(PHONE);
  });
});
