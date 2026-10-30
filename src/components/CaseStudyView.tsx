import type { ReactNode } from "react";
import { BackLink } from "@/components/work/BackLink";
import type { Study } from "@/lib/work";

export function CaseStudyView({ study, children }: { study: Study; children: ReactNode }) {
  return (
    <main className="case-study">
      <article className="case-study__column">
        <BackLink className="case-study__back" fallback="/#work" />
        <h1 className="case-study__title">{study.title}</h1>
        <aside className="case-study__summary" aria-label="Summary">
          <dl>
            <div>
              <dt>Role</dt>
              <dd>{study.role}</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>{study.timeline}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{study.stack.join(", ")}</dd>
            </div>
            <div>
              <dt>Outcomes</dt>
              <dd>
                <ul>
                  {study.outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </aside>
        <div className="case-study__body">{children}</div>
      </article>
    </main>
  );
}
