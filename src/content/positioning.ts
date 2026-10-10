export type Pillar = {
  title: string;
  /** Exactly one sentence. Drafted plainly; Eric replaces it with his own wording. */
  sentence: string;
  proof: { text: string; href?: string };
  /** Sign-off markers. Never rendered; content:check flags them until resolved. */
  review: string[];
};

export const PILLARS: readonly Pillar[] = [
  {
    title: "Frontend craft",
    sentence: "I build interfaces that stay fast and feel like the tools people already know.",
    proof: {
      text: "Spreadsheet-style editing in Metrics Tab v2, shipped to all customers.",
    },
    review: ["[ERIC: confirm or replace this pillar sentence]", "[ERIC: confirm Metrics Tab v2 credit]"],
  },
  {
    title: "Full-stack delivery",
    sentence: "I take a feature from the data model through the API to the screen and own it after it ships.",
    proof: { text: "KPI granularity for information requests.", href: "/work/kpi-granularity" },
    review: ["[ERIC: confirm or replace this pillar sentence]"],
  },
  {
    title: "AI-native workflow",
    sentence: "I run my own work through a shared set of skills and agents that carry a task from idea to merged PR.",
    proof: { text: "The shared AI toolkit.", href: "/work/ai-toolkit" },
    review: ["[ERIC: confirm or replace this pillar sentence]"],
  },
];
