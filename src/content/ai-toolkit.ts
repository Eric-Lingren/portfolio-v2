export type Tier = "Haiku" | "Sonnet" | "Opus";

export type ToolkitNode = {
  id: string;
  /** Skill or agent name as it appears in the toolkit. */
  name: string;
  kind: "skill" | "agent";
  tier: Tier;
  /** Plain-language summary of the node's contract. */
  excerpt: string;
  inputs: string[];
  outputs: string[];
  /** Path inside the dotfiles repo; the link is built from it. */
  path: string;
};

export type ToolkitStep = {
  id: string;
  title: string;
  blurb: string;
  nodes: string[];
};

export const DOTFILES_BASE = "https://github.com/Eric-Lingren/dotfiles/blob/main/";
export const fileUrl = (path: string) => `${DOTFILES_BASE}${path}`;

const SK = "claude-code-shared/skills/";
const AG = "claude-code-shared/agents/";

export const NODES: readonly ToolkitNode[] = [
  {
    id: "grill",
    name: "grill-with-docs",
    kind: "skill",
    tier: "Opus",
    excerpt: "Interviews me about a plan, one decision at a time, and checks it against the project's vocabulary and recorded decisions until the branches are resolved.",
    inputs: ["A rough idea or plan", "Project vocabulary and decision records, when they exist"],
    outputs: ["Resolved decisions in the conversation", "Updated vocabulary and decision records"],
    path: `${SK}grill-with-docs/SKILL.md`,
  },
  {
    id: "seed",
    name: "to-seed",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Distills the grill conversation into a structured JSON seed. Adversary agents try to refute it against the transcript and a judge panel rules on what they find.",
    inputs: ["The grill conversation"],
    outputs: ["A seed file with decisions, scope and open threads"],
    path: `${SK}to-seed/SKILL.md`,
  },
  {
    id: "tasks",
    name: "to-tasks",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Breaks a seed into independently buildable vertical slices, each with acceptance criteria and, for UI work, a browser check.",
    inputs: ["A seed file"],
    outputs: ["A task file with blockers and acceptance criteria"],
    path: `${SK}to-tasks/SKILL.md`,
  },
  {
    id: "build-code",
    name: "build-code",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Runs a task file in order, one build runner per task, and decides what to do when a task fails or blocks the ones after it.",
    inputs: ["A task file"],
    outputs: ["One receipt per task", "A branch with the finished work"],
    path: `${SK}build-code/SKILL.md`,
  },
  {
    id: "build-runner",
    name: "build-runner",
    kind: "agent",
    tier: "Sonnet",
    excerpt: "Takes exactly one task in its own worktree, builds it test-first, runs the gates, and returns a short receipt while keeping the full trace in a log.",
    inputs: ["One task", "Project context", "A known base commit"],
    outputs: ["A compact receipt", "A trace log"],
    path: `${AG}build/build-runner.md`,
  },
  {
    id: "tdd",
    name: "tdd",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Red, green, refactor: write a failing test, make the smallest change that passes, then clean up with the tests still green.",
    inputs: ["A task and its acceptance criteria"],
    outputs: ["Tests and the code that satisfies them"],
    path: `${SK}tdd/SKILL.md`,
  },
  {
    id: "lint-runner",
    name: "lint-runner",
    kind: "agent",
    tier: "Haiku",
    excerpt: "Read-only. Runs the project's lint and format commands and reports a pass, warn or fail verdict. It never edits files.",
    inputs: ["A lint command for the workspace"],
    outputs: ["A verdict with counts and violations"],
    path: `${AG}build/lint-runner.md`,
  },
  {
    id: "test-runner",
    name: "test-runner",
    kind: "agent",
    tier: "Haiku",
    excerpt: "Read-only. Runs the unit tests and the type check and reports a verdict with compressed failures.",
    inputs: ["Test and type-check commands for the workspace"],
    outputs: ["A verdict with pass and fail counts"],
    path: `${AG}build/test-runner.md`,
  },
  {
    id: "browser-checker",
    name: "browser-checker",
    kind: "agent",
    tier: "Haiku",
    excerpt: "Runs a declared browser check against the baseline and the candidate build, then hands the screenshots to a visual judge to compare against the stated intent.",
    inputs: ["A check spec", "Baseline and candidate server URLs"],
    outputs: ["Captures, diffs and a result for the judge"],
    path: `${AG}build/browser-checker.md`,
  },
  {
    id: "review",
    name: "pr-code-review",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Reviews a diff or pull request for bugs, security and performance problems, and adherence to the project's conventions.",
    inputs: ["A staged diff or a pull request"],
    outputs: ["Findings ranked by severity"],
    path: `${SK}pr-code-review/SKILL.md`,
  },
  {
    id: "revise",
    name: "pr-revise",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Collects reviewer comments on a published pull request, triages them, and asks me to confirm before anything turns into a fix or a reply.",
    inputs: ["A published pull request with comments"],
    outputs: ["A seed holding the fixes and the replies to post"],
    path: `${SK}pr-revise/SKILL.md`,
  },
  {
    id: "capture",
    name: "capture-learning",
    kind: "agent",
    tier: "Sonnet",
    excerpt: "At the end of a run, turns a correction I made into a structured learning and checks that its quotes appear in the transcript before writing it.",
    inputs: ["A rough description of the correction", "Candidate quotes"],
    outputs: ["One grounded learning entry"],
    path: `${AG}learning/capture-learning.md`,
  },
  {
    id: "attribution",
    name: "attribution-tracer",
    kind: "agent",
    tier: "Sonnet",
    excerpt: "Walks the history of a confirmed issue backward to the earliest stage that should have caught it and drafts an attribution record.",
    inputs: ["A confirmed issue and its fix"],
    outputs: ["A draft attribution record"],
    path: `${AG}learning/attribution-tracer.md`,
  },
  {
    id: "grounding",
    name: "artifact-grounding-judge",
    kind: "agent",
    tier: "Haiku",
    excerpt: "Checks each piece of evidence in a draft record against the file it cites and rejects anything it cannot find. It never grades a record it drafted.",
    inputs: ["A draft attribution record"],
    outputs: ["An accepted record, or a rejection"],
    path: `${AG}learning/artifact-grounding-judge.md`,
  },
  {
    id: "learnings",
    name: "improve-skill-learnings",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Applies accumulated learnings to the skill or agent they point at, one reviewed diff at a time.",
    inputs: ["The learnings log"],
    outputs: ["Edits to the target skill or agent"],
    path: `${SK}improve-skill-learnings/SKILL.md`,
  },
  {
    id: "benchmarks",
    name: "improve-skill-benchmarks",
    kind: "skill",
    tier: "Sonnet",
    excerpt: "Runs a skill against synthetic scenarios, scores the output with a judge panel, and iterates, so I can see whether an edit helped.",
    inputs: ["A target skill"],
    outputs: ["Scores per scenario", "Proposed skill improvements"],
    path: `${SK}improve-skill-benchmarks/SKILL.md`,
  },
];

/** The forward path, idea to merged PR. 4 to 6 steps. */
export const STEPS: readonly ToolkitStep[] = [
  { id: "grill", title: "Grill", blurb: "Settle the plan before any code.", nodes: ["grill"] },
  { id: "seed", title: "Seed", blurb: "Write the decisions down as a file.", nodes: ["seed"] },
  { id: "tasks", title: "Tasks", blurb: "Cut the seed into buildable slices.", nodes: ["tasks"] },
  {
    id: "build",
    title: "Build",
    blurb: "One task per runner, test-first, behind lint, test and browser gates.",
    nodes: ["build-code", "build-runner", "tdd", "lint-runner", "test-runner", "browser-checker"],
  },
  { id: "review", title: "Review", blurb: "Read the diff before a person does.", nodes: ["review"] },
  { id: "revise", title: "Revise", blurb: "Turn reviewer comments into fixes and replies.", nodes: ["revise"] },
];

/** Final stage: what a finished run feeds back into the toolkit. */
export const LEARNING_LOOP: ToolkitStep = {
  id: "loop",
  title: "Learning loop",
  blurb: "Corrections become edits to the skills, then the cycle starts again.",
  nodes: ["capture", "attribution", "grounding", "learnings", "benchmarks"],
};

/** The feedback edge drawn from the learning loop back to the first step. */
export const FEEDBACK_EDGE = {
  from: LEARNING_LOOP.id,
  to: STEPS[0].id,
  label: "Edits to the skills feed the next grill",
} as const;

/** Every stage shown by the panel, in reading order. */
export const ALL_STEPS: readonly ToolkitStep[] = [...STEPS, LEARNING_LOOP];

export const nodeById = (id: string): ToolkitNode => {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`unknown node ${id}`);
  return n;
};

export const INTRO =
  "These are the skills and agents I run on every project. Each stage has one job and hands a file to the next, so a feature can go from a loose idea to a reviewed pull request with me deciding at a few chosen points. Select any node to see what it takes in, what it hands on, and the file behind it.";

/** Sign-off markers. Never rendered; content:check flags them until resolved. */
export const REVIEW: string[] = [
  "[ERIC: confirm or replace the panel intro]",
  "[ERIC: confirm the model tier on each node still matches model-tiers.json]",
];
