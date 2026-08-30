import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildComponentIR } from "../../ir.js";
import { generateJetpackComposeComponentSource } from "./component-source.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function repoRoot(): string {
  return resolve(__dirname, "../../../../..");
}

/** Load a real corpus contract + sidecars exactly like the swift tests. */
function loadContract(name: string): unknown {
  const folder = resolve(repoRoot(), "packages/ds-contracts/components", name);
  const contract = JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  );
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

const irFor = (name: string) =>
  buildComponentIR(loadContract(name) as Parameters<typeof buildComponentIR>[0]);

describe("generateJetpackComposeComponentSource — static-content path", () => {
  it("emits a composable with a content lambda and theme chrome for a static root (Text)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Text"));
    expect(src).toContain("@Composable");
    expect(src).toContain("fun Text(");
    expect(src).toContain("content: @Composable () -> Unit,");
    expect(src).toContain("val fsdsTheme = LocalFsdsTheme.current");
    expect(src).toContain("fun layeredSlot(slotName: String): String?");
    expect(src).toContain("Box(modifier.then(chromeModifier)) { content() }");
    // Variant scopes participate in layered resolution, root last.
    expect(src).toContain('"variant_" + variant.name.lowercase()');
    expect(src).toContain('"root"');
  });

  it("escapes Kotlin hard keywords as axis parameter names (List's `as` axis)", () => {
    const src = generateJetpackComposeComponentSource(irFor("List"));
    expect(src).toContain("`as`: ListAs");
    expect(src).toContain('"variant_" + `as`.name.lowercase()');
  });

  it("prefixes digit-leading enum entries (TextSize.2xl -> N2xl)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Text"));
    expect(src).toContain("enum class TextSize { Xs, Sm, Md, Lg, Xl, N2xl, N3xl }");
    // The default reference uses the same escaped member name.
    expect(src).toContain("TextSize.Xs");
  });

  it("throws loudly for non-static shapes instead of misrouting", () => {
    expect(() => generateJetpackComposeComponentSource(irFor("Checkbox"))).toThrow(
      /only the native-toggle collapse path is implemented/,
    );
    expect(() => generateJetpackComposeComponentSource(irFor("Select"))).toThrow(
      /only the native-toggle collapse path is implemented/,
    );
  });
});
