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
 * Load a component contract along with its tokens/styles sidecars (if any),
 * returning the merged shape `buildComponentIR` expects. Mirrors the CLI's
 * load order: contract first, then sidecars attached as `contract.tokens` /
 * `contract.styles`.
 */
function loadContract(name: string): unknown {
  const folder = resolve(
    repoRoot(),
    "packages/ds-contracts/components",
    name,
  );
  const contract = JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  ) as { tokens?: unknown; styles?: unknown };
  const tokensPath = resolve(folder, `${name}.tokens.json`);
  if (existsSync(tokensPath)) {
    contract.tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  }
  const stylesPath = resolve(folder, `${name}.styles.json`);
  if (existsSync(stylesPath)) {
    contract.styles = JSON.parse(readFileSync(stylesPath, "utf8"));
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

  it("refuses to emit for contracts outside every emission class (Card)", () => {
    // Card is a slot-projected composer (named slot children, compound
    // parts) — not a collapse intent, not a projected-children action root.
    // The emitter must fail loud rather than approximate.
    const contract = loadContract("Card") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    expect(() => generateSwiftUIComponentSource(ir)).toThrow(
      /no emission class matches/,
    );
  });
});

describe("generateSwiftUIComponentSource — projected-children action (Button)", () => {
  it("emits under the Fsds prefix when the name collides with SwiftUI", () => {
    const contract = loadContract("Button") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    const source = generateSwiftUIComponentSource(ir);

    // Reserved-type table: SwiftUI.Button collision → FsdsButton export.
    expect(source).toContain("public struct FsdsButton<Label: View>: View {");
    expect(source).not.toContain("public struct Button");
  });

  it("ships token scope data from ir.tokenScopes and resolves through FsdsTheme", () => {
    const contract = loadContract("Button") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    const source = generateSwiftUIComponentSource(ir);

    // RN normal form: data in a caseless-enum namespace, never resolved
    // constants; resolution goes through the theme at render.
    expect(source).toContain("enum ButtonTokens {");
    expect(source).toContain("public static let scopes: FsdsComponentTokenScopes = [");
    expect(source).toContain('"variant_destructive": [');
    expect(source).toContain('fallback: .string("#d92d2e")');
    expect(source).toContain("resolveFsdsLayeredTokens(");
    expect(source).toContain("@Environment(\\.fsdsTheme)");
    // Layering: root base + variant_<size> + variant_<intent> (Swift
    // interpolation survives into the emitted source).
    expect(source).toContain('layers: ["root", "variant_\\(size.rawValue)", "variant_\\(variant.rawValue)"]');
  });

  it("derives init defaults from contract prop defaults and applies presence-driven chrome", () => {
    const contract = loadContract("Button") as Parameters<
      typeof buildComponentIR
    >[0];
    const ir = buildComponentIR(contract);

    const source = generateSwiftUIComponentSource(ir);

    expect(source).toContain("variant: ButtonVariant = .primary,");
    expect(source).toContain("size: ButtonSize = .medium,");
    expect(source).toContain("onTap: (() -> Void)? = nil,");
    expect(source).toContain("Button(action: { onTap?() }) {");
    // Chrome slots that exist in the corpus get accessors + modifiers…
    expect(source).toContain('.background(background)');
    expect(source).toContain('.clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))');
    // …and the loading affordance swaps the projected label.
    expect(source).toContain("ProgressView().controlSize(.small)");
    expect(source).toContain(".disabled(disabled || loading)");
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
