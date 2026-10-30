export type ToolkitSkill = {
  id: string;
  /** The plain question this skill or agent answers. Not shown on the panel right now. */
  question: string;
  /** Skill or agent name as it appears in the toolkit. */
  name: string;
  /** One-line description. Shown in the stage card. */
  tip: string;
  /** Path inside the toolkit repo. A trailing slash links the folder. */
  path: string;
  /** Model the skill or agent runs on, from the toolkit's model-tiers.json. */
  model: ToolkitModel;
};

export type ToolkitModel = "Haiku" | "Sonnet" | "Opus";

export type ToolkitStage = {
  id: string;
  title: string;
  /** Plain one-liner for what the stage does. */
  summary: string;
  skills: readonly ToolkitSkill[];
};

/** Public copy of the toolkit, published from the private dotfiles repo. */
export const REPO_URL = "https://github.com/Eric-Lingren/claude-code-toolkit";
export const fileUrl = (path: string) => `${REPO_URL}/${path.endsWith("/") ? "tree" : "blob"}/main/${path}`;

export const HEADING = "How I build with AI";

const SK = "skills/";
const AG = "agents/";

/** The five stages, in order. Improve feeds back into Plan on the next run. */
export const STAGES: readonly ToolkitStage[] = [
  {
    id: "plan",
    title: "Plan",
    summary: "Settle the plan before any code, then check the written plan against what was actually said.",
    skills: [
      { id: "grill", model: "Opus", question: "Is the plan settled?", name: "grill-with-docs", tip: "Interviews me about the plan until every branch is decided.", path: `${SK}grill-with-docs/SKILL.md` },
      { id: "seed", model: "Sonnet", question: "Is the plan written down?", name: "to-seed", tip: "Distills the conversation into a structured seed file the later stages read.", path: `${SK}to-seed/SKILL.md` },
      { id: "critics", model: "Haiku", question: "Did the plan make anything up?", name: "seed critics", tip: "Adversary agents try to refute the written plan against the transcript.", path: `${AG}seed-review/` },
      { id: "judges", model: "Sonnet", question: "Is the quote real?", name: "judge panel", tip: "Rules on each refutation using only the transcript as evidence.", path: `${AG}seed-review/persona-judge.md` },
      { id: "slices", model: "Sonnet", question: "What are the tasks?", name: "to-tasks", tip: "Splits the plan into vertical-slice tasks that can each be built on their own.", path: `${SK}to-tasks/SKILL.md` },
    ],
  },
  {
    id: "build",
    title: "Build",
    summary: "One task per runner, test-first, behind separate test and browser gates.",
    skills: [
      { id: "runner", model: "Sonnet", question: "One task, one runner?", name: "build-runner", tip: "Takes exactly one task and returns a short receipt.", path: `${AG}build/build-runner.md` },
      { id: "tdd", model: "Sonnet", question: "Did a test fail first?", name: "tdd", tip: "Red, green, refactor. No code before a failing test.", path: `${SK}tdd/SKILL.md` },
      { id: "tests", model: "Haiku", question: "Did the tests actually run?", name: "test-runner", tip: "A separate agent runs the suite. The author does not grade itself.", path: `${AG}build/test-runner.md` },
      { id: "browser", model: "Haiku", question: "Does it work in a browser?", name: "browser-checker", tip: "Drives the real page and returns a verdict.", path: `${AG}build/browser-checker.md` },
      { id: "debug", model: "Opus", question: "Why did it break?", name: "debug", tip: "Reproduce, shrink, test a theory, then fix it with a regression test.", path: `${SK}debug/SKILL.md` },
    ],
  },
  {
    id: "review",
    title: "Review",
    summary: "Read the diff before a person does, then fact-check every finding and comment against the code.",
    skills: [
      { id: "review", model: "Sonnet", question: "Does the diff match the plan?", name: "pr-code-review", tip: "Reads the diff before a person does.", path: `${SK}pr-code-review/SKILL.md` },
      { id: "revise", model: "Sonnet", question: "Is this comment real?", name: "pr-revise", tip: "Triages comments from review bots and teammates, then confirms each against the code.", path: `${SK}pr-revise/SKILL.md` },
      { id: "investigator", model: "Opus", question: "Is the finding true?", name: "investigator", tip: "Fact-checks every review finding and comment against the code before anything is posted or changed.", path: `${AG}investigate/investigator.md` },
      { id: "ci", model: "Sonnet", question: "Why is CI red?", name: "ci-fix", tip: "Pulls the failing CI logs, fixes the code and verifies it locally.", path: `${SK}ci-fix/SKILL.md` },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    summary: "Write each miss down with its cause and the earliest point it could have been stopped.",
    skills: [
      { id: "capture", model: "Sonnet", question: "What went wrong?", name: "capture-learning", tip: "Writes the correction down in a fixed schema.", path: `${AG}learning/capture-learning.md` },
      { id: "attrib", model: "Sonnet", question: "Where did it first slip?", name: "attribution-tracer", tip: "Walks back to the earliest point the mistake could have been stopped.", path: `${AG}learning/attribution-tracer.md` },
      { id: "ground", model: "Haiku", question: "Is this evidence real?", name: "grounding judge", tip: "Rejects any learning whose quote is not in the artifact.", path: `${AG}learning/artifact-grounding-judge.md` },
    ],
  },
  {
    id: "improve",
    title: "Improve",
    summary: "Turn each learning into an edit to the skill that caused it, then measure whether it helped.",
    skills: [
      { id: "learnings", model: "Sonnet", question: "Which skill should change?", name: "improve-skill-learnings", tip: "Applies a captured learning to the skill that caused it.", path: `${SK}improve-skill-learnings/SKILL.md` },
      { id: "bench", model: "Sonnet", question: "Did the edit actually help?", name: "improve-skill-benchmarks", tip: "Re-runs the skill against scenarios and scores the change.", path: `${SK}improve-skill-benchmarks/SKILL.md` },
      { id: "agentbench", model: "Sonnet", question: "Is each agent still sound?", name: "improve-agent-benchmarks", tip: "Freezes a cited contract for an agent, then scores changes against real cases.", path: `${SK}improve-agent-benchmarks/SKILL.md` },
      { id: "arch", model: "Opus", question: "Where is the design weak?", name: "improve-codebase-architecture", tip: "Finds modules worth deepening, guided by the project glossary and ADRs.", path: `${SK}improve-codebase-architecture/SKILL.md` },
    ],
  },
];
