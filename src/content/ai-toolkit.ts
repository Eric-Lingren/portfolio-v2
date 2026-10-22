export type ToolkitSkill = {
  id: string;
  /** The plain question this skill or agent answers. Shown on the scene. */
  question: string;
  /** Skill or agent name as it appears in the toolkit. */
  name: string;
  /** One-line description. Hover tip on the scene, and the stage card text. */
  tip: string;
  /** Path inside the dotfiles repo, when the skill has its own file. */
  path?: string;
};

export type ToolkitStage = {
  id: string;
  title: string;
  /** Plain one-liner for what the stage does. */
  summary: string;
  skills: readonly ToolkitSkill[];
};

export const DOTFILES_BASE = "https://github.com/Eric-Lingren/dotfiles/blob/main/";
export const fileUrl = (path: string) => `${DOTFILES_BASE}${path}`;
export const REPO_URL = "https://github.com/Eric-Lingren/dotfiles/tree/main/claude-code-shared";

export const HEADING = "How I build with AI";

const SK = "claude-code-shared/skills/";
const AG = "claude-code-shared/agents/";

/** The five stages, in order. Improve feeds back into Plan on the next run. */
export const STAGES: readonly ToolkitStage[] = [
  {
    id: "plan",
    title: "Plan",
    summary: "Settle the plan before any code, then check the written plan against what was actually said.",
    skills: [
      { id: "grill", question: "Is the plan settled?", name: "grill-with-docs", tip: "Interviews me about the plan until every branch is decided.", path: `${SK}grill-with-docs/SKILL.md` },
      { id: "critics", question: "Did the plan make anything up?", name: "seed critics", tip: "Adversary agents try to refute the written plan against the transcript." },
      { id: "judges", question: "Is the quote real?", name: "judge panel", tip: "Rules on each refutation using only the transcript as evidence." },
    ],
  },
  {
    id: "build",
    title: "Build",
    summary: "One task per runner, test-first, behind separate test and browser gates.",
    skills: [
      { id: "runner", question: "One task, one runner?", name: "build-runner", tip: "Takes exactly one task and returns a short receipt.", path: `${AG}build/build-runner.md` },
      { id: "tdd", question: "Did a test fail first?", name: "tdd", tip: "Red, green, refactor. No code before a failing test.", path: `${SK}tdd/SKILL.md` },
      { id: "tests", question: "Did the tests actually run?", name: "test-runner", tip: "A separate agent runs the suite. The author does not grade itself.", path: `${AG}build/test-runner.md` },
      { id: "browser", question: "Does it work in a browser?", name: "browser-checker", tip: "Drives the real page and returns a verdict.", path: `${AG}build/browser-checker.md` },
    ],
  },
  {
    id: "catch",
    title: "Catch",
    summary: "Read the diff before a person does, then check each reviewer comment against the code.",
    skills: [
      { id: "review", question: "Does the diff match the plan?", name: "pr-code-review", tip: "Reads the diff before a person does.", path: `${SK}pr-code-review/SKILL.md` },
      { id: "outside", question: "Would a second reader catch it?", name: "outside reviewer", tip: "A reviewer that is not the author, like a review bot or a teammate." },
      { id: "revise", question: "Is this comment real?", name: "pr-revise", tip: "Triages reviewer comments and confirms each against the code.", path: `${SK}pr-revise/SKILL.md` },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    summary: "Write each miss down with its cause and the earliest point it could have been stopped.",
    skills: [
      { id: "capture", question: "What went wrong?", name: "capture-learning", tip: "Writes the correction down in a fixed schema.", path: `${AG}learning/capture-learning.md` },
      { id: "attrib", question: "Where did it first slip?", name: "attribution-tracer", tip: "Walks back to the earliest point the mistake could have been stopped.", path: `${AG}learning/attribution-tracer.md` },
      { id: "ground", question: "Is this evidence real?", name: "grounding judge", tip: "Rejects any learning whose quote is not in the artifact.", path: `${AG}learning/artifact-grounding-judge.md` },
    ],
  },
  {
    id: "improve",
    title: "Improve",
    summary: "Turn each learning into an edit to the skill that caused it, then measure whether it helped.",
    skills: [
      { id: "learnings", question: "Which skill should change?", name: "improve-skill-learnings", tip: "Applies a captured learning to the skill that caused it.", path: `${SK}improve-skill-learnings/SKILL.md` },
      { id: "bench", question: "Did the edit actually help?", name: "improve-skill-benchmarks", tip: "Re-runs the skill against scenarios and scores the change.", path: `${SK}improve-skill-benchmarks/SKILL.md` },
    ],
  },
];
