import { TESTIMONIALS, type Testimonial } from "@/content/testimonials";
import { FileIcon } from "../icons";
import { Panel, type PanelLayers } from "../Panel";
import "./testimonials.css";

const PLACEHOLDER_COUNT = 4;

type Props = {
  layers?: PanelLayers;
  z?: number;
  id?: string;
  testimonials?: readonly Testimonial[];
};

export function Testimonials({ layers = "polished", z = 0, id, testimonials = TESTIMONIALS }: Props) {
  const empty = testimonials.length === 0;
  return (
    <Panel name="Testimonials" z={z} id={id} layers={layers}>
      <div className="testimonials section">
        <h2 className="section-title">Testimonials</h2>
        <ul className="testimonials-grid">
          {empty
            ? Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                <li key={i} className="testimonial-card" data-testimonial-placeholder>
                  <blockquote className="testimonial-quote">{"“[ERIC: quote]”"}</blockquote>
                  <p className="testimonial-source">[ERIC: role] · [ERIC: source type] · [ERIC: employer] · [ERIC: year]</p>
                </li>
              ))
            : testimonials.map((t) => (
                <li key={t.original} className="testimonial-card" data-testimonial>
                  <blockquote className="testimonial-quote">{`“${t.quote}”`}</blockquote>
                  <p className="testimonial-source">{[t.roleLabel, t.sourceType, t.employer, t.year].join(" · ")}</p>
                  <a
                    className="btn btn-primary"
                    href={`/testimonials/${t.original}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View original screenshot"
                  >
                    <FileIcon />
                    View original
                    <span className="btn-arrow btn-arrow--out" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
        </ul>
      </div>
    </Panel>
  );
}
