import { MAILTO_URL } from "@/content/site";
import { Panel, type PanelLayers } from "./Panel";

export function Hero({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  return (
    <Panel name="Hero" z={z} id={id} layers={layers}>
      <div className="hero">
        <p className="hero-eyebrow">FRONTEND-FIRST FULL-STACK ENGINEER</p>
        <h1 className="hero-name">
          <span>Eric</span>
          <span>Lingren</span>
        </h1>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#work">
            View work
          </a>
          <a className="btn btn-outline" href={MAILTO_URL}>
            Email me
          </a>
        </div>
      </div>
    </Panel>
  );
}
