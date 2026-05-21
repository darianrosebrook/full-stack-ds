import { describe, it, expect } from "vitest";
import {
  reactPreviewPlugin,
  reactPreviewUrlPrefix,
  reactPreviewVirtualIdPrefix,
} from "./vite-plugin";
import {
  REACT_PREVIEW_URL_PREFIX,
  REACT_PREVIEW_VIRTUAL_ID_PREFIX,
} from "./constants";

describe("reactPreviewPlugin", () => {
  it("returns a Vite plugin with name + configureServer + resolveId + load hooks", () => {
    const p = reactPreviewPlugin();
    expect(p.name).toBe("fsds-react-preview");
    expect(typeof p.configureServer).toBe("function");
    expect(typeof p.resolveId).toBe("function");
    expect(typeof p.load).toBe("function");
  });

  it("URL prefix matches the constants module", () => {
    // The shell HTML builds entry URLs as `/@id/${VIRTUAL_ID_PREFIX}<Name>/entry`
    // and the iframe is loaded at `${URL_PREFIX}<Name>`. Browser-graph consumers
    // (FrameworkPreview.tsx, the shell builder) import from ./constants.
    expect(reactPreviewUrlPrefix()).toBe(REACT_PREVIEW_URL_PREFIX);
    expect(reactPreviewVirtualIdPrefix()).toBe(REACT_PREVIEW_VIRTUAL_ID_PREFIX);
  });

  it("plugin's inlined URL prefix matches the constants module (regression: Vite config-loader pitfall)", async () => {
    // The plugin inlines URL_PREFIX as a string literal because Vite's TS-aware
    // config loader doesn't reliably follow .ts -> .ts imports inside the
    // vite.config.ts dep graph. The constants module is the source of truth
    // for browser-graph consumers. Both must stay in sync — this test reads
    // the plugin file from disk and asserts.
    //
    // Same regression caught the Angular plugin (see
    // src/runtime/angular-compiler/vite-plugin.test.ts).
    const fs = await import("node:fs/promises");
    const nodePath = await import("node:path");
    const pluginSrc = await fs.readFile(
      nodePath.resolve(process.cwd(), "src/runtime/react-preview/vite-plugin.ts"),
      "utf8",
    );
    expect(pluginSrc).toContain(`const URL_PREFIX = "${REACT_PREVIEW_URL_PREFIX}"`);
    expect(pluginSrc).toContain(
      `const VIRTUAL_ID_PREFIX = "${REACT_PREVIEW_VIRTUAL_ID_PREFIX}"`,
    );
  });

  it("resolveId claims our virtual entry ids and ignores everything else", () => {
    const p = reactPreviewPlugin();
    const resolve = (id: string) =>
      typeof p.resolveId === "function"
        // Vite's resolveId can be an object form; we registered the function form.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (p.resolveId as any).call({} as never, id, undefined, {})
        : null;

    const ours = `${REACT_PREVIEW_VIRTUAL_ID_PREFIX}Accordion/entry.tsx`;
    expect(resolve(ours)).toBe(ours);
    // Should ignore unrelated ids.
    expect(resolve("react")).toBeNull();
    expect(resolve("/packages/ds-react/src/components/Accordion/Accordion.tsx")).toBeNull();
    // Malformed (no /entry.tsx suffix) should not match.
    expect(resolve(`${REACT_PREVIEW_VIRTUAL_ID_PREFIX}Accordion`)).toBeNull();
    expect(resolve(`${REACT_PREVIEW_VIRTUAL_ID_PREFIX}Accordion/entry`)).toBeNull();
    // Non-PascalCase should not match.
    expect(resolve(`${REACT_PREVIEW_VIRTUAL_ID_PREFIX}accordion/entry.tsx`)).toBeNull();
  });

  it("load returns null for non-virtual ids without touching the filesystem", async () => {
    const p = reactPreviewPlugin();
    if (typeof p.load !== "function") throw new Error("load missing");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (p.load as any).call({} as never, "react", undefined);
    expect(result).toBeNull();
  });
});
