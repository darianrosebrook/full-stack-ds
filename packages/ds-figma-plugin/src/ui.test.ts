// ui.ts entry: mounts the app into #app and fails loudly when the root is
// missing. Module-level side effects, so each case re-imports fresh.
import { beforeEach, describe, expect, it, vi } from "vitest";

// Re-importing ui.ts compiles FigmaPluginApp.svelte and the ds-svelte subtree
// it pulls in: ~1.5s for this file alone, several times that under the root
// suite's 244-file parallel load. Vitest's 5s default is too small a budget for
// that, and overrunning it corrupts the next case rather than just failing this
// one — the timeout abandons an in-flight import, then the sibling's
// resetModules() tears down a half-initialised Svelte registry and the
// "Missing #app root." assertion reports `from_html is not a function` instead.
vi.setConfig({ testTimeout: 20000 });

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
