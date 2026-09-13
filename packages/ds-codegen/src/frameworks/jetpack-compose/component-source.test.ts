import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildComponentIR } from "../../ir.js";
import { generateJetpackComposeComponentSource, generateJetpackComposeTokensFile } from "./component-source.js";

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

describe("Compose direct token bindings", () => {
  it("preserves independent padding edges in projected-content controls", () => {
    const source = generateJetpackComposeComponentSource(irFor("Button"));
    const tokens = generateJetpackComposeTokensFile(irFor("Button"));
    for (const edge of ["inline-start", "inline-end", "block-start", "block-end"]) {
      expect(source).toContain(`layeredSlot("box-model.padding-${edge}")`);
      expect(tokens).toContain(`name = "box-model.padding-${edge}"`);
    }
    expect(source).toContain("PaddingValues(start = paddingInlineStart, top = paddingBlockStart, end = paddingInlineEnd, bottom = paddingBlockEnd)");
  });
  it.each(["Switch", "ToggleSwitch"])("keeps %s direct state lookups and their authored fallbacks", name => {
    const source = generateJetpackComposeComponentSource(irFor(name));
    const tokens = generateJetpackComposeTokensFile(irFor(name));
    const reads = [...source.matchAll(/TokenScopes\["([^"]+)"\]\?\.get\("([^"]+)"\)/g)];
    expect(reads.length).toBeGreaterThan(0);
    for (const [, scope, slot] of reads) {
      const block = tokens.split(`"${scope}" to mapOf(`)[1]?.split("\n    ),")[0] ?? "";
      expect(block, `${scope}: ${slot}`).toContain(`"${slot}" to ComponentTokenDefinition(`);
    }
    expect(tokens).toContain('fallback = "4px"');
    expect(tokens).not.toContain('name = "box-model.gap"');
  });
});

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
    // Select gained the selection class; Card and Chip remain unimplemented
    // shapes (composer and dual-action composite respectively).
    expect(() => generateJetpackComposeComponentSource(irFor("Card"))).toThrow(
      /no emission class matches component "Card" on jetpack-compose/,
    );
    expect(() => generateJetpackComposeComponentSource(irFor("Chip"))).toThrow(
      /no emission class matches component "Chip" on jetpack-compose/,
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

describe("generateJetpackComposeComponentSource — boolean-control class (FEAT-COMPOSE-ADMISSION-SUBSTRATE-01)", () => {
  it("lowers the boolean value channel onto the FsdsCheckbox substrate with controlled-state hoisting (Checkbox)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Checkbox"));
    // Channel param names come from the IR's normalized channel.
    expect(src).toContain("checked: Boolean? = null,");
    expect(src).toContain("defaultChecked: Boolean = false,");
    expect(src).toContain("onChange: ((Boolean) -> Unit)? = null,");
    // Controlled-takes-precedence uncontrolled fallback.
    expect(src).toContain("val resolvedChecked = checked ?: uncontrolledChecked");
    expect(src).toContain("if (checked == null) {");
    // The change-handler prop name comes from the contract channel.
    expect(src).toMatch(/\?\.invoke\(next\)/);
    // Foundation-only substrate: the painted control, never a material import.
    expect(src).toContain("FsdsCheckbox(");
    expect(src).toContain("FsdsCheckboxStyle(");
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    // Modifier is the first optional parameter (AOSP guideline).
    expect(src.match(/fun Checkbox\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
    // Named divergence: the binary substrate does not lower indeterminate.
    expect(src).not.toContain("indeterminate");
  });

  it("keeps every root-scope read backed by a tokens-file definition (Checkbox)", () => {
    const source = generateJetpackComposeComponentSource(irFor("Checkbox"));
    const tokens = generateJetpackComposeTokensFile(irFor("Checkbox"));
    const reads = [...source.matchAll(/TokenScopes\["([^"]+)"\]\?\.get\("([^"]+)"\)/g)];
    expect(reads.length).toBeGreaterThanOrEqual(9);
    for (const [, scope, slot] of reads) {
      const block = tokens.split(`"${scope}" to mapOf(`)[1]?.split("\n    ),")[0] ?? "";
      expect(block, `${scope}: ${slot}`).toContain(`"${slot}" to ComponentTokenDefinition(`);
    }
    // box-model.gap is RN-consumed but deliberately unclaimed by this path.
    expect(tokens).not.toContain('name = "box-model.gap"');
  });

  it("dispatches on the structural class, not the component name", () => {
    const ir = irFor("Checkbox");
    const renamed = { ...ir, name: "RenamedControl" };
    const src = generateJetpackComposeComponentSource(renamed);
    expect(src).toContain("fun RenamedControl(");
    expect(src).toContain("FsdsCheckbox(");
    expect(src).toContain('["root"]?.get("checkbox.color.background.default")');
  });

  it("lowers the string value channel onto a foundation BasicTextField with input-part chrome (Input)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Input"));
    expect(src).toContain("value: String? = null,");
    expect(src).toContain("defaultValue: String = \"\",");
    expect(src).toContain("onChange: ((String) -> Unit)? = null,");
    expect(src).toContain("val resolvedValue = value ?: uncontrolledValue");
    expect(src).toContain("BasicTextField(");
    expect(src).toContain('fsdsTheme.resolve(inputTokenScopes["root"]?.get("input.color.bg.default"))?.toFsdsColor()');
    expect(src).toContain('fsdsTheme.resolve(inputTokenScopes["root"]?.get("input.typography.size.default"))?.toFsdsSp()');
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src).not.toContain("input.opacity.disabled");
    expect(src.match(/fun Input\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });

  it("keeps the declared native-toggle collapse ahead of structural control classes", () => {
    // Switch declares native-toggle-affordance; the collapse must own the
    // realization even though its boolean channel would match the control class.
    const src = generateJetpackComposeComponentSource(irFor("Switch"));
    expect(src).toContain("FsdsToggle(");
    expect(src).not.toContain("FsdsCheckbox(");
  });
});

describe("generateJetpackComposeComponentSource — bare-rule-leaf class (FEAT-COMPOSE-ADMISSION-SUBSTRATE-01)", () => {
  it("lowers the hr root onto the FsdsRule substrate with the orientation axis (Divider)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Divider"));
    expect(src).toContain("enum class DividerOrientation { Horizontal, Vertical }");
    expect(src).toContain("DividerOrientation.Horizontal -> FsdsRuleOrientation.Horizontal");
    expect(src).toContain("DividerOrientation.Vertical -> FsdsRuleOrientation.Vertical");
    expect(src).toContain("decorative: Boolean = false,");
    expect(src).toContain("FsdsRuleStyle(");
    expect(src).toContain('["root"]?.get("divider.color.default")');
    expect(src).toContain('["root"]?.get("divider.size.thickness")');
    // Named divergences: thickness/title string props are omitted v1.
    expect(src).not.toContain("thickness: String");
    expect(src).not.toContain("title: String");
    // Modifier is the first optional parameter.
    expect(src.match(/fun Divider\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });

  it("keeps every rule read backed by a tokens-file definition; gap stays unread (Divider)", () => {
    const source = generateJetpackComposeComponentSource(irFor("Divider"));
    const tokens = generateJetpackComposeTokensFile(irFor("Divider"));
    const reads = [...source.matchAll(/TokenScopes\["([^"]+)"\]\?\.get\("([^"]+)"\)/g)];
    // The test-env IR carries the sidecar's own slots (color + thickness);
    // the CLI additionally injects box-model primitive geometry, widening
    // the read set. The closure property below holds in both environments.
    expect(reads.length).toBeGreaterThanOrEqual(2);
    for (const [, scope, slot] of reads) {
      const block = tokens.split(`"${scope}" to mapOf(`)[1]?.split("\n    ),")[0] ?? "";
      expect(block, `${scope}: ${slot}`).toContain(`"${slot}" to ComponentTokenDefinition(`);
    }
    expect(tokens).not.toContain('name = "box-model.gap"');
  });
});

describe("generateJetpackComposeComponentSource — glyph classes (FEAT-COMPOSE-GLYPH-ADMISSION-01)", () => {
  it("lowers the iconGlyph fact onto the shared glyph registry with hint-driven sizes (Icon)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Icon"));
    expect(src).toContain("enum class IconSize { Sm, Md, Lg, Xl }");
    expect(src).toContain("size: IconSize = IconSize.Md,");
    // Token-scoped frame dims preferred, hint table fallback — the when
    // covers every hint member from the IR fact.
    expect(src).toContain('IconSize.Sm -> fsdsTheme.resolve(iconTokenScopes["root"]?.get("icon.size.sm"))?.toFsdsDp() ?: 16.dp');
    expect(src).toContain("FsdsGlyphIcon(");
    // Decorative-by-default semantics come from the catalog flags.
    expect(src).toContain("FsdsGlyphCatalog.decorativeDefaults.contains(name)");
    expect(src).toContain("Modifier.clearAndSetSemantics { }");
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src.match(/fun Icon\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });

  it("emits the glyph catalog substrate from the iconography corpus", async () => {
    const { generateComposeGlyphCatalogFile } = await import("./icon-glyph.js");
    const catalog = generateComposeGlyphCatalogFile();
    expect(catalog).not.toBeNull();
    expect(catalog!.relativePath).toBe("../glyph/FsdsGlyphCatalog.kt");
    expect(catalog!.contents).toContain("object FsdsGlyphCatalog {");
    expect(catalog!.contents).toContain("FsdsSvgPath.parse(stroke.d)");
    // Kotlin literals escape dollars so path data cannot interpolate.
    expect(catalog!.contents).not.toMatch(/[^\\]\$/);
  });

  it("lowers the ReactNode icon region beside one content region with variant-layered chrome (Alert)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Alert"));
    expect(src).toContain("icon: (@Composable () -> Unit)? = null,");
    expect(src).toContain("content: @Composable () -> Unit,");
    expect(src).toContain("enum class AlertIntent { Info, Success, Warning, Danger }");
    // Nullable axes contribute a layer only when set.
    expect(src).toContain(
      'if (intent != null) "variant_" + intent.name.lowercase() else null',
    );
    expect(src).toContain('layeredSlot("alert.color.background.primary")');
    expect(src).toContain("Arrangement.spacedBy(gap)");
    expect(src).toContain("LocalFsdsContentColor provides (contentColor ?: Color.Unspecified)");
    expect(src).not.toMatch(/import androidx\.compose\.material/);
  });

  it("maps member-named variant slots including the error-to-danger family closure (AlertNotice)", () => {
    const src = generateJetpackComposeComponentSource(irFor("AlertNotice"));
    // Exact name-grammar members.
    expect(src).toContain(
      'AlertNoticeStatus.Info -> fsdsTheme.resolve(alertNoticeTokenScopes["root"]?.get("alert-notice.color.background.info"))',
    );
    // The sole unmatched member binds the sole unassigned family slot.
    expect(src).toContain(
      'AlertNoticeStatus.Error -> fsdsTheme.resolve(alertNoticeTokenScopes["root"]?.get("alert-notice.color.background.danger"))',
    );
    const tokens = generateJetpackComposeTokensFile(irFor("AlertNotice"));
    const reads = [...src.matchAll(/TokenScopes\["([^"]+)"\]\?\.get\("([^"]+)"\)/g)];
    expect(reads.length).toBeGreaterThanOrEqual(10);
    for (const [, scope, slot] of reads) {
      const block = tokens.split(`"${scope}" to mapOf(`)[1]?.split("\n    ),")[0] ?? "";
      expect(block, `${scope}: ${slot}`).toContain(`"${slot}" to ComponentTokenDefinition(`);
    }
    expect(tokens).not.toContain('name = "box-model.gap"');
  });
});

describe("generateJetpackComposeComponentSource — disclosure class (FEAT-COMPOSE-DISCLOSURE-01)", () => {
  it("lowers native-disclosure onto a toggleable header with animated content (Details)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Details"));
    expect(src).toContain("open: Boolean? = null,");
    expect(src).toContain("val resolvedOpen = open ?: uncontrolledOpen");
    expect(src).toContain("onOpenChange?.invoke(next)");
    expect(src).toContain("summary: String? = null,");
    expect(src).toContain("AnimatedVisibility(visible = resolvedOpen)");
    expect(src).toContain("role = Role.Button,");
    expect(src).toContain('stateDescription = if (resolvedOpen) "expanded" else "collapsed"');
    expect(src).toContain('layeredSlot("details.color.background.default")');
    // Consumer content inherits the foreground through the local.
    expect(src).toContain("LocalFsdsContentColor provides (contentColor ?: Color.Unspecified)");
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src.match(/fun Details\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });

  it("Card and Select remain unadmitted shapes", () => {
    // Accordion/Tabs gained the interactive-composite class; Card (composer)
    // and Chip (dual-action composite) are still unimplemented.
    for (const name of ["Card", "Chip"]) {
      expect(() => generateJetpackComposeComponentSource(irFor(name))).toThrow(
        new RegExp(`no emission class matches component "${name}" on jetpack-compose`),
      );
    }
  });
});

describe("generateJetpackComposeComponentSource — radio-collection class (FEAT-COMPOSE-RADIO-ADMISSION-01)", () => {
  it("lowers the shared radio facts onto selectable rows (RadioGroup)", () => {
    const src = generateJetpackComposeComponentSource(irFor("RadioGroup"));
    // Option data class lowered from the contract alias.
    expect(src).toContain("data class RadioGroupOption(");
    expect(src).toContain("val value: String,");
    expect(src).toContain("val label: String,");
    // Channel trio + controlled-takes-precedence.
    expect(src).toContain("value: String? = null,");
    expect(src).toContain("val resolvedValue = value ?: uncontrolledValue");
    expect(src).toContain("onChange?.invoke(item.value)");
    // One selectable row per option with radio semantics.
    expect(src).toContain("role = Role.RadioButton,");
    expect(src).toContain("selected = selected,");
    expect(src).toContain("if (orientation == RadioGroupOrientation.Horizontal)");
    expect(src).toContain("Arrangement.spacedBy(groupGap, Alignment.CenterHorizontally)");
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src.match(/fun RadioGroup\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });

  it("keeps every radio read backed by a tokens-file definition (RadioGroup)", () => {
    const source = generateJetpackComposeComponentSource(irFor("RadioGroup"));
    const tokens = generateJetpackComposeTokensFile(irFor("RadioGroup"));
    const reads = [...source.matchAll(/TokenScopes\["([^"]+)"\]\?\.get\("([^"]+)"\)/g)];
    for (const [, scope, slot] of reads) {
      const block = tokens.split(`"${scope}" to mapOf(`)[1]?.split("\n    ),")[0] ?? "";
      expect(block, `${scope}: ${slot}`).toContain(`"${slot}" to ComponentTokenDefinition(`);
    }
  });
});

describe("generateJetpackComposeComponentSource — array-iterated list class (FEAT-COMPOSE-SHUTTLE-ADMISSION-01)", () => {
  it("lowers the array channel onto removable rows (Shuttle)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Shuttle"));
    expect(src).toContain("value: List<String>? = null,");
    expect(src).toContain("defaultValue: List<String> = emptyList(),");
    expect(src).toContain("val resolvedValue = value ?: uncontrolledValue");
    expect(src).toContain("resolvedValue.forEach { item ->");
    expect(src).toContain("val next = resolvedValue.filter { it != item }");
    // The change-handler prop name comes from the contract channel.
    expect(src).toMatch(/\?\.invoke\(next\)/);
    expect(src).toContain('layeredSlot("shuttle.color.background.default")');
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src.match(/fun Shuttle\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });
});

describe("generateJetpackComposeComponentSource — interactive-composite class (FEAT-COMPOSE-INTERACTIVE-COMPOSITE-01)", () => {
  it("lowers the union openness channel to a compound context (Accordion)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Accordion"));
    expect(src).toContain("class AccordionState(");
    expect(src).toContain("val value: List<String>,");
    expect(src).toContain("val onToggle: (String) -> Unit,");
    expect(src).toContain("val LocalAccordionState = compositionLocalOf<AccordionState?> { null }");
    expect(src).toContain("value: List<String>? = null,");
    expect(src).toContain("fun AccordionTrigger(");
    expect(src).toContain("fun AccordionContent(");
    expect(src).toContain("state.value.contains(key)");
    expect(src).toContain('error("AccordionTrigger must be used inside Accordion")');
    expect(src).not.toMatch(/import androidx\.compose\.material/);
  });

  it("lowers the scalar activeTab channel to a compound context (Tabs)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Tabs"));
    expect(src).toContain("class TabsState(");
    expect(src).toContain("val value: String,");
    expect(src).toContain("val onSelect: (String) -> Unit,");
    expect(src).toContain("value: String? = null,");
    expect(src).toContain("fun TabsTab(");
    expect(src).toContain("fun TabsPanel(");
    expect(src).toContain("state.value == key");
    expect(src).not.toMatch(/import androidx\.compose\.material/);
  });
});

describe("generateJetpackComposeComponentSource — count-iterated field group (FEAT-COMPOSE-OTP-ADMISSION-01)", () => {
  it("distributes the string channel over length per-slot fields (OTP)", () => {
    const src = generateJetpackComposeComponentSource(irFor("OTP"));
    expect(src).toContain("value: String? = null,");
    expect(src).toContain("defaultValue: String = \"\",");
    expect(src).toContain("length: Int = 6,");
    expect(src).toContain("val resolvedValue = value ?: uncontrolledValue");
    expect(src).toContain("repeat(length) { index ->");
    expect(src).toContain("BasicTextField(");
    expect(src).toContain("resolvedValue.padEnd(length, ' ').toCharArray()");
    expect(src).toContain('layeredSlot("otp.color.background.default")');
    expect(src).toContain('layeredSlot("otp.size.radius.default")');
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src.match(/fun OTP\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });
});

describe("generateJetpackComposeComponentSource — labeled text control (FEAT-COMPOSE-TEXTFIELD-ADMISSION-01)", () => {
  it("wraps the string channel with label/description/error regions (TextField)", () => {
    const src = generateJetpackComposeComponentSource(irFor("TextField"));
    expect(src).toContain("value: String? = null,");
    expect(src).toContain("defaultValue: String = \"\",");
    expect(src).toContain("label: (@Composable () -> Unit)? = null,");
    expect(src).toContain("error: (@Composable () -> Unit)? = null,");
    expect(src).toContain("invalid: Boolean = false,");
    expect(src).toContain("BasicTextField(");
    expect(src).toContain('layeredSlot("text-field.border.radius")');
    expect(src).toContain("if (invalid) region()");
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src.match(/fun TextField\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });
});

describe("generateJetpackComposeComponentSource — selection control (FEAT-COMPOSE-SELECT-ADMISSION-01)", () => {
  it("lowers the union selection channel onto a Popup option list (Select)", () => {
    const src = generateJetpackComposeComponentSource(irFor("Select"));
    expect(src).toContain("data class SelectOption(");
    expect(src).toContain("options: List<SelectOption> = emptyList(),");
    expect(src).toContain("value: String? = null,");
    expect(src).toContain("multiple: Boolean = false,");
    expect(src).toContain("values: List<String>? = null,");
    expect(src).toContain("open: Boolean? = null,");
    expect(src).toContain("Popup(onDismissRequest = {");
    expect(src).toContain("role = Role.RadioButton,");
    expect(src).toContain('layeredSlot("select.color.background.default")');
    expect(src).toContain('layeredSlot("select.size.radius.default")');
    expect(src).not.toMatch(/import androidx\.compose\.material/);
    expect(src.match(/fun Select\(([^)]*)\)/)![1]!.trim().startsWith("modifier: Modifier = Modifier,")).toBe(true);
  });
});
