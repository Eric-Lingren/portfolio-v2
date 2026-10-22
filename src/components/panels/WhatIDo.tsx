import { PILLARS } from "@/content/positioning";
import { Panel, type PanelLayers } from "../Panel";
import { PillarViz } from "./PillarViz";
import "./what-i-do.css";

export function WhatIDo({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  return (
    <Panel name="WhatIDo" z={z} id={id} layers={layers}>
      <div className="what-i-do">
        <h2 className="wid-title">What I do</h2>
        <div className="pillars">
          {PILLARS.map((p) => (
            <article className="pillar" data-viz={p.viz} key={p.title}>
              <PillarViz kind={p.viz} />
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-sentence">{p.sentence}</p>
              <p className="pillar-outcome">
                <span className="pillar-outcome-label">What you get</span>
                <span>{p.outcome}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}
