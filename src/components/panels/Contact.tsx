"use client";

import { useState } from "react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, MAILTO_URL, PROFILE_IMAGE_PATH, RESUME_PATH } from "@/content/site";
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

  async function onCopy() {
    const ok = await copyText(EMAIL);
    setStatus(ok ? "Copied" : "Copy failed. Select the address and copy it manually.");
  }

  return (
    <Panel name="Contact" z={z} id={id} layers={layers}>
      <div className="contact section">
        <h2 className="section-title">Building something interesting? Let&apos;s talk.</h2>
        <div className="contact-main">
          <div className="contact-photo" data-contact-photo>
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img src={PROFILE_IMAGE_PATH} alt="Eric Lingren" width={150} height={150} decoding="async" />
          </div>
          <div className="contact-cta">
            <p className="contact-email">{EMAIL}</p>
            <div className="section-actions">
              <button type="button" className="btn btn-outline contact-btn" onClick={onCopy}>
                Copy email
                <span className="btn-arrow btn-arrow--copy" aria-hidden="true">
                  ⧉
                </span>
              </button>
              <a className="btn btn-primary contact-btn contact-btn--link" href={MAILTO_URL}>
                Send an email
                <span className="btn-arrow btn-arrow--out" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
            <p className="contact-status" role="status" aria-live="polite">
              {status}
            </p>
          </div>
        </div>
        <ul className="contact-links">
          <li>
            <a href={GITHUB_URL}>GitHub</a>
          </li>
          <li>
            <a href={LINKEDIN_URL}>LinkedIn</a>
          </li>
          <li>
            <a href={RESUME_PATH} download>
              Resume (PDF)
            </a>
          </li>
        </ul>
      </div>
    </Panel>
  );
}
