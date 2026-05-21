import { describe, it, expect } from "vitest";
import {
  vuePreviewPlugin,
  vuePreviewUrlPrefix,
  vuePreviewVirtualIdPrefix,
} from "./vite-plugin";
import {
  VUE_PREVIEW_URL_PREFIX,
  VUE_PREVIEW_VIRTUAL_ID_PREFIX,
} from "./constants";

describe("vuePreviewPlugin", () => {
  it("returns a Vite plugin with name + configureServer + resolveId + load hooks", () => {
    const p = vuePreviewPlugin();
    expect(p.name).toBe("fsds-vue-preview");
    expect(typeof p.configureServer).toBe("function");
    expect(typeof p.resolveId).toBe("function");
    expect(typeof p.load).toBe("function");
  });

  it("URL prefix matches the constants module", () => {
    expect(vuePreviewUrlPrefix()).toBe(VUE_PREVIEW_URL_PREFIX);
    expect(vuePreviewVirtualIdPrefix()).toBe(VUE_PREVIEW_VIRTUAL_ID_PREFIX);
  });

  it("plugin's inlined URL prefix matches the constants module (regression)", async () => {
    const fs = await import("node:fs/promises");
    const nodePath = await import("node:path");
    const pluginSrc = await fs.readFile(
      nodePath.resolve(process.cwd(), "src/runtime/vue-preview/vite-plugin.ts"),
      "utf8",
    );
    expect(pluginSrc).toContain(`const URL_PREFIX = "${VUE_PREVIEW_URL_PREFIX}"`);
    expect(pluginSrc).toContain(`const VIRTUAL_ID_PREFIX = "${VUE_PREVIEW_VIRTUAL_ID_PREFIX}"`);
  });

  it("resolveId claims our virtual entry ids and ignores everything else", () => {
    const p = vuePreviewPlugin();
    const resolve = (id: string) =>
      typeof p.resolveId === "function"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (p.resolveId as any).call({} as never, id, undefined, {})
        : null;
    const ours = `${VUE_PREVIEW_VIRTUAL_ID_PREFIX}Accordion/entry.ts`;
    expect(resolve(ours)).toBe(ours);
    expect(resolve("vue")).toBeNull();
    expect(resolve(`${VUE_PREVIEW_VIRTUAL_ID_PREFIX}Accordion/entry`)).toBeNull();
    expect(resolve(`${VUE_PREVIEW_VIRTUAL_ID_PREFIX}accordion/entry.ts`)).toBeNull();
  });
});
