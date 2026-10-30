import type { Resume } from "@/content/resume";

type Props = {
  resume: Resume;
  /** Rendered only when given. The public page never passes it. */
  phone?: string;
};

/** Plain, server-renderable resume. Semantic markup only; styling comes later. */
export function ResumeDocument({ resume, phone }: Props) {
  return (
    <article>
      <header>
        <h1>{resume.name}</h1>
        <p>{resume.headline}</p>
        {resume.stackLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <ul>
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
        <h2>Summary</h2>
        <p>{resume.summary}</p>
      </section>

      <section>
        <h2>Experience</h2>
        {resume.jobs.map((job) => (
          <div key={job.company}>
            <h3>{job.company}</h3>
            <p>
              {job.title} &middot; {job.dates}
            </p>
            <ul>
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {resume.projects.map((project) => (
          <div key={project.name}>
            <h3>{project.name}</h3>
            <p>
              {project.role} &middot; {project.dates} &middot; <a href={project.url}>{project.url.replace(/^https?:\/\//, "")}</a>
            </p>
            <ul>
              {project.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        <ul>
          {resume.skills.map((group) => (
            <li key={group.label}>
              {group.label}: {group.items.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Education</h2>
        <ul>
          {resume.education.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
