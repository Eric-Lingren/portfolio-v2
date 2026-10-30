// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import ResumePage from "../src/app/resume/page";
import { PHONE } from "../src/content/resume-contact";
import type { ResumeVariant } from "../src/content/resume-variants";
import { RESUME } from "../src/content/resume";
import { PATHS, buildResumeHtml, chooseVariant, computeResumeHash, generateResumePdf, readHashInputs } from "./resume-pdf";

const FAKE_PDF = new TextEncoder().encode("%PDF-fake");
const fakeRenderer = async () => FAKE_PDF;

describe("PDF staleness", () => {
  const stored = () => readFileSync(PATHS.hash, "utf8").trim();

  it("matches the committed hash", () => {
    expect(computeResumeHash(), "resume PDF is stale: run npm run resume:pdf").toBe(stored());
  });

  it.each([
    ["resume data", () => ({ resume: { ...RESUME, headline: "Changed headline" } })],
    ["contact module", () => ({ contact: `${readHashInputs().contact}// changed` })],
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
  it("includes the phone for the PDF build", () => {
    const html = buildResumeHtml(RESUME, PHONE);
    expect(html).toContain(PHONE);
    expect(html).toContain("@media print");
  });

  it("omits the phone from the public page markup", () => {
    const html = renderToStaticMarkup(<ResumePage />);
    expect(html).not.toContain(PHONE);
    expect(html).not.toContain(PHONE.replace(/\D/g, ""));
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
    const paths = { basePdf: join(dir, "public/base.pdf"), hash: join(dir, "base.sha256"), variantPdfDir: join(dir, "private/resume") };
    return { dir, paths };
  }

  it("writes a variant to the private dir and leaves the base pdf and hash alone", async () => {
    const { paths } = setup();
    const htmls: string[] = [];
    const out = await generateResumePdf({
      variant: "alpha",
      paths,
      renderer: async (html) => {
        htmls.push(html);
        return FAKE_PDF;
      },
      loadVariant: async () => variant,
    });
    expect(out.path).toBe(join(paths.variantPdfDir, "alpha.pdf"));
    expect(existsSync(out.path)).toBe(true);
    expect(existsSync(paths.basePdf)).toBe(false);
    expect(existsSync(paths.hash)).toBe(false);
    expect(htmls[0]).toContain("VARIANT-LAST-LINE.");
    expect(htmls[0]).toContain(PHONE);
  });

  it("writes the base pdf and the hash for the base resume", async () => {
    const { paths } = setup();
    const out = await generateResumePdf({ variant: null, paths, renderer: fakeRenderer });
    expect(out.path).toBe(paths.basePdf);
    expect(readFileSync(paths.basePdf)).toEqual(Buffer.from(FAKE_PDF));
    expect(readFileSync(paths.hash, "utf8").trim()).toBe(computeResumeHash());
  });

  it("never touches the committed files in a variant run", async () => {
    const { paths } = setup();
    const before = [readFileSync(PATHS.basePdf), readFileSync(PATHS.hash)];
    await generateResumePdf({ variant: "alpha", paths, renderer: fakeRenderer, loadVariant: async () => variant });
    expect([readFileSync(PATHS.basePdf), readFileSync(PATHS.hash)]).toEqual(before);
  });
});
