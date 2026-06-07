import { describe, it, expect } from "vitest";
import * as path from "node:path";
import {
  angularPreviewPlugin,
  angularPreviewCacheDir,
} from "./vite-plugin";
import {
  ANGULAR_PREVIEW_URL_PREFIX,
  ANGULAR_PREVIEW_VENDOR_SUBDIR,
} from "./constants";

describe("angularPreviewPlugin", () => {
  it("returns a Vite plugin with a name and a configureServer hook", () => {
    const p = angularPreviewPlugin();
    expect(p.name).toBe("fsds-angular-preview");
    expect(typeof p.configureServer).toBe("function");
  });

  it("URL prefix and cache dir are anchored where the shell expects", () => {
    // The shell builds importmap URLs as `${ANGULAR_PREVIEW_URL_PREFIX}<file>`.
    // The cache dir lives inside node_modules/ so it's gitignored and survives
    // dev-server restarts. Both must stay stable — changing them is a coupled
    // change with shells/angular.ts.
    expect(ANGULAR_PREVIEW_URL_PREFIX).toBe("/preview/angular/");
    expect(ANGULAR_PREVIEW_VENDOR_SUBDIR).toBe("vendor");
    expect(angularPreviewCacheDir()).toMatch(/node_modules\/\.fsds-angular-cache$/);
    expect(path.isAbsolute(angularPreviewCacheDir())).toBe(true);
  });

  it("plugin's inlined URL prefix matches the constants module", async () => {
    // The plugin inlines URL_PREFIX as a string literal so Vite's TS-aware
    // config loader can resolve it (cross-module .ts imports were stripped
    // without inlining and crashed the dev server). The constants module is
    // the source of truth for browser-graph consumers. They must stay in
    // sync — this test reads the plugin file from disk and checks.
    const fs = await import("node:fs/promises");
    const nodePath = await import("node:path");
    const pluginSrc = await fs.readFile(
      nodePath.resolve(process.cwd(), "src/runtime/angular-compiler/vite-plugin.ts"),
      "utf8",
    );
    expect(pluginSrc).toContain(`const URL_PREFIX = "${ANGULAR_PREVIEW_URL_PREFIX}"`);
    expect(pluginSrc).toContain(`const VENDOR_SUBDIR = "${ANGULAR_PREVIEW_VENDOR_SUBDIR}"`);
  });
});
