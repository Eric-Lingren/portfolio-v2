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
  hasThumbnail: boolean;
};

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
      <div className="work">
        <h2 className="work-title">Selected work</h2>
        <ul className="work-grid">
          {items.map((c) => (
            <li key={c.slug} className="work-item">
              <a className="work-card" href={`/work/${c.slug}`} data-card={c.slug}>
                <div className="work-thumb">
                  <div className="work-thumb-sketch sketch-image" aria-hidden="true">
                    <span className="work-thumb-x">X</span>
                  </div>
                  {c.hasThumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="work-thumb-real" src={c.thumbnail} alt="" loading="lazy" />
                  ) : (
                    <div className="work-thumb-real work-thumb-missing" aria-hidden="true" />
                  )}
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
