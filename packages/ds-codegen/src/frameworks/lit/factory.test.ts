import { describe, expect, it } from "vitest";
import type { EmitOptions } from "../../emitter.js";
import {
  allCorpusComponentNames,
  corpusIR,
} from "../corpus-fixtures.js";
import { createLitEmitter } from "./factory.js";

const opts: EmitOptions = {
  componentsRoot: "/tmp/fsds-test/lit/components",
  contractsRoot: "/tmp/fsds-test/contracts",
};

describe("createLitEmitter — full corpus sweep", () => {
  it("emits component, tests and hook files for every corpus contract", () => {
    const emitter = createLitEmitter();
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

  it("emits the Tabs element file", () => {
    const files = createLitEmitter().emitComponent(corpusIR("Tabs"), opts);

    expect(files.map((f) => f.relativePath)).toContain("Tabs/Tabs.ts");
  });

  it("emits the Tabs behavior class as a dedicated file", () => {
    const hooks = createLitEmitter().emitHook?.(corpusIR("Tabs"), opts) ?? [];

    expect(hooks.length).toBeGreaterThan(0);
    expect(hooks[0]?.contents).toContain("TabsBehavior");
  });

  it("emits a barrel referencing every component", () => {
    const barrel = createLitEmitter().emitBarrel(["Button", "Tabs", "Select"]);

    expect(barrel).toContain("Button");
    expect(barrel).toContain("Tabs");
    expect(barrel).toContain("Select");
  });
});
