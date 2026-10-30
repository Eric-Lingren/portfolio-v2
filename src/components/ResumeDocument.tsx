import type { ReactNode } from "react";
import type { Resume } from "@/content/resume";

type Props = {
  resume: Resume;
  /** Rendered only when given. The public page never passes it. */
  phone?: string;
};

/** Numeric tokens in a bullet: 22%, 84, 5.2s. Skips compounds like '15-engineer'. */
const PROOF_NUMBER = /\d+(?:\.\d+)?(?:%|s)?(?![\w-])/g;

/** Wraps proof numbers in a non-bold span that resume.css colors coral. */
export function withProofNumbers(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(PROOF_NUMBER)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span key={m.index} className="resume-num">
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Server-renderable resume. Styled by resume.css (imported by the page, inlined by the PDF task). */
export function ResumeDocument({ resume, phone }: Props) {
  return (
    <article className="resume">
      <header className="resume-top">
        <div className="resume-id">
          <p className="resume-eyebrow">{resume.headline}</p>
          <h1 className="resume-name">{resume.name}</h1>
          {resume.stackLines.map((line) => (
            <p key={line} className="resume-stack">
              {line}
            </p>
          ))}
        </div>
        <ul className="resume-reach">
          <li>{resume.location}</li>
          {phone ? <li>{phone}</li> : null}
          <li>
            <a href={`mailto:${resume.email}`}>{resume.email}</a>
          </li>
          {resume.links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </header>

      <section>
        <h2 className="resume-section-title">Summary</h2>
        <p className="resume-summary">{resume.summary}</p>
      </section>

      <section>
        <h2 className="resume-section-title">Experience</h2>
        {resume.jobs.map((job) => (
          <div key={job.company} className="resume-item">
            <h3 className="resume-item-title">{job.company}</h3>
            <p className="resume-meta">
              {job.title} &middot; <span className="resume-dates">{job.dates}</span>
            </p>
            <ul className="resume-bullets">
              {job.bullets.map((b) => (
                <li key={b}>{withProofNumbers(b)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2 className="resume-section-title">Projects</h2>
        {resume.projects.map((project) => (
          <div key={project.name} className="resume-item">
            <h3 className="resume-item-title">{project.name}</h3>
            <p className="resume-meta">
              {project.role} &middot; <span className="resume-dates">{project.dates}</span> &middot;{" "}
              <a href={project.url}>{project.url.replace(/^https?:\/\//, "")}</a>
            </p>
            <ul className="resume-bullets">
              {project.bullets.map((b) => (
                <li key={b}>{withProofNumbers(b)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2 className="resume-section-title">Skills</h2>
        <ul className="resume-list">
          {resume.skills.map((group) => (
            <li key={group.label}>
              <span className="resume-skill-label">{group.label}:</span> {group.items.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="resume-section-title">Education</h2>
        <ul className="resume-list">
          {resume.education.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
