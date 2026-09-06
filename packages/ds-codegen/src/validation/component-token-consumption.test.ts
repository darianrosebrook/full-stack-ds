import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { emitTokensCss } from "../css.js";
import { inspectComponentTokenConsumption, validateComponentTokenConsumption } from "./component-token-consumption.js";
import { generateReactNativeComponentSource } from "../frameworks/react-native/component-source.js";
import { generateJetpackComposeComponentSource, generateJetpackComposeTokensFile } from "../frameworks/jetpack-compose/component-source.js";
import { generateSwiftUISurfaceFiles } from "../frameworks/swift/swiftui/surface-emit.js";
import { generateSwiftUIComponentSource } from "../frameworks/swift/swiftui/component-source.js";

function fixture(): ComponentContract {
  return { name: "Test", cssPrefix: "test", layer: "primitive", anatomy: { parts: ["root"] },
    props: { styled: { members: [] } }, tokens: {}, styles: {} } as ComponentContract;
}
function corpus(name: string): ComponentContract {
  const base = resolve("packages/ds-contracts/components", name, name);
  return { ...JSON.parse(readFileSync(`${base}.contract.json`, "utf8")),
    tokens: JSON.parse(readFileSync(`${base}.tokens.json`, "utf8")),
    styles: JSON.parse(readFileSync(`${base}.styles.json`, "utf8")) };
}

describe("component token consumption contract", () => {
  it("allows empty component vocabulary and unset design overrides backed by a property", () => {
    const c = fixture();
    c.styles = { root: { color: { literal: "#123456", platforms: ["web"], design: { property: "foreground.color", slot: "test.design.root.foreground.color" } } } };
    expect(validateComponentTokenConsumption(c)).toEqual([]);
    expect(emitTokensCss(buildComponentIR(c))).not.toContain("--fsds-test-design-root-foreground-color:");
  });
  it("rejects orphan component declarations; emitting less does not hide the authoring error", () => {
    const c = fixture();
    c.tokens = { "test.orphan": { fallback: "9px" } };
    expect(validateComponentTokenConsumption(c).map(issue => issue.pointer)).toEqual(["/tokens/test.orphan"]);
    expect(emitTokensCss(buildComponentIR(c))).not.toContain("--fsds-test-orphan:");
  });
  it("rejects a newly severed consumer and a disconnected alias chain", () => {
    const c = fixture();
    c.tokens = { "test.leaf": { fallback: "#fff" }, "test.alias": { resolvesTo: "test.leaf", fallback: "#fff" } };
    c.styles = { root: { color: { resolvesTo: "test.alias", fallback: "#fff" } } };
    expect(validateComponentTokenConsumption(c)).toEqual([]);
    c.styles = {};
    expect(validateComponentTokenConsumption(c).map(issue => issue.pointer)).toEqual(["/tokens/test.leaf", "/tokens/test.alias"]);
  });
  it("does not turn unrelated semantic vocabulary into component obligations", () => {
    const c = fixture();
    c.styles = { root: { color: { resolvesTo: "semantic.color.foreground.primary", fallback: "#111" } } };
    expect(validateComponentTokenConsumption(c)).toEqual([]);
  });
  it("rejects a rooted alias cycle even when the property has a fallback", () => {
    const c = fixture();
    c.tokens = { "test.a": { resolvesTo: "test.b", fallback: "1px" }, "test.b": { resolvesTo: "test.a", fallback: "2px" } };
    c.styles = { root: { "border-width": { resolvesTo: "test.a", fallback: "0px" } } };
    expect(validateComponentTokenConsumption(c).some(issue => issue.message.includes("COMPONENT_TOKEN_CYCLE"))).toBe(true);
  });
  it("preserves native-only border usage without advertising a web CSS variable", () => {
    const c = corpus("Accordion");
    const slot = inspectComponentTokenConsumption(c).slots.find(slot => slot.slot === "accordion.border.width");
    expect(slot).toMatchObject({ web: false, native: true, behavior: false });
    const ir = buildComponentIR(c);
    expect(emitTokensCss(ir)).not.toContain("--fsds-accordion-border-width:");
    expect(generateReactNativeComponentSource(ir).tokensFile).toContain('"accordion.border.width"');
  });
  it("preserves the dismissal default and native theme lookup without stamping inert web timing", () => {
    const c = corpus("Toast");
    const result = inspectComponentTokenConsumption(c);
    expect(result.slots.find(slot => slot.slot === "toast.timing.auto-dismiss")).toMatchObject({ web: false, native: true, behavior: true });
    const native = generateReactNativeComponentSource(result.ir);
    expect(native.componentFile).toContain('tokens.root?.["toast.timing.auto-dismiss"]');
    expect(native.tokensFile).toContain("fallback: 6000,");
    const swift = generateSwiftUISurfaceFiles(result.ir).componentFile;
    expect(swift).toContain(".milliseconds(6000)");
    expect(swift).not.toContain('"toast.timing.auto-dismiss":');
    expect(emitTokensCss(result.ir)).not.toContain("--fsds-toast-timing-auto-dismiss:");
  });
  it("stamps only actual backend reads in native token dictionaries", () => {
    const c = corpus("Button");
    c.tokens!["button.obsolete"] = { fallback: "17px" };
    const ir = buildComponentIR(c);
    for (const output of [generateReactNativeComponentSource(ir).tokensFile, generateJetpackComposeTokensFile(ir), generateSwiftUIComponentSource(ir)]) {
      expect(output).not.toContain('"button.obsolete"');
      expect(output).toContain('"button.color.background.default"');
    }
    const compose = generateJetpackComposeComponentSource(ir);
    expect(compose).toContain('layeredSlot("box-model.min-height")');
    expect(compose).toContain('layeredSlot("box-model.padding-inline-start")');
    expect(compose).not.toContain("button.size.padding-inline.medium");
  });
});
