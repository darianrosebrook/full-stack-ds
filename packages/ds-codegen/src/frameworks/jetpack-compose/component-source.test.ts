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

  it("emits slot-existence-gated chrome: no dead lookups, no unused vals", () => {
    // Text has no background slot and no radius slot: no containerColor val,
    // no shape/clip, no empty-key layeredSlot calls anywhere.
    const text = generateJetpackComposeComponentSource(irFor("Text"));
    expect(text).not.toContain('layeredSlot("")');
    expect(text).not.toContain('get("")');
    expect(text).not.toContain("containerColor");
    expect(text).not.toContain("RoundedCornerShape");
    expect(text).not.toContain(".clip(");
    // Status carries background + foreground: both resolved, no empty keys.
    const status = generateJetpackComposeComponentSource(irFor("Status"));
    expect(status).toContain('layeredSlot("status.color.background.default")');
    expect(status).toContain('layeredSlot("status.color.foreground.primary")');
    expect(status).not.toContain('layeredSlot("")');
  });

  it("provides the resolved foreground through LocalFsdsContentColor when a foreground slot exists", () => {
    const text = generateJetpackComposeComponentSource(irFor("Text"));
    expect(text).toContain("import com.fullstackds.tokens.LocalFsdsContentColor");
    expect(text).toContain(
      "CompositionLocalProvider(LocalFsdsContentColor provides (contentColor ?: Color.Unspecified))",
    );
    // Skeleton is the decorative box: no foreground slot, no provider.
    const skeleton = generateJetpackComposeComponentSource(irFor("Skeleton"));
    expect(skeleton).not.toContain("LocalFsdsContentColor");
  });

  it("places modifier as the first optional parameter (AOSP API guideline)", () => {
    for (const name of ["Text", "Status", "List", "Skeleton"]) {
      const src = generateJetpackComposeComponentSource(irFor(name));
      const modifierIdx = src.indexOf("modifier: Modifier = Modifier,");
      expect(modifierIdx).toBeGreaterThan(-1);
      expect(modifierIdx).toBeLessThan(src.indexOf("content: @Composable () -> Unit,"));
      // modifier precedes every axis enum parameter
      for (const axis of Object.keys(irFor(name).variants ?? {})) {
        const axisParam = src.indexOf(`${axis}: `);
        if (axisParam !== -1) expect(modifierIdx).toBeLessThan(axisParam);
      }
    }
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
