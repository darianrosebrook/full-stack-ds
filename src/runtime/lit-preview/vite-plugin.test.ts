import { describe, it, expect } from "vitest";
import {
  litPreviewPlugin,
  litPreviewUrlPrefix,
  litPreviewVirtualIdPrefix,
} from "./vite-plugin";
import {
  LIT_PREVIEW_URL_PREFIX,
  LIT_PREVIEW_VIRTUAL_ID_PREFIX,
} from "./constants";

describe("litPreviewPlugin", () => {
  it("returns a Vite plugin with name + configureServer + resolveId + load hooks", () => {
    const p = litPreviewPlugin();
    expect(p.name).toBe("fsds-lit-preview");
    expect(typeof p.configureServer).toBe("function");
    expect(typeof p.resolveId).toBe("function");
    expect(typeof p.load).toBe("function");
  });

  it("URL prefix matches the constants module", () => {
    expect(litPreviewUrlPrefix()).toBe(LIT_PREVIEW_URL_PREFIX);
    expect(litPreviewVirtualIdPrefix()).toBe(LIT_PREVIEW_VIRTUAL_ID_PREFIX);
  });

  it("plugin's inlined URL prefix matches the constants module (regression)", async () => {
    const fs = await import("node:fs/promises");
    const nodePath = await import("node:path");
    const pluginSrc = await fs.readFile(
      nodePath.resolve(process.cwd(), "src/runtime/lit-preview/vite-plugin.ts"),
      "utf8",
    );
    expect(pluginSrc).toContain(`const URL_PREFIX = "${LIT_PREVIEW_URL_PREFIX}"`);
    expect(pluginSrc).toContain(`const VIRTUAL_ID_PREFIX = "${LIT_PREVIEW_VIRTUAL_ID_PREFIX}"`);
  });

  it("resolveId claims our virtual entry ids and ignores everything else", () => {
    const p = litPreviewPlugin();
    const resolve = (id: string) =>
      typeof p.resolveId === "function"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (p.resolveId as any).call({} as never, id, undefined, {})
        : null;
    const ours = `${LIT_PREVIEW_VIRTUAL_ID_PREFIX}Accordion/entry.ts`;
    expect(resolve(ours)).toBe(ours);
    expect(resolve("lit")).toBeNull();
    expect(resolve(`${LIT_PREVIEW_VIRTUAL_ID_PREFIX}Accordion/entry`)).toBeNull();
    expect(resolve(`${LIT_PREVIEW_VIRTUAL_ID_PREFIX}accordion/entry.ts`)).toBeNull();
  });
});
