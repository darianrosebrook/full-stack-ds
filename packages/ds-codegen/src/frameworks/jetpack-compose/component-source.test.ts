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
    // Text carries the element prop, so the box appends the heading modifier.
    expect(src).toContain(
      "Box(modifier.then(chromeModifier).then(headingModifier)) { content() }",
    );
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

  it("lowers the typography slots into a TextStyle for content-role roots (Text)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Text"));
    expect(src).toContain('layeredSlot("text.size.md")?.toFsdsSp()');
    // Weight axis lowers through the corpus value→slot vocabulary.
    expect(src).toContain('TextWeight.Normal -> "text.typography.fontWeight.regular"');
    expect(src).toContain('TextWeight.Semibold -> "text.typography.fontWeight.medium"');
    expect(src).toContain('TextWeight.Bold -> "text.typography.fontWeight.bold"');
    expect(src).toContain("?.toFsdsWeight()");
    expect(src).toContain(
      "val fsdsTextStyle = TextStyle(fontSize = fsdsFontSize ?: TextUnit.Unspecified, fontWeight = fsdsFontWeight ?: FontWeight.Normal)",
    );
    expect(src).toContain("ProvideFsdsTextStyle(fsdsTextStyle) {");
    // Non-typography static roots carry none of the machinery.
    const status = generateJetpackComposeComponentSource(irFor("Status"));
    expect(status).not.toContain("ProvideFsdsTextStyle");
    expect(status).not.toContain("TextStyle(");
  });

  it("lowers the element-tag union prop to a parameter plus heading semantics (Text's `as`)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Text"));
    expect(src).toContain("enum class TextElement { P, Span, Div, H1, H2, H3, H4, H5, H6 }");
    expect(src).toContain("`as`: TextElement = TextElement.P,");
    // All six heading values lower to the heading marker (the CMP 1.8.0
    // desktop semantics artifact has no Heading.Level class).
    expect(src.match(/-> Modifier\.semantics \{ heading\(\) \}/g)?.length).toBe(6);
    expect(src).toContain("Box(modifier.then(chromeModifier).then(headingModifier)) { content() }");
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

describe("generateJetpackComposeComponentSource — passive-leaf families", () => {
  it("emits a prop-text leaf as BasicText with the bound prop and font-size slot (CodeSnippet)", () => {
    const src = generateJetpackComposeComponentSource(irFor("CodeSnippet"));
    expect(src).toContain("import androidx.compose.foundation.text.BasicText");
    expect(src).toContain("text: String,");
    expect(src).toContain("BasicText(");
    expect(src).toContain("text = text,");
    expect(src).toContain('layeredSlot("code-snippet.size.fontSize.default")?.toFsdsSp()');
    expect(src).toContain(
      "val fsdsTextStyle = TextStyle(",
    );
    // No content lambda — the text is the bound prop.
    expect(src).not.toContain("content: @Composable () -> Unit,");
    // Markdown's content transform degrades to its source prop.
    const markdown = generateJetpackComposeComponentSource(irFor("Markdown"));
    expect(markdown).toContain("content: String,");
    expect(markdown).toContain("text = content,");
  });

  it("emits the expandable-content shape with the expanded channel and a wired toggle (Truncate)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Truncate"));
    expect(src).toContain("expanded: Boolean? = null,");
    expect(src).toContain("defaultExpanded: Boolean = false,");
    expect(src).toContain("onExpandedChange: ((Boolean) -> Unit)? = null,");
    expect(src).toContain("expandable: Boolean = false,");
    expect(src).toContain("collapseText: String? = null,");
    expect(src).toContain("expandText: String? = null,");
    // The toggle label comes from the IR conditional content (expanded →
    // collapseText, collapsed → expandText), not hardcoded labels.
    expect(src).toContain(
      "text = (if (resolvedExpanded) collapseText else expandText) ?: \"\",",
    );
    expect(src).toContain("onExpandedChange?.invoke(!resolvedExpanded)");
    expect(src).toContain("stateDescription = if (resolvedExpanded) \"expanded\" else \"collapsed\"");
    // Gated by the contract's expandable prop.
    expect(src).toContain("if (expandable) {");
  });

  it("emits a progressbar-role indicator with the 0-100 value and intent fill (Progress)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Progress"));
    expect(src).toContain("enum class ProgressVariant { Linear, Circular }");
    expect(src).toContain("value: Float? = null,");
    expect(src).toContain("FsdsProgressIndicator(");
    expect(src).toContain("progress = value?.let { it / 100f },");
    // Per-intent fill color resolves through the layered scopes.
    expect(src).toContain('ProgressIntent.Info -> "progress.color.fill.info"');
    expect(src).toContain('ProgressIntent.Danger -> "progress.color.fill.danger"');
    // No dead dim lookups: Progress has no spinner.size slots.
    expect(src).not.toContain("spinner.size.sm");
  });

  it("emits a status-role spinner with per-value size/thickness dim lookups (Spinner)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Spinner"));
    expect(src).toContain("enum class SpinnerSize { Xs, Sm, Md, Lg }");
    expect(src).toContain("linear = false,");
    expect(src).toContain('SpinnerSize.Md -> "spinner.size.md"');
    expect(src).toContain('SpinnerThickness.Regular -> "spinner.thickness.regular"');
    expect(src).toContain("FsdsProgressIndicator(");
  });
});
