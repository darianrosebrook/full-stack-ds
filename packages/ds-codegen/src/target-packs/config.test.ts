import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseTargetArg } from "../emitter.js";
import {
  TARGET_REGISTRY_CONFIG_FILENAME,
  TARGET_REGISTRY_CONFIG_SCHEMA_VERSION,
  assertTargetRegistryConfigV1,
  configuredBuiltinTargets,
  loadTargetRegistryConfigV1,
  type TargetRegistryConfigV1,
} from "./config.js";

function registryConfig(
  targets: TargetRegistryConfigV1["targets"],
): TargetRegistryConfigV1 {
  return {
    schemaVersion: TARGET_REGISTRY_CONFIG_SCHEMA_VERSION,
    targets,
  };
}

describe("TargetRegistryConfigV1", () => {
  it("loads the built-in default when no workspace config exists", () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "fsds-targets-"));
    const loaded = loadTargetRegistryConfigV1(workspace);
    expect(loaded.path).toBeNull();
    expect(configuredBuiltinTargets(loaded.config)).toEqual([
      "react",
      "vue",
      "lit",
      "svelte",
      "angular",
      "figma",
    ]);
  });

  it("loads a root fsds.targets.json file", () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "fsds-targets-"));
    const configPath = path.join(workspace, TARGET_REGISTRY_CONFIG_FILENAME);
    fs.writeFileSync(
      configPath,
      `${JSON.stringify(
        registryConfig([
          { id: "react", source: { kind: "builtin" } },
          { id: "figma", source: { kind: "builtin" } },
        ]),
        null,
        2,
      )}\n`,
    );

    const loaded = loadTargetRegistryConfigV1(workspace);
    expect(loaded.path).toBe(configPath);
    expect(configuredBuiltinTargets(loaded.config)).toEqual(["react", "figma"]);
  });

  it("rejects duplicate target ids", () => {
    expect(() =>
      assertTargetRegistryConfigV1(
        registryConfig([
          { id: "react", source: { kind: "builtin" } },
          { id: "react", source: { kind: "builtin" } },
        ]),
      ),
    ).toThrow(/Duplicate target id/);
  });

  it("validates but does not yet execute local target-pack declarations", () => {
    const config = registryConfig([
      {
        id: "solid",
        source: {
          kind: "local",
          packageRoot: "packages/ds-solid",
          manifest: "fsds.target-pack.json",
        },
      },
    ]);

    expect(() => assertTargetRegistryConfigV1(config)).not.toThrow();
    expect(() => configuredBuiltinTargets(config)).toThrow(/Local\/external target-pack loading/);
  });

  it("rejects local target-pack path escapes", () => {
    expect(() =>
      assertTargetRegistryConfigV1(
        registryConfig([
          {
            id: "solid",
            source: {
              kind: "local",
              packageRoot: "../outside",
              manifest: "fsds.target-pack.json",
            },
          },
        ]),
      ),
    ).toThrow(/must not escape/);
  });
});

describe("parseTargetArg", () => {
  it("accepts registry-provided target ids beyond built-ins", () => {
    expect(parseTargetArg("solid,react", ["react", "solid"])).toEqual([
      "solid",
      "react",
    ]);
  });

  it("uses react as the default target when it is registered", () => {
    expect(parseTargetArg(undefined, ["figma", "react"])).toEqual(["react"]);
  });

  it("uses the first registered target as the default when react is not registered", () => {
    expect(parseTargetArg(undefined, ["figma"])).toEqual(["figma"]);
  });

  it("rejects an empty registry", () => {
    expect(() => parseTargetArg(undefined, [])).toThrow(/No targets are registered/);
  });

  it("still rejects target ids that are not registered", () => {
    expect(() => parseTargetArg("solid", ["react"])).toThrow(/not registered/);
  });

  it("rejects malformed target ids before registry lookup", () => {
    expect(() => parseTargetArg("Solid", ["react", "Solid"])).toThrow(/lowercase identifier/);
  });
});
