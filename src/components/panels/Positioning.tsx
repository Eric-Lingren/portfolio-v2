import { PILLARS } from "@/content/positioning";
import { Panel, type PanelLayers } from "../Panel";
import "./positioning.css";

export function Positioning({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  return (
    <Panel name="Positioning" z={z} id={id} layers={layers}>
      <h2 className="pos-heading">Positioning</h2>
      <div className="positioning">
        {PILLARS.map((p) => (
          <article className="pillar" key={p.title}>
            <div className="pillar-thumb" aria-hidden="true" />
            <h3 className="pillar-title">{p.title}</h3>
            <p className="pillar-sentence">{p.sentence}</p>
            <p className="pillar-proof">{p.proof.href ? <a href={p.proof.href}>{p.proof.text}</a> : p.proof.text}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
