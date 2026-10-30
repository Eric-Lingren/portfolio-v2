import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { ReactElement } from "react";
import { mdxComponents } from "@/components/work";

export interface StudyFrontmatter {
  title: string;
  slug: string;
  role: string;
  timeline: string;
  stack: string[];
  outcomes: string[];
  cardOutcome: string;
  cardNumber: string | null;
  cardNumberLabel: string;
  thumbnail: string;
  order: number;
}

export interface Study extends StudyFrontmatter {
  content: string;
  fixture: boolean;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readDir(dir: string, fixture: boolean): Study[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return { ...(data as StudyFrontmatter), content, fixture };
    });
}

/** Production studies live in content/work. Fixtures live in content/fixtures and are opt-in. */
export function getStudies({ includeFixtures = false } = {}): Study[] {
  const studies = readDir(path.join(CONTENT_ROOT, "work"), false);
  if (includeFixtures) studies.push(...readDir(path.join(CONTENT_ROOT, "fixtures"), true));
  return studies.sort((a, b) => a.order - b.order);
}

export function getStudy(slug: string, opts: { includeFixtures?: boolean } = {}): Study | undefined {
  return getStudies(opts).find((s) => s.slug === slug);
}

export async function compileBody(source: string): Promise<ReactElement> {
  const { default: Content } = await evaluate(source, { ...runtime } as Parameters<typeof evaluate>[1]);
  return Content({ components: mdxComponents });
}
