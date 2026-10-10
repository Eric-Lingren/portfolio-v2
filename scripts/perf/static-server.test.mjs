import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveFile, startStaticServer } from "./static-server.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "static-"));
  writeFileSync(join(root, "index.html"), "<h1>home</h1>");
  mkdirSync(join(root, "work"));
  writeFileSync(join(root, "work", "a.html"), "a");
  writeFileSync(join(root, "404.html"), "nope");
  return root;
}

describe("static server", () => {
  it("resolves clean urls and blocks traversal", () => {
    const root = fixture();
    expect(resolveFile(root, "/")).toBe(join(root, "index.html"));
    expect(resolveFile(root, "/work/a")).toBe(join(root, "work", "a.html"));
    expect(resolveFile(root, "/work/a?x=1")).toBe(join(root, "work", "a.html"));
    expect(resolveFile(root, "/../etc/passwd")).toBeNull();
    expect(resolveFile(root, "/missing")).toBeNull();
  });

  it("serves files and a 404 page", async () => {
    const root = fixture();
    const s = await startStaticServer(root);
    try {
      const ok = await fetch(`${s.url}/`);
      expect(ok.status).toBe(200);
      expect(await ok.text()).toContain("home");
      const miss = await fetch(`${s.url}/nope`);
      expect(miss.status).toBe(404);
    } finally {
      await s.close();
    }
  });
});
