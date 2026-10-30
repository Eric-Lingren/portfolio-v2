import cards from "@/content/work-cards.json";
import { Panel, type PanelLayers } from "@/components/Panel";
import "./selected-work.css";

export type WorkCard = {
  slug: string;
  title: string;
  outcome: string;
  number: string | null;
  numberLabel: string;
  thumbnail: string;
  /** Width-descriptor srcset when a retina thumb-2x exists, else null. */
  thumbnailSrcSet: string | null;
  /** Picks the duotone filter (WorkThumbFilters) that maps the image onto the site palette. */
  thumbnailTone: "light" | "dark";
  hasThumbnail: boolean;
};

// Rendered thumb width per layout in selected-work.css: phone row 7rem, tablet two across, desktop three across.
const THUMB_SIZES = "(max-width: 600px) 112px, (max-width: 760px) 50vw, 368px";

function WorkThumb({ card }: { card: WorkCard }) {
  const img = {
    src: card.thumbnail,
    srcSet: card.thumbnailSrcSet ?? undefined,
    sizes: card.thumbnailSrcSet ? THUMB_SIZES : undefined,
    width: 568,
    height: 284,
    loading: "lazy",
    decoding: "async",
  } as const;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="work-thumb-real" alt="" {...img} />
      {/*
        Tinted copy on top, faded out on hover/focus to reveal full color. A filter cannot transition
        to or from url(), so the fade runs on this layer's opacity. Same URL, so one download.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="work-thumb-tint" alt="" aria-hidden="true" data-tone={card.thumbnailTone} {...img} />
    </>
  );
}

export function SelectedWork({
  layers = "polished",
  z = 0,
  id,
  items = cards as WorkCard[],
}: {
  layers?: PanelLayers;
  z?: number;
  id?: string;
  items?: WorkCard[];
}) {
  return (
    <Panel name="SelectedWork" z={z} id={id} layers={layers}>
      <div className="work section">
        <h2 className="section-title">Selected work</h2>
        <ul className="work-grid" role="list">
          {items.map((c) => (
            <li key={c.slug} className="work-item">
              <a className="card work-card" href={`/work/${c.slug}`} data-card={c.slug}>
                <div className="work-thumb">
                  {c.hasThumbnail ? (
                    <WorkThumb card={c} />
                  ) : (
                    <div className="work-thumb-real work-thumb-missing" aria-hidden="true" />
                  )}
                  {/* Sketch-layer frame over the thumb. The thumb itself draws as a wireframe; a missing one gets hatching and an image icon. */}
                  <div className={c.hasThumbnail ? "work-thumb-sketch" : "work-thumb-sketch sketch-image"} aria-hidden="true">
                    {c.hasThumbnail ? null : (
                      <svg className="work-thumb-icon" viewBox="0 0 48 32" aria-hidden="true" focusable="false">
                        <rect x="1" y="1" width="46" height="30" rx="2" />
                        <circle cx="35" cy="10" r="3.5" />
                        <polyline points="1,27 14,13 23,22 30,16 47,29" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="work-card-title">{c.title}</h3>
                <p className="work-card-outcome">{c.outcome}</p>
                {c.number ? (
                  <p className="work-card-number">
                    <strong>{c.number}</strong> <span>{c.numberLabel}</span>
                  </p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
