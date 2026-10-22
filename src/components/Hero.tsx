import { MAILTO_URL } from "@/content/site";
import { Panel, type PanelLayers } from "./Panel";

export function Hero({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  return (
    <Panel name="Hero" z={z} id={id} layers={layers}>
      <div className="hero">
        {/* Redlines: design-markup notes painted on the sketch layer only, so the build wipe sweeps them away. */}
        <span className="hero-redline hero-redline--guide" aria-hidden="true" />
        <p className="hero-eyebrow">FRONTEND-FIRST FULL-STACK ENGINEER</p>
        <div className="hero-name-wrap">
          <h1 className="hero-name">
            <span>Eric</span>
            <span>Lingren</span>
          </h1>
          <span className="hero-redline hero-redline--select" aria-hidden="true" />
          <span className="hero-redline hero-redline--gap hero-redline--above" aria-hidden="true">
            <span className="hero-redline__label">gap 7vh</span>
          </span>
          <span className="hero-redline hero-redline--gap hero-redline--below" aria-hidden="true">
            <span className="hero-redline__label">gap 7vh</span>
          </span>
          <span className="hero-redline hero-redline--spec" aria-hidden="true">
            <span className="hero-redline__label">h1 / 600 / clamp(52px, 10vw, 136px)</span>
          </span>
        </div>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#work">
            View work
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a className="btn btn-outline" href={MAILTO_URL}>
            Email me
            <span className="btn-arrow btn-arrow--out" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>
    </Panel>
  );
}
