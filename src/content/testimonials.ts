export type Testimonial = {
  quote: string;
  roleLabel: string;
  sourceType: string;
  employer: string;
  year: number;
  original: string;
};

// Empty until Eric supplies the real quotes. Never invent entries.
// `original` is the file basename (no extension) of a PNG in public/testimonials/.
export const TESTIMONIALS: readonly Testimonial[] = [];
