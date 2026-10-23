"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject, type TouchEvent } from "react";
import { HEADING, REPO_URL, STAGES, fileUrl } from "@/content/ai-toolkit";
import { Panel, type PanelLayers } from "../Panel";
import "./ai-toolkit.css";

const SWIPE_PX = 48;

type Stage = (typeof STAGES)[number];

function CardBody({ stage, num, headingRef }: { stage: Stage; num: number; headingRef?: RefObject<HTMLHeadingElement | null> }) {
  return (
    <>
      <h3 className="ai-card-title" tabIndex={-1} ref={headingRef}>
        <span className="ai-stage-num">{num}</span> {stage.title}
      </h3>
      <p className="ai-summary">{stage.summary}</p>
      <ul className="ai-skill-list">
        {stage.skills.map((k, j) => (
          <li key={k.id} style={{ "--j": j } as CSSProperties}>
            <a className="ai-skill-name" href={fileUrl(k.path)} target="_blank" rel="noopener noreferrer">
              {k.name} ↗
            </a>
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

  // Focus moves to the stage card heading after a visitor action, never on mount.
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  // Step-change motion waits for the first visitor action so the first paint stays still.
  const [stepped, setStepped] = useState(false);
  useEffect(() => {
    if (moved.current) heading.current?.focus({ preventScroll: true });
  }, [step]);
  const go = useCallback(
    (n: number) => {
      moved.current = true;
      setStepped(true);
      setStep(Math.max(0, Math.min(last, n)));
    },
    [setStep, last],
  );

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
    <div className="ai-root" data-testid="ai-diagram" data-stepped={stepped || undefined}>
      <h2 className="ai-heading">{HEADING}</h2>
      {/* Wide screens show every stage at once. Narrow screens swap in the compact strip (CSS). */}
      <div className="ai-track">
        {STAGES.map((x, i) => (
          <div key={x.id} className="ai-stage" data-active={i === step} style={{ "--i": i } as CSSProperties} onClick={() => go(i)}>
            <button type="button" className="ai-stage-title" aria-current={i === step ? "step" : undefined}>
              <span className="ai-stage-num">{i + 1}</span> {x.title}
            </button>
            {/* Big copy of the title that starts centred and slides up onto the real one (CSS). */}
            <span className="ai-stage-hero" aria-hidden="true">
              <span className="ai-stage-hero-text">
                <span className="ai-stage-num">{i + 1}</span> {x.title}
              </span>
            </span>
            <ul className="ai-skills">
              {x.skills.map((k, j) => (
                <li key={k.id} className="ai-skill" data-name={k.name} data-tip={k.tip} style={{ "--j": j } as CSSProperties}>
                  {k.question}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
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
            {/* Keyed so the entrance replays per step; the live region itself stays mounted. */}
            <div key={s.id} className="ai-card-body">
              <CardBody stage={s} num={step + 1} headingRef={heading} />
            </div>
          </article>
        </div>
        <div className="ai-side">
          <div className="ai-controls">
            <button type="button" className="btn btn-outline" onClick={() => go(step - 1)} disabled={step === 0}>
              <span className="btn-arrow btn-arrow--back" aria-hidden="true">←</span> Back
            </button>
            <ol className="ai-chips" aria-label="Stages">
              {STAGES.map((x, i) => (
                <li key={x.id}>
                  <button type="button" className="ai-chip" aria-label={`${i + 1}: ${x.title}`} aria-current={i === step ? "step" : undefined} onClick={() => go(i)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="btn btn-outline" onClick={() => go(step + 1)} disabled={step === last}>
              Next <span className="btn-arrow" aria-hidden="true">→</span>
            </button>
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
