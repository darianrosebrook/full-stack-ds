import { describe, expect, it } from "vitest";
import {
  assertTargetRegistryConfigV1,
  type TargetRegistryConfigV1,
} from "./config.js";

function configWith(overrides: {
  components?: readonly string[];
}): TargetRegistryConfigV1 {
  return {
    schemaVersion: "fsds.target-registry.v1",
    targets: [
      { id: "swiftui", source: { kind: "builtin" }, ...overrides },
    ],
  } as TargetRegistryConfigV1;
}

describe("target-registry config components allowlist", () => {
  it("accepts a unique, non-empty allowlist", () => {
    expect(() =>
      assertTargetRegistryConfigV1(
        configWith({ components: ["Switch", "Button", "Dialog"] }),
      ),
    ).not.toThrow();
  });

  it("rejects duplicate and empty component entries", () => {
    expect(() =>
      assertTargetRegistryConfigV1(
        configWith({ components: ["Switch", "Switch"] }),
      ),
    ).toThrow(/Duplicate component "Switch"/);
    expect(() =>
      assertTargetRegistryConfigV1(configWith({ components: [""] })),
    ).toThrow(/must be a non-empty string/);
  });
});
