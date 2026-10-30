"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getActiveSection, subscribeActiveSection } from "@/components/active-section";
import { isFlat, resolveMode } from "@/components/flythrough/mode";
import { BrandMark } from "@/components/BrandMark";
import { CloseIcon, MenuIcon } from "./icons";
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
  isFlat(resolveMode({ search: window.location.search, reducedMotion: false, downgraded: false, mobile: false }))
    ? "classic"
    : "interactive";

/**
 * Site nav. Anchors are plain `#id` links: in flat mode the browser scrolls to
 * the element; in the fly-through, FlyStage intercepts the click and scrolls to
 * the offset from camera.ts panelScrollTop. The view switch navigates with
 * ?view=, and mode.ts resolves it on load, same as the flat fallback.
 * On phones the links fold into a Menu disclosure and the switch is hidden:
 * phones always get Classic.
 */
export function Nav({ navigate = (url: string) => window.location.assign(url) }: { navigate?: (url: string) => void }) {
  const view = useSyncExternalStore(subscribe, readView, () => "interactive" as NavView);
  const active = useSyncExternalStore(subscribeActiveSection, getActiveSection, () => null);

  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLElement>(null);

  // The open menu closes on Escape (focus back to the toggle) or a tap outside the bar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // Below desktop the links scroll sideways; flag when they overflow so CSS fades the clipped edges.
  useEffect(() => {
    const row = linksRef.current;
    if (!row || typeof ResizeObserver === "undefined") return;
    const check = () => row.toggleAttribute("data-overflow", row.scrollWidth > row.clientWidth + 1);
    const ro = new ResizeObserver(check);
    ro.observe(row);
    check();
    return () => ro.disconnect();
  }, []);

  // Keep the active link in view inside the scrolling row. A no-op when they all fit.
  useEffect(() => {
    const row = linksRef.current;
    const link = row?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!row || !link || row.scrollWidth <= row.clientWidth) return;
    const left = link.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + link.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: left - 8, behavior: "smooth" });
    }
  }, [active]);

  const choose = (next: NavView) => {
    if (next === view) return;
    navigate(viewHref(next, window.location.href));
  };

  return (
    <>
      <header className="site-nav" ref={headerRef} data-open={open || undefined}>
        <a className="site-nav__brand" href="#hero" onClick={() => setOpen(false)}>
          <BrandMark className="site-nav__mark" />
          Eric Lingren
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="site-nav__toggle"
          aria-expanded={open}
          aria-controls="site-nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
          Menu
        </button>
        <nav id="site-nav-links" aria-label="Sections" className="site-nav__links" ref={linksRef}>
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={active === l.id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="site-nav__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </a>
          ))}
        </nav>
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
