import type { ReactNode } from "react";
import { Hero } from "@/components/Hero";
import { SelectedWork } from "@/components/panels/SelectedWork";
import { Positioning } from "@/components/panels/Positioning";
import { Experience } from "@/components/panels/Experience";
import { Testimonials } from "@/components/panels/Testimonials";
import { AIToolkit } from "@/components/panels/AIToolkit";
import { Contact } from "@/components/panels/Contact";

export type PanelEntry = {
  id: string;
  name: string;
  title: string;
  /** Renders the panel. `z` is the panel's world depth for the component tag. */
  render: (z: number) => ReactNode;
};

export const PANELS: readonly PanelEntry[] = [
  { id: "hero", name: "Hero", title: "Hero", render: (z) => <Hero z={z} id="hero" /> },
  { id: "positioning", name: "Positioning", title: "Positioning", render: (z) => <Positioning z={z} id="positioning" /> },
  { id: "ai-toolkit", name: "AIToolkit", title: "AI toolkit", render: (z) => <AIToolkit z={z} id="ai-toolkit" /> },
  { id: "work", name: "SelectedWork", title: "Selected work", render: (z) => <SelectedWork z={z} id="work" /> },
  { id: "experience", name: "Experience", title: "Experience", render: (z) => <Experience z={z} id="experience" /> },
  { id: "testimonials", name: "Testimonials", title: "Testimonials", render: (z) => <Testimonials z={z} id="testimonials" /> },
  { id: "contact", name: "Contact", title: "Contact", render: (z) => <Contact z={z} id="contact" /> },
];
