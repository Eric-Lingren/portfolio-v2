import { TESTIMONIALS, type Testimonial } from "@/content/testimonials";
import { Panel, type PanelLayers } from "../Panel";
import "./testimonials.css";

type Props = {
  layers?: PanelLayers;
  z?: number;
  id?: string;
  testimonials?: readonly Testimonial[];
};

/** Wraps the card's highlight phrase in a <mark>; falls back to plain text when it is absent or not found. */
function QuoteText({ quote, highlight }: Pick<Testimonial, "quote" | "highlight">) {
  const at = highlight ? quote.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{`“${quote}”`}</>;
  return (
    <>
      {`“${quote.slice(0, at)}`}
      <mark className="testimonial-highlight">{highlight}</mark>
      {`${quote.slice(at + highlight.length)}”`}
    </>
  );
}

export function Testimonials({ layers = "polished", z = 0, id, testimonials = TESTIMONIALS }: Props) {
  return (
    <Panel name="Testimonials" z={z} id={id} layers={layers}>
      <div className="testimonials section">
        <h2 className="section-title">Testimonials</h2>
        <ul className="testimonials-grid">
          {testimonials.map((t, i) => (
            <li key={`${t.original}-${i}`} className="testimonial-item">
              <a
                className="card testimonial-card"
                href={`/testimonials/${t.original}.png`}
                target="_blank"
                rel="noopener noreferrer"
                data-testimonial
              >
                <blockquote className="testimonial-quote">
                  <QuoteText quote={t.quote} highlight={t.highlight} />
                </blockquote>
                <p className="testimonial-source">{[t.roleLabel, t.employer, t.year].join(" · ")}</p>
                <span className="sr-only">View original screenshot (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
