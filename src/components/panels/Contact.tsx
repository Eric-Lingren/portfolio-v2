"use client";

import { useEffect, useState } from "react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, MAILTO_URL, PROFILE_IMAGE_PATH } from "@/content/site";
import { CheckIcon, CopyIcon, GitHubIcon, LinkedInIcon, MailIcon } from "../icons";
import { Panel, type PanelLayers } from "../Panel";
import "./contact.css";

type Props = {
  layers?: PanelLayers;
  z?: number;
  id?: string;
};

/** Clipboard API first; falls back to a hidden textarea + execCommand. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function Contact({ layers = "polished", z = 0, id }: Props) {
  const [status, setStatus] = useState("");
  const copied = status === "Copied";

  // The check icon is the visible confirmation; it flips back after a moment.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setStatus(""), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function onCopy() {
    const ok = await copyText(EMAIL);
    setStatus(ok ? "Copied" : "Copy failed. Select the address and copy it manually.");
  }

  return (
    <Panel name="Contact" z={z} id={id} layers={layers}>
      <div className="contact section">
        <h2 className="section-title">
          Building something interesting?{" "}
          <span className="contact-title__invite">Let&apos;s talk.</span>
        </h2>
        <div className="contact-main">
          <div className="contact-photo" data-contact-photo>
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img src={PROFILE_IMAGE_PATH} alt="Eric Lingren" width={200} height={200} decoding="async" />
          </div>
          <div className="contact-cta">
            <div className="contact-email">
              <button type="button" className="contact-email__address" title="Copy email" onClick={onCopy}>
                {EMAIL}
              </button>
              <button
                type="button"
                className="icon-btn contact-btn"
                aria-label="Copy email"
                title="Copy email"
                onClick={onCopy}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <a
                className="icon-btn contact-btn contact-btn--link"
                href={MAILTO_URL}
                aria-label="Send an email"
                title="Send an email"
              >
                <MailIcon />
              </a>
              <span className={`contact-status${status && !copied ? "" : " sr-only"}`} role="status" aria-live="polite">
                {status}
              </span>
            </div>
            <div className="contact-links section-actions">
              <a className="btn btn-outline contact-btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <GitHubIcon />
                GitHub
                <span className="btn-arrow btn-arrow--out" aria-hidden="true">
                  ↗
                </span>
              </a>
              <a className="btn btn-outline contact-btn" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                <LinkedInIcon />
                LinkedIn
                <span className="btn-arrow btn-arrow--out" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
