"use client";

import { useContext, type ReactNode } from "react";
import { StageContext } from "./flythrough/stage-context";

export type PanelLayers = "both" | "polished" | "sketch";

type PanelProps = {
  /** Component name shown in the tag, e.g. "Hero" renders `<Hero /> z=0`. */
  name: string;
  z?: number;
  id?: string;
  layers?: PanelLayers;
  children: ReactNode;
};

/*
 * Render-mode contract (see flythrough/render-mode.ts): panels whose content
 * depends on scroll or stage progress call `useRenderMode()`. "complete"
 * (flat pages: Classic, reduced motion, downgraded; also the default) means
 * show the final, fully revealed state, e.g. the AI diagram with every step
 * done. "staged" (inside the fly-through) allows stepping/animation.
 * FlatStack provides "complete"; FlyThroughLoader provides "staged".
 */

/**
 * Renders its children once per visible layer with an identical layout.
 * Only color, background, border color and border style differ between layers
 * (see .panel-layer rules in globals.css).
 */
export function Panel({ name, z = 0, id, layers = "polished", children }: PanelProps) {
  const tag = `<${name} /> z=${z}`;
  const inStage = useContext(StageContext);
  if (inStage && layers !== "sketch") {
    const layer = (kind: "sketch" | "polished") => (
      <div className={`panel-layer panel-layer--${kind}`} data-layer={kind}>
        <span className="panel-tag">{tag}</span>
        {/* Panels share one box size in the stage; FlyStage scales this body down when its content runs taller. */}
        <div className="panel-body" data-panel-body="">
          {children}
        </div>
      </div>
    );
    return (
      <section className="panel" id={id} data-panel={name}>
        {layer("polished")}
        {/* The sketch copy is visual only: hidden from assistive tech and keyboard focus. */}
        <div className="panel-wipe" data-wipe="" aria-hidden="true" inert>
          <div className="panel-wipe-inner" data-wipe-inner="">
            {layer("sketch")}
          </div>
        </div>
        <div className="panel-wipe-edge" data-wipe-edge="" aria-hidden="true">
          <div className="build-line" />
          <div className="dither-band dither-band--dense" />
          <div className="dither-band dither-band--sparse" />
        </div>
      </section>
    );
  }
  const kinds = layers === "both" ? (["sketch", "polished"] as const) : ([layers] as const);
  return (
    <section className="panel" id={id} data-panel={name}>
      {kinds.map((kind) => (
        <div
          key={kind}
          className={`panel-layer panel-layer--${kind}`}
          data-layer={kind}
          style={
            // Only the dual-layer view needs 3D offsets; flat renders carry no transform.
            layers === "both"
              ? { transform: `translateZ(${kind === "polished" ? 1 : 0}px)` }
              : undefined
          }
        >
          {/* The z tag belongs to the 3D stage; the flat classic page shows only the content. */}
          {layers !== "polished" && <span className="panel-tag">{tag}</span>}
          {children}
        </div>
      ))}
    </section>
  );
}
