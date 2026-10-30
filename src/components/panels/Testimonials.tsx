import type { ReactNode } from "react";
import { TESTIMONIALS, type Testimonial } from "@/content/testimonials";
import { Panel, type PanelLayers } from "../Panel";
import "./testimonials.css";

type Props = {
  layers?: PanelLayers;
  z?: number;
  id?: string;
  testimonials?: readonly Testimonial[];
};

/** Wraps each highlight phrase in a <mark>; phrases that are empty, not found, or overlap an earlier one stay plain. */
function QuoteText({ quote, highlights = [] }: Pick<Testimonial, "quote" | "highlights">) {
  const spans = highlights
    .map((h) => {
      const at = h ? quote.indexOf(h) : -1;
      return { at, end: at + h.length };
    })
    .filter((s) => s.at >= 0)
    .sort((a, b) => a.at - b.at)
    .reduce<{ at: number; end: number }[]>((kept, s) => (s.at >= (kept.at(-1)?.end ?? 0) ? [...kept, s] : kept), []);
  const parts: ReactNode[] = ["“"];
  let cursor = 0;
  spans.forEach(({ at, end }) => {
    parts.push(
      quote.slice(cursor, at),
      <mark key={at} className="testimonial-highlight">
        {quote.slice(at, end)}
      </mark>,
    );
    cursor = end;
  });
  parts.push(quote.slice(cursor), "”");
  return <>{parts}</>;
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
                  <QuoteText quote={t.quote} highlights={t.highlights} />
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
