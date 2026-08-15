import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readPrimitiveIR } from "../../../primitive-contract.js";
import { generateSwiftUIPrimitiveFiles } from "./primitive-source.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * The contracts tree lives at the repo root's `packages/ds-contracts`, six
 * levels up from this file's directory (`src/frameworks/swift/swiftui/`).
 */
function contractsRoot(): string {
  return resolve(__dirname, "../../../../../..", "packages/ds-contracts");
}

function emit(): string {
  const ir = readPrimitiveIR(contractsRoot());
  return generateSwiftUIPrimitiveFiles(ir)[0]!.contents;
}

describe("generateSwiftUIPrimitiveFiles — Stack", () => {
  it("derives the axis containers from ir.layout.axisByVariant", () => {
    const source = emit();
    // vertical → column → VStack; horizontal → row → HStack (grammar-level
    // mapping only — the vocabulary comes from the contract).
    expect(source).toContain("case (true, .vertical):");
    expect(source).toMatch(/VStack\(spacing: spacing\) \{ content \}/);
    expect(source).toContain("case (true, .horizontal):");
    expect(source).toMatch(/HStack\(spacing: spacing\) \{ content \}/);
  });

  it("gates the axis on axisModes only — native keeps a neutral container", () => {
    const source = emit();
    // displayByMode flex entries are exactly "stack" and "inline-stack";
    // every other mode (block/inline/contents/native) must return false and
    // fall into the no-spacing arm. Mutation: flipping native's gate to true
    // removes the (false, _) arm's exclusivity and fails the false-arm count.
    expect(source).toContain("case .stack: return true");
    expect(source).toContain("case .inlineStack: return true");
    expect(source).toContain("case .block: return false");
    expect(source).toContain("case .inline: return false");
    expect(source).toContain("case .contents: return false");
    expect(source).toContain("case .native: return false");
    expect(source).toContain("case (false, _):");
    expect(source).toContain("VStack(spacing: nil) { content }");
  });

  it("emits the full layout-mode union from displayByMode keys", () => {
    const source = emit();
    expect(source).toContain("case stack");
    expect(source).toContain("case inlineStack = \"inline-stack\"");
    expect(source).toContain("case block");
    expect(source).toContain("case inline");
    expect(source).toContain("case contents");
    expect(source).toContain("case native");
  });

  it("derives the init defaults from the contract prop defaults, not literals", () => {
    const source = emit();
    // Stack.primitive.json declares variant default "vertical" and layout
    // default "stack"; the emitter reads them via props[].kind lookups so a
    // contract change re-points the Swift defaults with no emitter edit.
    expect(source).toContain("variant: StackVariant = .vertical,");
    expect(source).toContain("layout: StackLayout = .stack,");
  });

  it("references the gap token identity without inventing a value", () => {
    const source = emit();
    expect(source).toContain("spacing.gap.stack");
    expect(source).toContain("spacing: CGFloat? = nil");
    // No fabricated concrete spacing: the only spacing literals allowed are
    // the parameter default (nil) and the neutral arm (nil).
    expect(source).not.toMatch(/spacing:\s*\d/);
  });
});
