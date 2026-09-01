// ui.ts entry: mounts the app into #app and fails loudly when the root is
// missing. Module-level side effects, so each case re-imports fresh.
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ui entry", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  it("mounts the plugin app into the #app root", async () => {
    const root = document.createElement("div");
    root.id = "app";
    document.body.appendChild(root);
    await import("./ui.js");
    expect(root.children.length).toBeGreaterThan(0);
  });

  it("throws when the #app root is missing", async () => {
    await expect(import("./ui.js")).rejects.toThrow("Missing #app root.");
  });
});
