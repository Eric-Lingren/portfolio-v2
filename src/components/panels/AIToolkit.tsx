"use client";

import Link from "next/link";
import { useRef, useState, type TouchEvent } from "react";
import { HEADING, KEYWORDS, REPO_URL, STAGES, fileUrl } from "@/content/ai-toolkit";
import { Panel, type PanelLayers } from "../Panel";
import "./ai-toolkit.css";

const SWIPE_PX = 48;

type Stage = (typeof STAGES)[number];

function CardBody({ stage, num }: { stage: Stage; num: number }) {
  return (
    <>
      <h3 className="ai-card-title">
        <span className="ai-stage-num">{num}</span> {stage.title}
      </h3>
      <p className="ai-summary">{stage.summary}</p>
      <ul className="ai-skill-list">
        {stage.skills.map((k) => (
          <li key={k.id}>
            <a className="ai-skill-name" href={fileUrl(k.path)} target="_blank" rel="noopener noreferrer">
              {k.name} ↗
            </a>
            <span className="ai-skill-model" data-model={k.model}>
              {k.model}
            </span>
            <span className="ai-skill-tip">{k.tip}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Stepper({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  const last = STAGES.length - 1;
  const s = STAGES[step];
  const go = (n: number) => setStep(Math.max(0, Math.min(last, n)));

  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > SWIPE_PX) go(step + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="ai-root" data-testid="ai-diagram">
      <h2 className="ai-heading">{HEADING}</h2>
      <ul className="ai-keywords" aria-label="Skills and tooling">
        {KEYWORDS.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      {/* Wide screens show the five stages with arrows. Hover, focus or click picks the card below. */}
      <div className="ai-track">
        {STAGES.map((x, i) => (
          <button
            key={x.id}
            type="button"
            className="ai-stage"
            aria-current={i === step ? "step" : undefined}
            onMouseEnter={() => go(i)}
            onFocus={() => go(i)}
            onClick={() => go(i)}
          >
            <span className="ai-stage-num">{i + 1}</span> {x.title}
          </button>
        ))}
      </div>
      {/* Narrow screens swap in the compact strip (CSS). */}
      <div className="ai-strip" data-testid="ai-strip">
        {STAGES.map((x, i) => (
          <button key={x.id} type="button" className="ai-strip-stage" aria-current={i === step ? "step" : undefined} onClick={() => go(i)}>
            <span className="ai-stage-num">{i + 1}</span> {x.title}
          </button>
        ))}
      </div>
      <div className="ai-row" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="ai-card-stack">
          {STAGES.map((x, i) => (
            <div key={x.id} className="ai-card ai-card-ghost" aria-hidden="true" inert>
              <CardBody stage={x} num={i + 1} />
            </div>
          ))}
          <article className="ai-card" aria-live="polite" data-stage={s.id}>
            <CardBody stage={s} num={step + 1} />
          </article>
        </div>
        <div className="ai-ctas">
          <Link className="btn btn-primary" href="/work/ai-toolkit">
            Read the case study <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
          <a className="btn btn-outline" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            Browse the toolkit on GitHub <span className="btn-arrow btn-arrow--out" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function AIToolkit({ layers = "polished", z = 0, id }: { layers?: PanelLayers; z?: number; id?: string }) {
  // Step lives above Panel so the polished and sketch copies show the same stage.
  const [step, setStep] = useState(0);
  return (
    <Panel name="AIToolkit" z={z} id={id} layers={layers}>
      <Stepper step={step} setStep={setStep} />
    </Panel>
  );
}
