import { EXPERIENCE } from "@/content/experience";
import { Panel, type PanelLayers } from "../Panel";
import "./experience.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Apr 2019 to Mar 2022" -> a sortable number for the start month. */
function startKey(dates: string) {
  const [month, year] = dates.split(" to ")[0].split(" ");
  return Number(year) * 12 + MONTHS.indexOf(month);
}

/** The timeline runs oldest to newest, left to right, ordered by start date. */
const TIMELINE = [...EXPERIENCE].sort((a, b) => startKey(a.dates) - startKey(b.dates));

export function Experience({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  return (
    <Panel name="Experience" z={z} id={id} layers={layers}>
      <div className="experience section">
        <h2 className="section-title">Experience</h2>
        <ol className="experience-list">
          {TIMELINE.map((role) => {
            const [start, end] = role.dates.split(" to ");
            return (
              <li
                key={`${role.company}-${role.title}`}
                className="experience-row"
                data-role-row
                data-current={end === "present" || undefined}
              >
                {/* Start, "to", end spread across the top of the segment; inline on narrow screens. */}
                <div className="experience-dates">
                  <span className="experience-date-start">{start}</span>
                  <span className="experience-date-to">to</span>
                  <span className="experience-date-end">{end}</span>
                </div>
                <h3 className="experience-company">{role.company}</h3>
                <p className="experience-role">{role.title}</p>
                <p className="experience-scope">{role.scope}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </Panel>
  );
}
