"use client";

import Link from "next/link";
import { useState } from "react";
import { ALL_STEPS, FEEDBACK_EDGE, INTRO, fileUrl, nodeById, type ToolkitNode } from "@/content/ai-toolkit";
import { Panel, type PanelLayers } from "../Panel";
import { AIStatsStrip } from "./AIStatsStrip";
import "./ai-toolkit.css";

/** Steps with more nodes than this span two grid columns so their chips sit side by side. */
const WIDE_STEP_NODES = 3;

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
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? nodeById(openId) : null;

  return (
    <Panel name="AIToolkit" z={z} id={id} layers={layers}>
      <h2 className="ai-heading">AI toolkit</h2>
      <p className="ai-intro">{INTRO}</p>
      <AIStatsStrip />
      <div className="ai-diagram" data-testid="ai-diagram">
        <div className="ai-flow">
        <div className="ai-feedback" data-testid="ai-feedback-edge" data-from={FEEDBACK_EDGE.from} data-to={FEEDBACK_EDGE.to} aria-hidden="true">
          <span className="ai-feedback-label">{FEEDBACK_EDGE.label}</span>
        </div>
        <ol className="ai-steps">
          {ALL_STEPS.map((step, i) => (
            <li
              key={step.id}
              className={`ai-step${step.id === FEEDBACK_EDGE.from ? " ai-step--loop" : ""}${step.nodes.length > WIDE_STEP_NODES ? " ai-step--wide" : ""}`}
              data-step={step.id}
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
