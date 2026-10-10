import type { ReactNode } from "react";
import { Hero } from "@/components/Hero";
import { Panel } from "@/components/Panel";
import { SelectedWork } from "@/components/panels/SelectedWork";
import { Positioning } from "@/components/panels/Positioning";
import { Experience } from "@/components/panels/Experience";

export type PanelEntry = {
  id: string;
  name: string;
  title: string;
  /** Renders the panel. `z` is the panel's world depth for the component tag. */
  render: (z: number) => ReactNode;
};

/** Minimal stand-in; later tasks replace these one by one. */
function standIn(id: string, name: string, title: string): PanelEntry {
  return {
    id,
    name,
    title,
    render: (z) => (
      <Panel name={name} z={z} id={id}>
        <h2 className="standin-title">{title}</h2>
      </Panel>
    ),
  };
}

export const PANELS: readonly PanelEntry[] = [
  { id: "hero", name: "Hero", title: "Hero", render: (z) => <Hero z={z} id="hero" /> },
  { id: "positioning", name: "Positioning", title: "Positioning", render: (z) => <Positioning z={z} id="positioning" /> },
  standIn("ai-toolkit", "AIToolkit", "AI toolkit"),
  { id: "work", name: "SelectedWork", title: "Selected work", render: (z) => <SelectedWork z={z} id="work" /> },
  { id: "experience", name: "Experience", title: "Experience", render: (z) => <Experience z={z} id="experience" /> },
  standIn("testimonials", "Testimonials", "Testimonials"),
  standIn("contact", "Contact", "Contact"),
];
