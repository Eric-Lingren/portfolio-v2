"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type TouchEvent } from "react";
import { HEADING, REPO_URL, STAGES, fileUrl } from "@/content/ai-toolkit";
import { Panel, type PanelLayers } from "../Panel";
import { AIToolkitScene } from "./AIToolkitScene";
import "./ai-toolkit.css";

/** Any of these swaps the 3D scene for the flat stage strip. */
export const FLAT_QUERY = "(max-width: 700px), (prefers-reduced-motion: reduce), (pointer: coarse)";

const subscribeFlat = (cb: () => void) => {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(FLAT_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
// No matchMedia (old browsers, tests) means no 3D either.
const flatSnap = () => typeof window.matchMedia !== "function" || window.matchMedia(FLAT_QUERY).matches;
const useFlat = () => useSyncExternalStore(subscribeFlat, flatSnap, () => false);

const SWIPE_PX = 48;

function Stepper({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  const [glFailed, setGlFailed] = useState(false);
  const onUnsupported = useCallback(() => setGlFailed(true), []);
  const flat = useFlat() || glFailed;
  const last = STAGES.length - 1;
  const s = STAGES[step];

  // Focus moves to the stage card heading after a visitor action, never on mount.
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);
  const go = useCallback(
    (n: number) => {
      moved.current = true;
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
    <div className="ai-root" data-testid="ai-diagram">
      <h2 className="ai-heading">{HEADING}</h2>
      {flat ? (
        <div className="ai-strip" data-testid="ai-strip">
          {STAGES.map((x, i) => (
            <button key={x.id} type="button" className="ai-strip-stage" aria-current={i === step ? "step" : undefined} onClick={() => go(i)}>
              <span className="ai-stage-num">{i + 1}</span> {x.title}
            </button>
          ))}
        </div>
      ) : (
        <AIToolkitScene step={step} onPick={go} onUnsupported={onUnsupported} />
      )}
      <div className="ai-row" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <article className="ai-card" aria-live="polite" data-stage={s.id}>
          <h3 className="ai-card-title" tabIndex={-1} ref={heading}>
            <span className="ai-stage-num">{step + 1}</span> {s.title}
          </h3>
          <p className="ai-summary">{s.summary}</p>
          <ul className="ai-skill-list">
            {s.skills.map((k) => (
              <li key={k.id}>
                {k.path ? (
                  <a className="ai-skill-name" href={fileUrl(k.path)} target="_blank" rel="noopener noreferrer">
                    {k.name} ↗
                  </a>
                ) : (
                  <span className="ai-skill-name">{k.name}</span>
                )}
                <span className="ai-skill-tip">{k.tip}</span>
              </li>
            ))}
          </ul>
        </article>
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
