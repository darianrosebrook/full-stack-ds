import { describe, expect, it } from "vitest";
import type { EmitOptions } from "../../emitter.js";
import {
  allCorpusComponentNames,
  corpusIR,
} from "../corpus-fixtures.js";
import { createVueEmitter } from "./factory.js";

const opts: EmitOptions = {
  componentsRoot: "/tmp/fsds-test/vue/components",
  contractsRoot: "/tmp/fsds-test/contracts",
};

describe("createVueEmitter — full corpus sweep", () => {
  it("emits component, tests and hook files for every corpus contract", () => {
    const emitter = createVueEmitter();
    const names = allCorpusComponentNames();

    expect(names.length).toBeGreaterThan(40); // precondition: real corpus

    for (const name of names) {
      const ir = corpusIR(name);
      const files = emitter.emitComponent(ir, opts);
      expect(files.length, `${name} component`).toBeGreaterThan(0);
      for (const file of files) {
        expect(file.relativePath, name).toBeTruthy();
        expect(typeof file.contents, name).toBe("string");
      }

      const tests = emitter.emitTests(ir, opts);
      expect(tests.length, `${name} tests`).toBeGreaterThan(0);

      const hooks = emitter.emitHook?.(ir, opts) ?? [];
      expect(hooks.every((f) => typeof f.contents === "string"), name).toBe(true);
    }
  });

  it("emits compound part SFCs for Tabs", () => {
    const files = createVueEmitter().emitComponent(corpusIR("Tabs"), opts);

    const paths = files.map((f) => f.relativePath);
    expect(paths).toContain("Tabs/Tabs.vue");
    expect(paths.some((p) => p.includes("Tab") && p.endsWith(".vue"))).toBe(true);
  });

  it("emits the Tabs hook as a dedicated composable file", () => {
    const hooks = createVueEmitter().emitHook?.(corpusIR("Tabs"), opts) ?? [];

    expect(hooks.map((f) => f.relativePath)).toContain("Tabs/useTabs.ts");
    expect(hooks[0]?.contents).toContain("UseTabsResult");
  });

  it("emits a barrel referencing every component", () => {
    const barrel = createVueEmitter().emitBarrel(["Button", "Tabs", "Select"]);

    expect(barrel).toContain("Button");
    expect(barrel).toContain("Tabs");
    expect(barrel).toContain("Select");
  });
});
