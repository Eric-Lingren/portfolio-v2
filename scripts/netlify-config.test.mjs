import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));
const toml = fs.readFileSync(path.resolve(here, "../netlify.toml"), "utf8");

// Minimal TOML section reader: returns the `command` for a [section], or null.
function commandFor(section) {
  const lines = toml.split("\n");
  const start = lines.findIndex((l) => l.trim() === `[${section}]`);
  if (start < 0) return null;
  for (const line of lines.slice(start + 1)) {
    if (line.trim().startsWith("[")) return null;
    const m = /^\s*command\s*=\s*"(.*)"\s*$/.exec(line);
    if (m) return m[1];
  }
  return null;
}

describe("netlify launch gate", () => {
  it("runs the strict content gate before the build in production", () => {
    const cmd = commandFor("context.production");
    expect(cmd).toMatch(/content:check:strict/);
    expect(cmd.indexOf("content:check:strict")).toBeLessThan(cmd.indexOf("npm run build"));
    expect(cmd).toMatch(/&&/);
  });

  it("does not run the strict gate for previews, branch deploys, or the default build", () => {
    expect(commandFor("build")).toBe("npm run build");
    expect(commandFor("context.deploy-preview")).toBeNull();
    expect(commandFor("context.branch-deploy")).toBeNull();
  });

  it("the strict script exists in package.json", () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(here, "../package.json"), "utf8"));
    expect(pkg.scripts["content:check:strict"]).toContain("--strict");
  });
});
