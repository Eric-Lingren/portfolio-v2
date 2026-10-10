import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/CaseStudyView";
import { compileBody, getStudies, getStudy } from "@/lib/work";
import "../case-study.css";

export const dynamicParams = false;

/** Placeholder slug keeps `output: export` happy while no production studies exist. */
export const EMPTY_PLACEHOLDER_SLUG = "_none";

export function generateStaticParams() {
  const slugs = getStudies().map((s) => s.slug);
  // output: export rejects an empty list; the placeholder renders notFound() until studies land.
  return (slugs.length ? slugs : [EMPTY_PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const study = getStudy((await params).slug);
  return study ? { title: study.title, description: study.cardOutcome } : {};
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const study = getStudy((await params).slug);
  if (!study) notFound();
  return <CaseStudyView study={study}>{await compileBody(study.content)}</CaseStudyView>;
}
