import { describe, expect, it } from "vitest";
import { nativeSlotArguments, nativeTokenDefinitionNames, composeTokenReads, consumedComposeTokenScopes, composeTokenDefinitions } from "./native-token-consumption.js";
import { reactNativeTokenReads, reactNativeTokenDefinitionNames } from "./react-native/token-consumption.js";

describe("native token call sites", () => {
  it("keeps direct scope identity and excludes unrelated maps and branch strings", () => {
    expect(composeTokenReads('exampleTokenScopes["root"].get("thing.width")'))
      .toEqual([{ scope: "root", name: "thing.width" }]);
    expect(composeTokenReads(`
      val color = exampleTokenScopes["checked"]?.get("thing.color")
      val width = exampleTokenScopes["root"].get("thing.width")
      val size = layeredSlot(when (size) { Small -> "thing.small"; Large -> "thing.large" })
      val unrelated = otherMap["root"]?.get("fake.map")
      val label = when (x) { Small -> "fake.branch" }
      // exampleTokenScopes["root"]?.get("fake.comment")
      val docs = "exampleTokenScopes[\\"root\\"]?.get(\\"fake.example\\")"
    `)).toEqual([
      { name: "thing.small" }, { name: "thing.large" },
      { scope: "checked", name: "thing.color" }, { scope: "root", name: "thing.width" },
    ]);
  });

  it("projects direct scopes precisely and does not stamp theme refs as dictionary consumers", () => {
    const scopes = ["root", "checked", "hover"].map(scope => ({ scope, values: [
      { name: "thing.color", resolvesTo: "thing.alias" }, { name: "thing.alias" }, { name: "thing.width" },
    ] }));
    const ir = { tokenScopes: scopes } as Parameters<typeof consumedComposeTokenScopes>[0];
    expect(consumedComposeTokenScopes(ir, [{ scope: "checked", name: "thing.color" }, { name: "thing.width" }]))
      .toEqual([
        { scope: "root", values: [{ name: "thing.width" }] },
        { scope: "checked", values: [{ name: "thing.color", resolvesTo: "thing.alias" }, { name: "thing.width" }] },
        { scope: "hover", values: [{ name: "thing.width" }] },
      ]);
    expect(consumedComposeTokenScopes(ir, [])).toEqual([]);
  });

  it("reads scoped definitions without crediting comments or examples", () => {
    expect(composeTokenDefinitions(`
      "checked" to mapOf("thing.color" to ComponentTokenDefinition(
        name = "thing.color", cssVar = "--fsds-thing-color", ref = "semantic.color", fallback = "#fff",
      )),
      // "fake" to ComponentTokenDefinition(name = "fake")
      val docs = "\\"fake\\" to ComponentTokenDefinition(name = \\"fake\\")"
      "root" to mapOf("thing.width" to ComponentTokenDefinition(name = "thing.width", literal = "0"))
    `)).toEqual([
      { scope: "checked", key: "thing.color", name: "thing.color", cssVar: "--fsds-thing-color", ref: "semantic.color", fallback: "#fff" },
      { scope: "root", key: "thing.width", name: "thing.width", literal: "0" },
    ]);
  });
  it("distinguishes dictionary definitions from comments and example strings", () => {
    expect(nativeTokenDefinitionNames('"real.swift": FsdsComponentTokenDefinition(name: "real.swift"), "real.kotlin" to ComponentTokenDefinition() // "fake" to ComponentTokenDefinition()'))
      .toEqual(new Set(["real.swift", "real.kotlin"]));
    expect(reactNativeTokenDefinitionNames('const scopes = { root: { "real": {name: "real", fallback: 4} } }; // name: "fake"'))
      .toEqual(new Set(["real"]));
  });
  it("reads optional scope lookups, excluding definition keys and examples", () => {
    expect(reactNativeTokenReads([
      'const x = tokens.root?.["thing.width"]; const y = tokens.variant_small["thing.width"];',
      '// tokens.root["fake"]\nconst example = \'tokens.root["fake"]\'; const definitions = { "fake": 2 };',
    ])).toEqual([{ scope: "root", name: "thing.width" }, { scope: "variant_small", name: "thing.width" }]);
  });
  it("reads native axis branches and suffix lookups, excluding declarations, comments and strings", () => {
    const source = `
      fun layeredSlot(name: String) = null
      val x = layeredSlot("thing.width")
      val y = layeredSlot(when (size) { Small -> "thing.small"; Large -> "thing.large" })
      private var radius: CGFloat { pxSlot("size.radius") ?? 0 }
      // layeredSlot("fake.comment")
      val documentation = "layeredSlot(\\"fake.string\\")"
      val dictionary = "fake.definition" to Definition()
    `;
    expect(nativeSlotArguments(source, ["layeredSlot", "pxSlot"])).toEqual(new Set(["thing.width", "thing.small", "thing.large", "size.radius"]));
  });
});
