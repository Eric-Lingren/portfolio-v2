import type { Metadata } from "next";
import { ResumeDocument } from "@/components/ResumeDocument";
import { RESUME } from "@/content/resume";

export const metadata: Metadata = {
  title: "Eric Lingren | Resume",
  description: "Resume of Eric Lingren, a senior software engineer building React and TypeScript products and AI agent tooling.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <main>
      <ResumeDocument resume={RESUME} />
    </main>
  );
}
