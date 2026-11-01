// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import ResumePage from "../src/app/resume/page";
import type { ResumeVariant } from "../src/content/resume-variants";
import { RESUME } from "../src/content/resume";
import { PATHS, buildResumeHtml, chooseVariant, computeResumeHash, generateResumePdf, readHashInputs, readPrivatePhone } from "./resume-pdf";

const PHONE = "(555) 010-4477";
const PHONE_PATTERN = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const FAKE_PDF = new TextEncoder().encode("%PDF-fake");
const fakeRenderer = async () => FAKE_PDF;

describe("PDF staleness", () => {
  const stored = () => readFileSync(PATHS.hash, "utf8").trim();

  it("matches the committed hash", () => {
    expect(computeResumeHash(), "resume PDF is stale: run npm run resume:pdf").toBe(stored());
  });

  it.each([
    ["resume data", () => ({ resume: { ...RESUME, headline: "Changed headline" } })],
    ["document component", () => ({ document: `${readHashInputs().document}// changed` })],
    ["css", () => ({ css: `${readHashInputs().css}/* changed */` })],
  ])("fails when %s changes without regenerating", (_name, change) => {
    expect(computeResumeHash(change())).not.toBe(stored());
  });
});

describe("committed PDF", () => {
  it("is exactly one page", async () => {
    const pdf = await PDFDocument.load(readFileSync(PATHS.basePdf));
    expect(pdf.getPageCount()).toBe(1);
  });
});

describe("resume HTML", () => {
  it("includes the phone only when given", () => {
    const html = buildResumeHtml(RESUME, PHONE);
    expect(html).toContain(PHONE);
    expect(html).toContain("@media print");
    expect(buildResumeHtml(RESUME)).not.toMatch(PHONE_PATTERN);
  });

  it("omits the phone from the public page markup", () => {
    expect(renderToStaticMarkup(<ResumePage />)).not.toMatch(PHONE_PATTERN);
  });
});

describe("readPrivatePhone", () => {
  const file = (text?: string) => {
    const path = join(mkdtempSync(join(tmpdir(), "resume-contact-")), "resume-contact.json");
    if (text !== undefined) writeFileSync(path, text);
    return path;
  };

  it("reads the phone from the private contact file", () => {
    expect(readPrivatePhone(file(JSON.stringify({ phone: PHONE })))).toBe(PHONE);
  });

  it("throws with setup steps when the file is missing or has no phone", () => {
    expect(() => readPrivatePhone(file())).toThrow(/not found/);
    expect(() => readPrivatePhone(file("{}"))).toThrow(/non-empty "phone"/);
  });
});

describe("chooseVariant", () => {
  it("lists base plus every variant", async () => {
    let shown = "";
    await chooseVariant(["alpha", "beta"], async (q) => {
      shown = q;
      return "1";
    });
    expect(shown).toContain("base");
    expect(shown).toContain("alpha");
    expect(shown).toContain("beta");
  });

  it("returns null for base and the name for a variant, by number or name", async () => {
    expect(await chooseVariant(["alpha"], async () => "1")).toBeNull();
    expect(await chooseVariant(["alpha"], async () => "2")).toBe("alpha");
    expect(await chooseVariant(["alpha"], async () => "alpha")).toBe("alpha");
  });

  it("asks again on an invalid answer", async () => {
    const answers = ["9", "nope", "2"];
    expect(await chooseVariant(["alpha"], async () => answers.shift() ?? "")).toBe("alpha");
  });
});

describe("generateResumePdf", () => {
  const variant: ResumeVariant = { summaryLastLine: "VARIANT-LAST-LINE.", skills: RESUME.skills };

  function setup() {
    const dir = mkdtempSync(join(tmpdir(), "resume-pdf-"));
    const paths = {
      basePdf: join(dir, "public/base.pdf"),
      hash: join(dir, "base.sha256"),
      variantPdfDir: join(dir, "private/resume"),
      privateContact: join(dir, "private/resume-contact.json"),
    };
    return { dir, paths };
  }

  it("writes a variant to the private dir and leaves the base pdf and hash alone", async () => {
    const { paths } = setup();
    const htmls: string[] = [];
    const out = await generateResumePdf({
      variant: "alpha",
      paths,
      phone: PHONE,
      renderer: async (html) => {
        htmls.push(html);
        return FAKE_PDF;
      },
      loadVariant: async () => variant,
    });
    expect(out.path).toBe(join(paths.variantPdfDir, "alpha.pdf"));
    expect(out.publicPath).toBeNull();
    expect(existsSync(out.path)).toBe(true);
    expect(existsSync(paths.basePdf)).toBe(false);
    expect(existsSync(paths.hash)).toBe(false);
    expect(htmls[0]).toContain("VARIANT-LAST-LINE.");
    expect(htmls[0]).toContain(PHONE);
  });

  it("writes a private base pdf with the phone, a public one without it, and the hash", async () => {
    const { paths } = setup();
    const rendered = new Map<string, string>();
    const out = await generateResumePdf({
      variant: null,
      paths,
      phone: PHONE,
      renderer: async (html) => {
        const pdf = new TextEncoder().encode(`%PDF-${rendered.size}`);
        rendered.set(Buffer.from(pdf).toString(), html);
        return pdf;
      },
    });
    expect(out.path).toBe(join(paths.variantPdfDir, "base.pdf"));
    expect(out.publicPath).toBe(paths.basePdf);
    expect(rendered.get(readFileSync(out.path, "utf8"))).toContain(PHONE);
    expect(rendered.get(readFileSync(paths.basePdf, "utf8"))).not.toMatch(PHONE_PATTERN);
    expect(readFileSync(paths.hash, "utf8").trim()).toBe(computeResumeHash());
  });

  it("reads the phone from the private contact file and fails without it", async () => {
    const { paths } = setup();
    await expect(generateResumePdf({ variant: null, paths, renderer: fakeRenderer })).rejects.toThrow(/not found/);
    expect(existsSync(paths.basePdf)).toBe(false);
  });

  it("never touches the committed files in a variant run", async () => {
    const { paths } = setup();
    const before = [readFileSync(PATHS.basePdf), readFileSync(PATHS.hash)];
    await generateResumePdf({ variant: "alpha", paths, phone: PHONE, renderer: fakeRenderer, loadVariant: async () => variant });
    expect([readFileSync(PATHS.basePdf), readFileSync(PATHS.hash)]).toEqual(before);
  });
});
