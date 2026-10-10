"use client";

import Link from "next/link";
import { useState } from "react";
import { FLY_CONFIG } from "@/components/flythrough/config";
import { useDwellStep } from "@/components/flythrough/dwell-store";
import { useRenderMode } from "@/components/flythrough/render-mode";
import { ALL_STEPS, FEEDBACK_EDGE, INTRO, fileUrl, nodeById, type ToolkitNode } from "@/content/ai-toolkit";
import { Panel, type PanelLayers } from "../Panel";
import "./ai-toolkit.css";

export type StepState = "done" | "active" | "upcoming";

/** Pure: state of step `i` when `active` is the current step (steps before it are done). */
export function stepState(i: number, active: number): StepState {
  return i < active ? "done" : i === active ? "active" : "upcoming";
}

function Inspect({ node, onClose }: { node: ToolkitNode; onClose: () => void }) {
  return (
    <aside
      className="ai-inspect"
      role="region"
      aria-label={`${node.name} details`}
      data-testid="ai-inspect"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="ai-inspect-head">
        <h3 className="ai-inspect-title">{node.name}</h3>
        <span className={`ai-tier ai-tier--${node.tier.toLowerCase()}`}>{node.tier}</span>
        <button type="button" className="ai-inspect-close" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="ai-inspect-excerpt">{node.excerpt}</p>
      <div className="ai-inspect-io">
        <div>
          <h4>Inputs</h4>
          <ul>
            {node.inputs.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Outputs</h4>
          <ul>
            {node.outputs.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <a className="ai-inspect-link" href={fileUrl(node.path)} target="_blank" rel="noopener noreferrer">
        View the {node.kind} file on GitHub
      </a>
    </aside>
  );
}

export function AIToolkit({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  const mode = useRenderMode();
  const index = Math.abs(Math.round(z / FLY_CONFIG.depth));
  const scrollStep = useDwellStep(index, ALL_STEPS.length);
  // Complete mode (Classic, reduced motion): every step done, no scroll stepping.
  const active = mode === "complete" ? ALL_STEPS.length : scrollStep;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? nodeById(openId) : null;

  return (
    <Panel name="AIToolkit" z={z} id={id} layers={layers}>
      <h2 className="ai-heading">AI toolkit</h2>
      <p className="ai-intro">{INTRO}</p>
      <div className="ai-diagram" data-testid="ai-diagram" data-mode={mode} data-active-step={active}>
        <div className="ai-flow">
        <div className="ai-feedback" data-testid="ai-feedback-edge" data-from={FEEDBACK_EDGE.from} data-to={FEEDBACK_EDGE.to} aria-hidden="true">
          <span className="ai-feedback-label">{FEEDBACK_EDGE.label}</span>
        </div>
        <ol className="ai-steps">
          {ALL_STEPS.map((step, i) => (
            <li
              key={step.id}
              className={`ai-step${step.id === FEEDBACK_EDGE.from ? " ai-step--loop" : ""}`}
              data-step={step.id}
              data-state={stepState(i, active)}
            >
              <span className="ai-step-num">{step.id === FEEDBACK_EDGE.from ? "Loop" : `Step ${i + 1}`}</span>
              <h3 className="ai-step-title">{step.title}</h3>
              <p className="ai-step-blurb">{step.blurb}</p>
              <ul className="ai-nodes">
                {step.nodes.map((nid) => {
                  const node = nodeById(nid);
                  return (
                    <li key={nid}>
                      <button
                        type="button"
                        className="ai-node"
                        data-node={nid}
                        aria-expanded={openId === nid}
                        onClick={() => setOpenId(openId === nid ? null : nid)}
                      >
                        <span className="ai-node-name">{node.name}</span>
                        <span className={`ai-tier ai-tier--${node.tier.toLowerCase()}`}>{node.tier}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
        </div>
        {open ? <Inspect node={open} onClose={() => setOpenId(null)} /> : null}
      </div>
      <p className="ai-more">
        <Link href="/work/ai-toolkit">Read the case study</Link>
      </p>
    </Panel>
  );
}
