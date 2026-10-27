import { PLACEHOLDER_COUNT, TESTIMONIALS, type Testimonial } from "@/content/testimonials";
import { Panel, type PanelLayers } from "../Panel";
import "./testimonials.css";

type Props = {
  layers?: PanelLayers;
  z?: number;
  id?: string;
  /** Defaults to the redaction script's manifest. */
  manifest?: readonly Testimonial[];
};

export function Testimonials({ layers = "polished", z = 0, id, manifest = TESTIMONIALS }: Props) {
  const empty = manifest.length === 0;
  return (
    <Panel name="Testimonials" z={z} id={id} layers={layers}>
      <div className="testimonials section">
        <h2 className="section-title">Testimonials</h2>
        <ul className="testimonials-grid">
          {empty
            ? Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                <li key={i} className="testimonial-card" data-testimonial-placeholder>
                  <div className="testimonial-placeholder">Placeholder: redacted praise screenshot goes here</div>
                  <p className="testimonial-role">[ERIC: role label]</p>
                </li>
              ))
            : manifest.map((t) => (
                <li key={t.id} className="testimonial-card" data-testimonial>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-redacted PNGs */}
                  <img className="testimonial-frame" src={t.image} alt={t.alt} loading="lazy" decoding="async" />
                  <p className="testimonial-role">{t.roleLabel}</p>
                </li>
              ))}
        </ul>
      </div>
    </Panel>
  );
}
