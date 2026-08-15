import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildComponentIR } from "../../../ir.js";
import { generateSwiftUIComponentSource } from "./component-source.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve a path relative to the repo root. The codegen package lives at
 * `<root>/packages/ds-codegen`; this file is four levels deep
 * (`src/frameworks/swift/swiftui/`), so the repo root is six levels up.
 */
function repoRoot(): string {
  return resolve(__dirname, "../../../../../..");
}

/**
 * Load a component contract along with its tokens sidecar (if any), returning
 * the merged shape `buildComponentIR` expects. Mirrors the CLI's load order:
 * contract first, then sidecar attached as `contract.tokens`.
 */
function loadContract(name: string): unknown {
  const folder = resolve(
    repoRoot(),
    "packages/ds-contracts/components",
    name,
  );
  const contract = JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  ) as { tokens?: unknown };
  const tokensPath = resolve(folder, `${name}.tokens.json`);
  if (existsSync(tokensPath)) {
    contract.tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  }
  return contract;
}

function loadGolden(relative: string): string {
  const path = resolve(
    repoRoot(),
    "packages/ds-codegen/__golden__",
    relative,
  );
  return readFileSync(path, "utf8");
}

describe("generateSwiftUIComponentSource — round 2 byte-identity (Switch)", () => {
  it("produces byte-identical output to Switch.swiftui.generated.swift", () => {
    const contract = loadContract("Switch") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    const actual = generateSwiftUIComponentSource(ir);
    const expected = loadGolden("Switch/Switch.swiftui.generated.swift");

    expect(actual).toBe(expected);
  });

  it("refuses to emit for components without native-toggle-affordance intent", () => {
    // A minimal IR shape with no collapse intent on any part. Emitter
    // should fail loud rather than silently emit a multi-part fallback
    // (which is not implemented in round 2).
    const contract = loadContract("Button") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    expect(() => generateSwiftUIComponentSource(ir)).toThrow(
      /native-toggle-affordance/,
    );
  });
});

describe("generateSwiftUIComponentSource — default size member (ToggleSwitch)", () => {
  // ToggleSwitch's size union is small/medium/large with contract default
  // `medium` — unlike Switch's sm/md/lg with default `md`. Pins the
  // FEAT-SWIFTUI-EMITTER-WIRING-01 derivation: the initializer default and
  // the size-accessor fallback come from the contract's props[].default
  // fact, never a hardcoded `.md` (which produced invalid Swift:
  // "type 'ToggleSwitchSize' has no member 'md'").
  it("derives the initializer default from the contract prop default", () => {
    const contract = loadContract("ToggleSwitch") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    const source = generateSwiftUIComponentSource(ir);

    expect(source).toContain("size: ToggleSwitchSize = .medium,");
    expect(source).not.toContain("= .md,");
    expect(source).toContain("case small");
    expect(source).toContain("case medium");
    expect(source).toContain("case large");
  });

  it("omits track geometry when no size token facts are authored", () => {
    // ToggleSwitch's sidecar authors no *.size.*.track.* slots, so the
    // emitter must NOT emit a .frame(width:height:) or 0-valued accessors —
    // the native Toggle keeps its intrinsic platform size instead of
    // silently rendering an invisible 0x0 control.
    const contract = loadContract("ToggleSwitch") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    const source = generateSwiftUIComponentSource(ir);

    expect(source).not.toContain(".frame(width: trackWidth");
    expect(source).not.toContain("trackWidth");
    expect(source).not.toContain("return 0");
  });
});
