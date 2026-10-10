import { EXPERIENCE, PRE_ENGINEERING_FOOTNOTE } from "@/content/experience";
import { RESUME_PATH } from "@/content/site";
import { Panel, type PanelLayers } from "../Panel";
import "./experience.css";

export function Experience({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  return (
    <Panel name="Experience" z={z} id={id} layers={layers}>
      <div className="experience">
        <h2 className="experience-title">Experience</h2>
        <ol className="experience-list">
          {EXPERIENCE.map((role) => (
            <li key={`${role.company}-${role.title}`} className="experience-row" data-role-row>
              <div className="experience-head">
                <h3 className="experience-company">{role.company}</h3>
                <span className="experience-dates">{role.dates}</span>
              </div>
              <p className="experience-role">{role.title}</p>
              <p className="experience-scope">{role.scope}</p>
              {role.highlights.length > 0 ? (
                <ul className="experience-highlights">
                  {role.highlights.map((h) => (
                    <li key={h.text}>{h.href ? <a href={h.href}>{h.text}</a> : h.text}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        <a className="btn btn-outline experience-resume" href={RESUME_PATH}>
          Download resume (PDF)
        </a>
        <p className="experience-footnote">{PRE_ENGINEERING_FOOTNOTE}</p>
      </div>
    </Panel>
  );
}
