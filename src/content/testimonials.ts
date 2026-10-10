import manifest from "./testimonials.json";

export type Testimonial = {
  id: string;
  /** Redacted screenshot path under /testimonials/. */
  image: string;
  /** Role label only, never a personal name. */
  roleLabel: string;
  alt: string;
};

/** Written by `npm run testimonials:redact`. Empty until real screenshots exist. */
export const TESTIMONIALS: readonly Testimonial[] = manifest as Testimonial[];

/** Cards shown as placeholders while the manifest is empty. */
export const PLACEHOLDER_COUNT = 4;
