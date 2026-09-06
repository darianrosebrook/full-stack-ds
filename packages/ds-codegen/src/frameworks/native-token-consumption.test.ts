import { describe, expect, it } from "vitest";
import { nativeSlotArguments, nativeTokenDefinitionNames } from "./native-token-consumption.js";
import { reactNativeTokenReads, reactNativeTokenDefinitionNames } from "./react-native/token-consumption.js";

describe("native token call sites", () => {
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
