"use client";

import { useSyncExternalStore } from "react";
import { getActiveSection, subscribeActiveSection } from "@/components/active-section";
import { isFlat, resolveMode } from "@/components/flythrough/mode";
import { RESUME_PATH } from "@/content/site";
import "./nav.css";

export const NAV_LINKS = [
  { id: "what-i-do", label: "What I do" },
  { id: "work", label: "Work" },
  { id: "ai-toolkit", label: "AI toolkit" },
  { id: "experience", label: "Experience" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
] as const;

export type NavView = "interactive" | "classic";

/** URL for the requested view. Interactive drops the param; mode.ts decides the rest. */
export function viewHref(view: NavView, href: string): string {
  const url = new URL(href);
  if (view === "classic") url.searchParams.set("view", "classic");
  else url.searchParams.delete("view");
  return url.toString();
}

const subscribe = () => () => {};
const readView = (): NavView =>
  isFlat(resolveMode({ search: window.location.search, reducedMotion: false, downgraded: false }))
    ? "classic"
    : "interactive";

/**
 * Site nav. Anchors are plain `#id` links: in flat mode the browser scrolls to
 * the element; in the fly-through, FlyStage intercepts the click and scrolls to
 * the offset from camera.ts panelScrollTop. The view switch navigates with
 * ?view=, and mode.ts resolves it on load, same as the flat fallback.
 */
export function Nav({ navigate = (url: string) => window.location.assign(url) }: { navigate?: (url: string) => void }) {
  const view = useSyncExternalStore(subscribe, readView, () => "interactive" as NavView);
  const active = useSyncExternalStore(subscribeActiveSection, getActiveSection, () => null);

  const choose = (next: NavView) => {
    if (next === view) return;
    navigate(viewHref(next, window.location.href));
  };

  return (
    <>
      <header className="site-nav">
        <a className="site-nav__brand" href="#hero">
          Eric Lingren
        </a>
        <nav aria-label="Sections" className="site-nav__links">
          {NAV_LINKS.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? "location" : undefined}>
              <span className="site-nav__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="site-nav__right">
          <a className="site-nav__resume" href={RESUME_PATH}>
            Resume
            <span className="btn-arrow btn-arrow--out" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </header>
      {/* Outside the header: its backdrop-filter would pin a fixed child to the bar, not the viewport. */}
      <div role="radiogroup" aria-label="View" className="view-switch">
        {(["interactive", "classic"] as const).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => choose(v)}>
            {v === "interactive" ? "Interactive" : "Classic"}
          </button>
        ))}
      </div>
    </>
  );
}
