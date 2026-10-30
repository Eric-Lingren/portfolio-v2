/**
 * Resume PDF core. Local only: CI never runs this, and nothing here is imported by the Next app,
 * so the phone number and the per-posting variants stay out of `out/`.
 *
 * `generateResumePdf({ variant })` does the work. The interactive CLI lives in resume-pdf-cli.tsx.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { ResumeDocument } from "../src/components/ResumeDocument";
import { PHONE } from "../src/content/resume-contact";
import { applyVariant, VARIANTS_DIR, type ResumeVariant } from "../src/content/resume-variants";
import { RESUME, type Resume } from "../src/content/resume";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const PATHS = {
  root: ROOT,
  css: join(ROOT, "src/components/resume.css"),
  document: join(ROOT, "src/components/ResumeDocument.tsx"),
  contact: join(ROOT, "src/content/resume-contact.ts"),
  basePdf: join(ROOT, "public/eric-lingren-resume.pdf"),
  hash: join(ROOT, "src/content/resume-pdf.sha256"),
  variantPdfDir: join(ROOT, "docs/private/resume"),
};

export type Renderer = (html: string) => Promise<Uint8Array>;

/** Inputs that decide what the base PDF looks like. Any can be overridden (tests inject changes). */
export type HashInputs = {
  resume: Resume;
  contact: string;
  document: string;
  css: string;
};

export function readHashInputs(): HashInputs {
  return {
    resume: RESUME,
    contact: readFileSync(PATHS.contact, "utf8"),
    document: readFileSync(PATHS.document, "utf8"),
    css: readFileSync(PATHS.css, "utf8"),
  };
}

/** sha256 over the resolved resume data, the phone module, the document component and the css. */
export function computeResumeHash(overrides: Partial<HashInputs> = {}): string {
  const inputs = { ...readHashInputs(), ...overrides };
  const h = createHash("sha256");
  for (const part of [JSON.stringify(inputs.resume), inputs.contact, inputs.document, inputs.css]) {
    h.update(String(part.length)).update(":").update(part).update("\n");
  }
  return h.digest("hex");
}

function fontFace(family: string, file: string): string {
  const data = readFileSync(join(ROOT, "node_modules/geist/dist/fonts", file)).toString("base64");
  return `@font-face{font-family:"${family}";font-weight:100 900;font-style:normal;src:url(data:font/woff2;base64,${data}) format("woff2");}`;
}

/** Standalone HTML for the resume: inlined css and Geist fonts, light mode. Phone only when given. */
export function buildResumeHtml(resume: Resume, phone?: string): string {
  const css = readFileSync(PATHS.css, "utf8");
  const fonts = [fontFace("Geist", "geist-sans/Geist-Variable.woff2"), fontFace("Geist Mono", "geist-mono/GeistMono-Variable.woff2")].join("");
  const body = renderToStaticMarkup(<ResumeDocument resume={resume} phone={phone} />);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${resume.name} | Resume</title><style>${fonts}:root{--font-geist-sans:"Geist";--font-geist-mono:"Geist Mono";}</style><style>${css}</style></head><body>${body}</body></html>`;
}

/** Prints with Playwright chromium at US Letter, light mode, using the @media print rules. */
export const chromiumRenderer: Renderer = async (html) => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ colorScheme: "light" });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print", colorScheme: "light" });
    const pdf = await page.pdf({ format: "Letter", printBackground: true, preferCSSPageSize: true });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
};

export type Generated = { path: string; variant: string | null; hash: string | null };

export type GenerateOptions = {
  /** null prints the base resume; a name prints that variant. */
  variant: string | null;
  renderer?: Renderer;
  phone?: string;
  variantsDir?: string;
  /** Overridable for tests. */
  paths?: Partial<Pick<typeof PATHS, "basePdf" | "hash" | "variantPdfDir">>;
  loadVariant?: (name: string, dir: string) => Promise<ResumeVariant>;
};

async function defaultLoadVariant(name: string, dir: string): Promise<ResumeVariant> {
  const mod = (await import(/* @vite-ignore */ pathToFileURL(join(dir, `${name}.ts`)).href)) as { default: ResumeVariant };
  return mod.default;
}

export async function generateResumePdf(opts: GenerateOptions): Promise<Generated> {
  const renderer = opts.renderer ?? chromiumRenderer;
  const phone = opts.phone ?? PHONE;
  const paths = { ...PATHS, ...opts.paths };
  const dir = opts.variantsDir ?? VARIANTS_DIR;

  if (opts.variant === null) {
    const pdf = await renderer(buildResumeHtml(RESUME, phone));
    mkdirSync(dirname(paths.basePdf), { recursive: true });
    writeFileSync(paths.basePdf, pdf);
    const hash = computeResumeHash();
    writeFileSync(paths.hash, `${hash}\n`);
    return { path: paths.basePdf, variant: null, hash };
  }

  const variant = await (opts.loadVariant ?? defaultLoadVariant)(opts.variant, dir);
  const pdf = await renderer(buildResumeHtml(applyVariant(RESUME, variant), phone));
  mkdirSync(paths.variantPdfDir, { recursive: true });
  const path = join(paths.variantPdfDir, `${opts.variant}.pdf`);
  writeFileSync(path, pdf);
  return { path, variant: opts.variant, hash: null };
}

/**
 * Lists "base" plus each variant and returns the chosen one (null for base).
 * `ask` shows the question and returns the raw answer, so tests inject it.
 */
export async function chooseVariant(variants: readonly string[], ask: (question: string) => Promise<string>): Promise<string | null> {
  const options = ["base", ...variants];
  const lines = options.map((name, i) => `  ${i + 1}) ${name}`).join("\n");
  for (;;) {
    const answer = (await ask(`Which resume to print?\n${lines}\n> `)).trim();
    const byNumber = /^\d+$/.test(answer) ? options[Number(answer) - 1] : undefined;
    const choice = byNumber ?? options.find((o) => o === answer);
    if (choice !== undefined) return choice === "base" ? null : choice;
  }
}
