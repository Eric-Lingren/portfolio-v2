import type { Metadata } from "next";
import { ResumeDocument } from "@/components/ResumeDocument";
import { RESUME } from "@/content/resume";
import "@/components/resume.css";
import "./resume-page.css";

export const metadata: Metadata = {
  title: "Eric Lingren | Resume",
  description: "Resume of Eric Lingren, a senior software engineer building React and TypeScript products and AI agent tooling.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <main>
      <div className="resume-download">
        <a className="btn btn-outline" href="/eric-lingren-resume.pdf" download>
          Download PDF
        </a>
      </div>
      <ResumeDocument resume={RESUME} />
    </main>
  );
}
