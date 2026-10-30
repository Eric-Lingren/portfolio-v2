export type Testimonial = {
  quote: string;
  roleLabel: string;
  sourceType: string;
  employer: string;
  year: number;
  original: string;
  /** Optional verbatim phrases inside `quote` to emphasise. */
  highlights?: readonly string[];
};

// Verbatim excerpts approved by Eric. Never invent entries.
// `original` is the file basename (no extension) of a PNG in public/testimonials/.
// Several cards may share one `original` when the screenshot holds each quote.
// Keep cards newest first; the panel renders them in this order.
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "Eric sent out automated reminders for an extremely high priority customer in record time, whose response was ‘Thanks so much for the save…’",
    roleLabel: "Customer Success Manager",
    sourceType: "Peer recognition",
    employer: "Standard Metrics",
    year: 2026,
    original: "SM2",
    highlights: ["in record time"],
  },
  {
    quote:
      "…and Eric have been super helpful tackling problems for one of my customers and constantly keeping me updated!",
    roleLabel: "Customer Success Manager",
    sourceType: "Peer recognition",
    employer: "Standard Metrics",
    year: 2024,
    original: "SM1",
    highlights: ["tackling problems", "constantly keeping me updated!"],
  },
  {
    quote:
      "Eric has been showing great ownership in the Info report project. He has been jumping into UI issues and fixing them at a rapid clip.",
    roleLabel: "Engineering Manager",
    sourceType: "Peer recognition",
    employer: "Standard Metrics",
    year: 2023,
    original: "SM3",
    highlights: ["showing great ownership", "fixing them at a rapid clip."],
  },
  {
    quote:
      "Eric was an extraordinary instructor. He went out of his way to consistently give us video feedback on assignments and was very passionate and enthusiastic about the material.",
    roleLabel: "Student",
    sourceType: "Course evaluation",
    employer: "Bryan University",
    year: 2023,
    original: "BU2",
    highlights: ["extraordinary instructor", "consistently", "very passionate and enthusiastic"],
  },
  {
    quote:
      "Eric was a wonderful teacher! In my opinion probably the best so far. He really knows his react very well and it shows!",
    roleLabel: "Student",
    sourceType: "Course evaluation",
    employer: "Bryan University",
    year: 2020,
    original: "BU1",
    highlights: ["wonderful teacher!", "really knows his react very well"],
  },
  {
    quote:
      "Eric Lingren is an amazing instructor! He definitely knows this material, and was always available to help. He actually helped boost my self confidence, which is huge.",
    roleLabel: "Student",
    sourceType: "Course evaluation",
    employer: "Bryan University",
    year: 2020,
    original: "BU1",
    highlights: ["amazing instructor!", "always available", "helped boost my self confidence"],
  },
];
