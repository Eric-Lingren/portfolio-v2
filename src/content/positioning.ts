export type Pillar = {
  /** A principle Eric works by. Not a skill area or a product. */
  title: string;
  /** One or two short sentences: what the principle looks like day to day. */
  sentence: string;
  /**
   * One sentence on what a team or company gets from it. It names no product, project or
   * shipped result: specific work belongs to Selected work and the resume.
   */
  outcome: string;
  /** Which decorative picture heads the card (see PillarViz). */
  viz: "target" | "board" | "grid";
  /** Sign-off markers. Never rendered; content:check flags them until resolved. */
  review: string[];
};

export const PILLARS: readonly Pillar[] = [
  {
    title: "Outcome-oriented",
    sentence: "I understand the business problem and align on outcomes before anything gets built.",
    outcome: "Success measured by business objectives, not features shipped.",
    viz: "target",
    review: [],
  },
  {
    title: "Extreme ownership",
    sentence: "When I cause a problem, I own it. When someone needs help, I see it through.",
    outcome: "Problems get solved, not passed along.",
    viz: "board",
    review: [],
  },
  {
    title: "Craftsmanship",
    sentence: "I build reliable, well-crafted software that people can use easily and adapt to quickly.",
    outcome: "Software that's easy to use and easy to maintain.",
    viz: "grid",
    review: [],
  },
];
