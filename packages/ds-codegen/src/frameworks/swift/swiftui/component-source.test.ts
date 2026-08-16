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

  it.each(["TextField", "Dialog"])(
    "refuses to emit for contracts outside every emission class (%s)",
    (name) => {
      // TextField carries a component-instance leaf (fsds.Input) and
      // Dialog is a surface block with a dom tree — neither matches an
      // emission class. Fail loud, never approximate.
      const contract = loadContract(name) as Parameters<
        typeof buildComponentIR
      >[0];
      const ir = buildComponentIR(contract);

      expect(() => generateSwiftUIComponentSource(ir)).toThrow(
        /no emission class matches/,
      );
    },
  );
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

describe("generateSwiftUIComponentSource — compound-part composer (Card)", () => {
  function emitCard(): string {
    const contract = loadContract("Card") as Parameters<
      typeof buildComponentIR
    >[0];
    return generateSwiftUIComponentSource(buildComponentIR(contract));
  }

  it("emits one ViewBuilder region per compound part", () => {
    const source = emitCard();
    expect(source).toContain(
      "public struct Card<Header: View, Content: View, Footer: View, Description: View>: View {",
    );
    expect(source).toContain("@ViewBuilder header: () -> Header = { EmptyView() }");
    expect(source).toContain("@ViewBuilder content: () -> Content = { EmptyView() }");
    expect(source).toContain("@ViewBuilder footer: () -> Footer = { EmptyView() }");
    expect(source).toContain("@ViewBuilder description: () -> Description = { EmptyView() }");
    expect(source).toContain("VStack(spacing: gap) {");
  });

  it("realizes chrome presence-driven with the status accent bar", () => {
    const source = emitCard();
    expect(source).toContain("enum CardTokens {");
    expect(source).toContain('.adaptive(light: "#ffffff", dark:');
    expect(source).toContain(
      "Rectangle().fill(statusAccent).frame(width: statusAccentWidth)",
    );
    expect(source).toContain(".clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))");
    expect(source).toContain(".foregroundStyle(foreground)");
  });

  it("keeps authored-default axes defaulted and no-default axes optional", () => {
    const source = emitCard();
    // status has no authored contract default → optional, layered via map.
    expect(source).toContain("status: CardStatus? = nil,");
    expect(source).toContain('status.map { "variant_\\($0.rawValue)" }');
    expect(source).toContain(".compactMap { $0 }");
    // density defaults to the `default` member — a Swift keyword, escaped.
    expect(source).toContain("case `default`");
    expect(source).toContain("density: CardDensity = .`default`,");
  });
});

describe("generateSwiftUIComponentSource — named-slot composer (Field)", () => {
  function emitField(): string {
    const contract = loadContract("Field") as Parameters<
      typeof buildComponentIR
    >[0];
    return generateSwiftUIComponentSource(buildComponentIR(contract));
  }

  it("emits one ViewBuilder region per named slot in dom order", () => {
    const source = emitField();
    // `Field` is in the SwiftUI reserved-type table → exported as FsdsField.
    expect(source).toMatch(
      /public struct FsdsField<Label: View, Control: View, Help: View, Error: View, ValidatingIndicator: View>: View \{/,
    );
    expect(source).toContain("@ViewBuilder label: () -> Label = { EmptyView() }");
    expect(source).toContain("@ViewBuilder control: () -> Control = { EmptyView() }");
    expect(source).toContain("@ViewBuilder help: () -> Help = { EmptyView() }");
    expect(source).toContain("@ViewBuilder error: () -> Error = { EmptyView() }");
    expect(source).toContain("@ViewBuilder validatingIndicator: () -> ValidatingIndicator = { EmptyView() }");
    // No trailing comma on the final region parameter.
  });

  it("realizes short-form chrome slots and layers the status axis", () => {
    const source = emitField();
    expect(source).toContain("enum FieldTokens {");
    expect(source).toContain('.adaptive(light: "#ffffff", dark:');
    expect(source).toContain('colorSlot("color.bg") ?? .accentColor');
    expect(source).toContain('pxSlot("radius") ?? 0');
    expect(source).toContain('colorSlot("color.border") ?? .clear');
    expect(source).toContain("status: FieldStatus? = nil,");
    expect(source).toContain('status.map { "variant_\\($0.rawValue)" }');
  });

  it("omits the web value-channel API instead of accepting-and-ignoring it", () => {
    const source = emitField();
    expect(source).not.toContain("value:");
    expect(source).not.toContain("onChange");
    expect(source).not.toContain("validate:");
  });
});

describe("generateSwiftUIComponentSource — value-channel text control (Input)", () => {
  function emitInput(): string {
    const contract = loadContract("Input") as Parameters<
      typeof buildComponentIR
    >[0];
    return generateSwiftUIComponentSource(buildComponentIR(contract));
  }

  it("projects the string channel through the controllable-state pattern", () => {
    const source = emitInput();
    expect(source).toContain("public struct Input: View {");
    expect(source).toContain("@StateObject private var text: ControllableValue<String>");
    expect(source).toContain("value: Binding<String>? = nil");
    expect(source).toContain("@StateObject private var text: ControllableValue<String>");
    expect(source).toContain("onChange: onChange))");
    expect(source).toContain("TextField(");
    expect(source).toContain("prompt: placeholder.map(Text.init)");
  });

  it("omits HTML-form props instead of accepting-and-ignoring them", () => {
    const source = emitInput();
    for (const omitted of ["type: String", "required: Bool", "name: String", "invalid: Bool"]) {
      expect(source).not.toContain(omitted);
    }
  });

  it("realizes chrome through FsdsTheme with the input suffix forms", () => {
    const source = emitInput();
    expect(source).toContain('colorSlot("color.bg.default")');
    expect(source).toContain('colorSlot("color.text.default")');
    expect(source).toContain('.background(background)');
    expect(source).toContain('.frame(minHeight: minHeight)');
  });
});

describe("generateSwiftUIComponentSource — coverage batch (disclosure + static content)", () => {
  function emit(name: string): string {
    const contract = loadContract(name) as Parameters<
      typeof buildComponentIR
    >[0];
    return generateSwiftUIComponentSource(buildComponentIR(contract));
  }

  it("collapses native-disclosure to DisclosureGroup (Details)", () => {
    const source = emit("Details");
    expect(source).toContain("DisclosureGroup(isExpanded: Binding(");
    expect(source).toContain("summary: String? = nil");
    expect(source).toContain("ControllableValue(controlled: open");
    expect(source).toContain("Text(summary)");
  });

  it("emits static content for Label and Blockquote", () => {
    // Label collides with SwiftUI.Label → FsdsLabel via the reserved table.
    const label = emit("Label");
    expect(label).toContain("public struct FsdsLabel<Content: View>: View {");
    expect(label).toContain("@ViewBuilder content: () -> Content");
    const quote = emit("Blockquote");
    expect(quote).toContain("public struct Blockquote<Content: View>: View {");
    expect(quote).not.toContain("cite:");
  });

  it("emits static content for Links and List (gate breadth)", () => {
    expect(emit("Links")).toContain("@ViewBuilder content: () -> Content");
    expect(emit("List")).toContain("@ViewBuilder content: () -> Content");
  });
});

describe("generateSwiftUIComponentSource — coverage batch 2", () => {
  function emit(name: string): string {
    const contract = loadContract(name) as Parameters<
      typeof buildComponentIR
    >[0];
    return generateSwiftUIComponentSource(buildComponentIR(contract));
  }

  it("lowers the boolean input channel to a checkbox Toggle (Checkbox)", () => {
    const source = emit("Checkbox");
    expect(source).toContain("public struct Checkbox: View {");
    expect(source).toContain(".toggleStyle(.checkbox)");
    expect(source).toContain("checked: Binding<Bool>? = nil");
    expect(source).toContain("onChange: onChange))");
    expect(source).not.toContain("indeterminate:");
  });

  it("lowers the bare hr rule to FsdsDivider with a local orientation enum", () => {
    const source = emit("Divider");
    expect(source).toContain("public struct FsdsDivider: View {");
    expect(source).toContain("public enum DividerOrientation: String, CaseIterable {");
    expect(source).toContain("orientation: DividerOrientation? = nil");
    expect(source).toContain("Divider()");
  });

  it("lowers the progressbar role to ProgressView with contract 0-100 semantics", () => {
    const source = emit("Progress");
    expect(source).toContain("ProgressView(value: value / 100)");
    expect(source).toContain("value: Double? = nil");
    expect(source).toContain("ProgressView()");
    expect(source).toContain(".fsdsAccessibilityLabel(label)");
  });

  it("lowers the visual-only leaf to a native spinner (Spinner)", () => {
    const source = emit("Spinner");
    expect(source).toContain("public struct Spinner: View {");
    expect(source).toContain("ProgressView()");
    expect(source).not.toContain("showAfterMs");
  });
});

describe("generateSwiftUIComponentSource — glyph host (Icon)", () => {
  it("emits a registry lookup with size hints and decorative default", () => {
    const contract = loadContract("Icon") as Parameters<
      typeof buildComponentIR
    >[0];
    const source = generateSwiftUIComponentSource(buildComponentIR(contract));
    expect(source).toContain("public struct Icon: View {");
    expect(source).toContain("GlyphCatalog.glyph(named: name, size: glyphSize)");
    expect(source).toContain("case .sm: return 16");
    expect(source).toContain("case .md: return 20");
    expect(source).toContain("case .lg: return 24");
    expect(source).toContain("case .xl: return 32");
    expect(source).toContain(".accessibilityHidden(");
    expect(source).toContain("GlyphCatalog.decorativeDefaults.contains(name)");
  });
});
