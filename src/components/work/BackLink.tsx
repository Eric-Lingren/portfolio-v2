"use client";

import type { MouseEvent } from "react";

/** True when the page before this one in the tab was on this site, so history.back() stays on the site. */
export function cameFromSite(): boolean {
  if (window.history.length < 2 || !document.referrer) return false;
  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

/*
 * Returns to the page the reader came from, at the scroll position and view mode (Classic or Interactive)
 * they left. A plain link to the fallback would reset both and push a new history entry. Direct visits,
 * new tabs and modified clicks follow the fallback href, as a full page load so the home page runs its
 * hash and scroll rules from a clean start.
 */
export function BackLink({ className, fallback }: { className?: string; fallback: string }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!cameFromSite()) return;
    e.preventDefault();
    window.history.back();
  };
  return (
    <a className={className} href={fallback} onClick={onClick}>
      Back
    </a>
  );
}
