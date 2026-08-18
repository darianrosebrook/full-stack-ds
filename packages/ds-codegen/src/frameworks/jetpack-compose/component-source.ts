/**
 * Jetpack Compose composable emission.
 *
 * Implemented path: native-collapse (native-toggle-affordance) — the Compose
 * twin of the SwiftUI collapse class. A contract whose multi-part anatomy
 * collapses to a native on/off control (Switch, ToggleSwitch) emits a single
 * `@Composable fun` wrapping Material 3's `Switch` with the contract's
 * controlled/uncontrolled channel hoisting and the IR's normalized semantics
 * (role, toggleableState, stateDescription). Every other collapse class and
 * shape throws an explicit not-implemented error — corpus-wide generation
 * stays out of scope until their slices land.
 *
 * All facts derive from the ComponentIR: channel param names come from
 * `behavior.normalizedChannels[0]` (Switch's `onChange`, not a Material
 * idiom literal), the size axis from `styledProps` ∩ `definedTypes` with
 * enum values, boolean/string passthroughs from the remaining styled props.
 * The one framework-grammar table this slice owns: track dimensions per size
 * value (dp) — md is contract-token-shaped, sm/lg are annotated defaults
 * pending token-graph coverage (mirrored from the hand-authored golden
 * prototype, `__golden__/Switch/Switch.compose.kt`, with its line-67 `??`
 * defect corrected to the Kotlin elvis operator).
 */
import type { ComponentIR } from "../../ir.js";
import { collectCollapseIntents } from "../../ir.js";
// Cross-framework gate reuse (precedent: vue → react hook-source): the IR
// owns the projected-children action fact; swift's emitter is its steward.
import { isProjectedChildrenAction } from "../swift/swiftui/component-source.js";

/** Kotlin hard keywords that cannot appear as package-name segments. */
const KOTLIN_HARD_KEYWORDS = new Set([
  "as", "break", "class", "continue", "do", "else", "false", "for", "fun",
  "if", "in", "interface", "is", "null", "object", "package", "return",
  "super", "this", "throw", "true", "try", "typealias", "typeof", "val",
  "var", "when", "while",
]);

function packageSegment(name: string): string {
  const segment = name.replace(/([a-z0-9])([A-Z])/g, "$1$2").toLowerCase();
  return KOTLIN_HARD_KEYWORDS.has(segment) ? `${segment}component` : segment;
}

function pascalCase(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Track dimensions per size value (width x height, dp). Framework grammar.
 * The corpus carries two size vocabularies (Switch: sm/md/lg;
 * ToggleSwitch: small/medium/large) — both map onto the same physical
 * ladder. md is contract-token-shaped; the rest are annotated defaults
 * pending token-graph coverage.
 */
const SIZE_TRACK_DP: Record<string, [number, number]> = {
  sm: [36, 18],
  md: [48, 24],
  lg: [60, 30],
  small: [36, 18],
  medium: [48, 24],
  large: [60, 30],
};

/** Find a slot by scope key and name suffix (corpus slot-name grammar —
 *  keyed by suffix, never by component name). */
function findTokenSlot(
  ir: ComponentIR,
  scopeName: string,
  suffix: string,
) {
  return ir.tokenScopes
    .find((scope) => scope.scope === scopeName)
    ?.values.find((value) => value.name.endsWith(suffix));
}

function tokenConstName(ir: ComponentIR): string {
  return `${ir.cssPrefix.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}TokenScopes`;
}

/**
 * Layered suffix lookup (FEAT-COMPOSE-BUTTON-ADMISSION-01): find the slot
 * whose name ends with `suffix`, searching the scope layers last-first so
 * later layers (variant_<intent>, variant_<size>) override root — the same
 * precedence as RN's StyleSheet arrays and swift's resolveFsdsLayeredTokens.
 */
function findLayeredSlot(ir: ComponentIR, layers: string[], suffix: string) {
  for (const layer of [...layers].reverse()) {
    const hit = ir.tokenScopes
      .find((scope) => scope.scope === layer)
      ?.values.find((value) => value.name.endsWith(suffix));
    if (hit) return { scopeKey: layer, name: hit.name };
  }
  return undefined;
}

/**
 * The projected-children action class: a native button root whose entire
 * content is the consumer's projected children (Button is the corpus
 * consumer). Lowers onto the hand-authored foundation-only FsdsButton
 * substrate, with the style resolved from layered scopes through
 * LocalFsdsTheme — never Material, per the owned-substrate doctrine.
 */
function emitProjectedChildrenAction(ir: ComponentIR): string {
  const name = ir.name;
  const segment = packageSegment(name);

  // Variant axes: enum per axis from ir.variants, defaults from the
  // same-named designed prop's defaultExpr.
  const axisFor = (axis: string) => {
    const values = ir.variants[axis] ?? [];
    const prop = ir.styledProps.find((p) => p.safeName === axis);
    const defaultExpr = prop?.defaultExpr?.replace(/^["']|["']$/g, "") ?? values[0];
    return { enumName: `${name}${pascalCase(axis)}`, values, defaultExpr, propName: prop?.safeName ?? axis };
  };

  const intentAxis = Object.keys(ir.variants).find((axis) => axis !== "size");
  const sizeAxis = Object.keys(ir.variants).find((axis) => axis === "size");

  const prop = (propName: string) => ir.styledProps.find((p) => p.safeName === propName);
  const hasDisabled = prop("disabled") !== undefined;
  const hasLoading = prop("loading") !== undefined;
  const hasAriaLabel = prop("ariaLabel") !== undefined;
  const onClickProp = prop("onClick")?.safeName ?? "onClick";

  const size = sizeAxis ? axisFor(sizeAxis) : undefined;
  const intent = intentAxis ? axisFor(intentAxis) : undefined;

  const layerKeysKt = [
    ...(intent ? [`"variant_" + ${intent.propName}.name.lowercase()`] : []),
    ...(size ? [`"variant_" + ${size.propName}.name.lowercase()`] : []),
    `"root"`,
  ].join(", ");

  const containerSlot = findLayeredSlot(ir, ["root"], "color.background.default");
  const hoverSlot = findLayeredSlot(ir, ["root"], "color.background.hover");
  const activeSlot = findLayeredSlot(ir, ["root"], "color.background.active");
  const disabledBgSlot = findLayeredSlot(ir, ["root"], "color.background.disabled");
  const fgSlot = findLayeredSlot(ir, ["root"], "color.foreground.default");
  const fgDisabledSlot = findLayeredSlot(ir, ["root"], "color.foreground.disabled");
  const borderSlot = findLayeredSlot(ir, ["root"], "color.border.default");
  const focusSlot = findLayeredSlot(ir, ["root"], "color.border.focus");
  const radiusSlot = findLayeredSlot(ir, ["root"], "size.radius");
  const borderWidthSlot = findLayeredSlot(ir, ["root"], "size.border");
  const durationSlot = findLayeredSlot(ir, ["root"], "motion.duration.fast");
  const minHeightSlot = findLayeredSlot(ir, ["root"], "size.minHeight.medium");
  const paddingInlineSlot = findLayeredSlot(ir, ["root"], "size.padding-inline.medium");
  const paddingBlockSlot = findLayeredSlot(ir, ["root"], "size.padding-block.medium");

  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${name}/${name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${segment}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  lines.push(`import androidx.compose.foundation.layout.PaddingValues`);
  lines.push(`import androidx.compose.runtime.Composable`);
  lines.push(`import androidx.compose.ui.Modifier`);
  lines.push(`import androidx.compose.ui.graphics.Color`);
  lines.push(`import androidx.compose.ui.unit.dp`);
  lines.push(`import com.fullstackds.components.button.FsdsButton`);
  lines.push(`import com.fullstackds.components.button.FsdsButtonScope`);
  lines.push(`import com.fullstackds.components.button.FsdsButtonStyle`);
  lines.push(`import com.fullstackds.tokens.LocalFsdsTheme`);
  lines.push(`import com.fullstackds.tokens.toFsdsColor`);
  lines.push(`import com.fullstackds.tokens.toFsdsDp`);
  lines.push(`import com.fullstackds.tokens.toFsdsMs`);
  lines.push(`// @generated:end`);
  lines.push(``);
  lines.push(`// @generated:start component`);
  if (size) {
    lines.push(`/** Size axis lowered from the contract's ${size.propName} variant. */`);
    lines.push(`enum class ${size.enumName} { ${size.values.map(pascalCase).join(", ")} }`);
    lines.push(``);
  }
  if (intent) {
    lines.push(`/** Intent axis lowered from the contract's ${intent.propName} variant. */`);
    lines.push(`enum class ${intent.enumName} { ${intent.values.map(pascalCase).join(", ")} }`);
    lines.push(``);
  }
  lines.push(`@Composable`);
  lines.push(`fun ${name}(`);
  if (size) {
    lines.push(`    ${size.propName}: ${size.enumName} = ${size.enumName}.${pascalCase(size.defaultExpr)},`);
  }
  if (intent) {
    lines.push(`    ${intent.propName}: ${intent.enumName} = ${intent.enumName}.${pascalCase(intent.defaultExpr)},`);
  }
  if (hasDisabled) lines.push(`    disabled: Boolean = false,`);
  if (hasLoading) lines.push(`    loading: Boolean = false,`);
  if (hasAriaLabel) lines.push(`    accessibilityLabel: String? = null,`);
  lines.push(`    ${onClickProp}: (() -> Unit)? = null,`);
  lines.push(`    modifier: Modifier = Modifier,`);
  lines.push(`    content: @Composable FsdsButtonScope.() -> Unit,`);
  lines.push(`) {`);
  lines.push(`    val fsdsTheme = LocalFsdsTheme.current`);
  // Layered resolution: later layers override earlier per slot.
  lines.push(`    fun layeredSlot(slotName: String): String? {`);
  lines.push(`        for (key in listOf(${layerKeysKt})) {`);
  lines.push(`            val def = ${tokenConstName(ir)}[key]?.get(slotName)`);
  lines.push(`            if (def != null) return fsdsTheme.resolve(def)`);
  lines.push(`        }`);
  lines.push(`        return null`);
  lines.push(`    }`);
  const colorVal = (valName: string, s: { name: string } | undefined) => {
    if (s) {
      lines.push(`    val ${valName} = layeredSlot(${JSON.stringify(s.name)})?.toFsdsColor()`);
    } else {
      lines.push(`    val ${valName}: Color? = null`);
    }
  };
  colorVal("containerColor", containerSlot);
  colorVal("containerHoverColor", hoverSlot);
  colorVal("containerActiveColor", activeSlot);
  colorVal("containerDisabledColor", disabledBgSlot);
  colorVal("contentColor", fgSlot);
  colorVal("contentDisabledColor", fgDisabledSlot);
  colorVal("borderColor", borderSlot);
  colorVal("focusRingColor", focusSlot);
  lines.push(
    `    val cornerRadius = layeredSlot(${JSON.stringify(radiusSlot?.name ?? "")})?.toFsdsDp() ?: 4.dp`,
  );
  lines.push(
    `    val borderWidth = layeredSlot(${JSON.stringify(borderWidthSlot?.name ?? "")})?.toFsdsDp() ?: 1.dp`,
  );
  if (durationSlot) {
    lines.push(
      `    val pressDurationMs = layeredSlot(${JSON.stringify(durationSlot.name)})?.toFsdsMs() ?: 100`,
    );
  }
  lines.push(
    `    val minHeight = layeredSlot(${JSON.stringify(minHeightSlot?.name ?? "")})?.toFsdsDp() ?: 32.dp`,
  );
  lines.push(
    `    val minWidth = layeredSlot(${JSON.stringify(findLayeredSlot(ir, ["root"], "box-model.min-width")?.name ?? "")})?.toFsdsDp() ?: 32.dp`,
  );
  lines.push(
    `    val paddingInline = layeredSlot(${JSON.stringify(paddingInlineSlot?.name ?? "")})?.toFsdsDp() ?: 8.dp`,
  );
  lines.push(
    `    val paddingBlock = layeredSlot(${JSON.stringify(paddingBlockSlot?.name ?? "")})?.toFsdsDp() ?: 4.dp`,
  );
  lines.push(``);
  lines.push(`    val buttonStyle = FsdsButtonStyle(`);
  lines.push(`        containerColor = containerColor,`);
  lines.push(`        containerColorHover = containerHoverColor,`);
  lines.push(`        containerColorActive = containerActiveColor,`);
  lines.push(`        containerColorDisabled = containerDisabledColor,`);
  lines.push(`        contentColor = contentColor,`);
  lines.push(`        contentColorDisabled = contentDisabledColor,`);
  lines.push(`        borderColor = borderColor,`);
  lines.push(`        borderWidth = borderWidth,`);
  lines.push(`        cornerRadius = cornerRadius,`);
  lines.push(`        focusRingColor = focusRingColor,`);
  if (durationSlot) {
    lines.push(`        pressDurationMs = pressDurationMs,`);
  }
  lines.push(`        minHeight = minHeight,`);
  lines.push(`        minWidth = minWidth,`);
  lines.push(`        padding = PaddingValues(horizontal = paddingInline, vertical = paddingBlock),`);
  lines.push(`    )`);
  lines.push(``);
  lines.push(`    FsdsButton(`);
  lines.push(`        onClick = ${onClickProp},`);
  lines.push(`        style = buttonStyle,`);
  lines.push(`        modifier = modifier,`);
  lines.push(
    `        enabled = ${hasDisabled ? "!disabled" : "true"}${hasLoading ? " && !loading" : ""},`,
  );
  lines.push(
    `        contentDescription = ${hasAriaLabel ? "accessibilityLabel" : "null"},`,
  );
  lines.push(`        content = content,`);
  lines.push(`    )`);
  lines.push(`}`);
  lines.push(`// @generated:end`);
  lines.push(``);
  return lines.join("\n");
}

/**
 * The per-component token-scope data file — the Kotlin mirror of the RN
 * `<Name>.tokens.ts` emission. Every scope and slot from `ir.tokenScopes`
 * ships verbatim as data (name/cssVar/ref/literal/fallback as raw strings;
 * the FsdsTheme runtime parses and resolves).
 */
export function generateJetpackComposeTokensFile(ir: ComponentIR): string {
  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${ir.name}/${ir.name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${packageSegment(ir.name)}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  lines.push(`import com.fullstackds.tokens.ComponentTokenDefinition`);
  lines.push(`import com.fullstackds.tokens.ComponentTokenScopes`);
  lines.push(`// @generated:end`);
  lines.push(``);
  lines.push(`// @generated:start component`);
  lines.push(`val ${tokenConstName(ir)}: ComponentTokenScopes = mapOf(`);
  for (const scope of ir.tokenScopes) {
    if (scope.values.length === 0) continue;
    lines.push(`    ${JSON.stringify(scope.scope)} to mapOf(`);
    for (const value of scope.values) {
      lines.push(`        ${JSON.stringify(value.name)} to ComponentTokenDefinition(`);
      lines.push(`            name = ${JSON.stringify(value.name)},`);
      lines.push(`            cssVar = ${JSON.stringify(value.cssVar)},`);
      if (value.resolvesTo) {
        lines.push(`            ref = ${JSON.stringify(value.resolvesTo)},`);
      }
      if (value.rawValue !== undefined) {
        lines.push(
          `            ${value.isLiteral ? "literal" : "fallback"} = ${JSON.stringify(value.rawValue)},`,
        );
      }
      lines.push(`        ),`);
    }
    lines.push(`    ),`);
  }
  lines.push(`)`);
  lines.push(`// @generated:end`);
  lines.push(``);
  return lines.join("\n");
}

export function generateJetpackComposeComponentSource(
  ir: ComponentIR,
): string {
  if (isProjectedChildrenAction(ir)) {
    return emitProjectedChildrenAction(ir);
  }
  const collapseIntents = collectCollapseIntents(ir);
  if (!collapseIntents.has("native-toggle-affordance")) {
    throw new Error(
      `generateJetpackComposeComponentSource: only the native-toggle collapse path is implemented for ${ir.name} — ` +
        `multi-part anatomy, surfaces, and other collapse classes throw by design until their slices land.`,
    );
  }
  const channel = ir.behavior.normalizedChannels[0];
  if (!channel || channel.valueType !== "boolean") {
    throw new Error(
      `generateJetpackComposeComponentSource: ${ir.name} declares native-toggle-affordance without a boolean value channel`,
    );
  }

  const name = ir.name;
  const segment = packageSegment(name);
  const valueProp = channel.valueProp;
  const defaultValueProp = channel.defaultValueProp ?? `${valueProp}Default`;
  const changeProp = channel.changeHandlerProp;

  // Size axis: a styled prop referencing a contract-defined enum type.
  const sizeProp = ir.styledProps.find((p) =>
    p.typeRefs.some((ref) => (ir.definedTypes[ref]?.values?.length ?? 0) > 0),
  );
  let sizeEnumName: string | null = null;
  let sizeValues: string[] = [];
  let sizeDefault: string | null = null;
  if (sizeProp) {
    const ref = sizeProp.typeRefs.find(
      (r) => (ir.definedTypes[r]?.values?.length ?? 0) > 0,
    )!;
    const def = ir.definedTypes[ref]!;
    sizeEnumName = ref;
    sizeValues = def.values!;
    const rawDefault = sizeProp.defaultExpr?.replace(/^"|"$/g, "") ?? null;
    sizeDefault = rawDefault;
    for (const value of sizeValues) {
      if (!SIZE_TRACK_DP[value]) {
        throw new Error(
          `generateJetpackComposeComponentSource: no track dimensions for size value "${value}" on ${name} — extend the framework-grammar table or the token graph`,
        );
      }
    }
  }

  const hasDisabled = ir.styledProps.some(
    (p) => p.name === "disabled" && p.propType.kind === "boolean",
  );
  const handled = new Set<string>([
    valueProp,
    defaultValueProp,
    changeProp,
    ...(sizeProp ? [sizeProp.safeName] : []),
    ...(hasDisabled ? ["disabled"] : []),
  ]);
  const stringProps = ir.styledProps.filter(
    (p) => p.propType.kind === "string" && !handled.has(p.name),
  );

  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${name}/${name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${segment}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  lines.push(`import androidx.compose.foundation.layout.PaddingValues`);
  lines.push(`import androidx.compose.runtime.Composable`);
  lines.push(`import androidx.compose.runtime.getValue`);
  lines.push(`import androidx.compose.runtime.mutableStateOf`);
  lines.push(`import androidx.compose.runtime.remember`);
  lines.push(`import androidx.compose.runtime.setValue`);
  lines.push(`import androidx.compose.ui.Modifier`);
  lines.push(`import androidx.compose.ui.graphics.Color`);
  lines.push(`import androidx.compose.ui.unit.dp`);
  lines.push(`import com.fullstackds.components.toggle.FsdsToggle`);
  lines.push(`import com.fullstackds.components.toggle.FsdsToggleStyle`);
  // Theme-runtime imports land only when the component consumes token slots.
  const checkedTrackSlot = findTokenSlot(
    ir,
    "checked",
    ".color.track.background.default",
  );
  const checkedThumbSlot = findTokenSlot(
    ir,
    "checked",
    ".color.thumb.background.default",
  );
  const rootTrackSlot = findTokenSlot(
    ir,
    "root",
    ".color.track.background.default",
  );
  const rootThumbSlot = findTokenSlot(
    ir,
    "root",
    ".color.thumb.background.default",
  );
  const disabledTrackSlot = findTokenSlot(
    ir,
    "disabled",
    ".color.track.background.default",
  );
  const disabledThumbSlot = findTokenSlot(
    ir,
    "disabled",
    ".color.thumb.background.default",
  );
  const trackBorderSlot = findTokenSlot(
    ir,
    "root",
    ".color.track.border.default",
  );
  const focusSlot = findTokenSlot(ir, "root", ".color.input-outline-focus");
  const pressDurationSlot = findTokenSlot(
    ir,
    "root",
    ".motion.interaction.press.duration",
  );
  const minWidthSlot = findTokenSlot(ir, "root", "box-model.min-width");
  const minHeightSlot = findTokenSlot(ir, "root", "box-model.min-height");
  const paddingInlineStartSlot = findTokenSlot(
    ir,
    "root",
    "box-model.padding-inline-start",
  );
  const paddingInlineEndSlot = findTokenSlot(
    ir,
    "root",
    "box-model.padding-inline-end",
  );
  const paddingBlockStartSlot = findTokenSlot(
    ir,
    "root",
    "box-model.padding-block-start",
  );
  const paddingBlockEndSlot = findTokenSlot(
    ir,
    "root",
    "box-model.padding-block-end",
  );
  const mdWidthSlot = findTokenSlot(ir, "root", ".size.md.track.width");
  const mdHeightSlot = findTokenSlot(ir, "root", ".size.md.track.height");
  const mdSizeValue = sizeDefault?.replace(/^"|"$/g, "") ?? null;
  const anyColorSlot =
    checkedTrackSlot || checkedThumbSlot || rootTrackSlot || rootThumbSlot ||
    disabledTrackSlot || disabledThumbSlot || trackBorderSlot || focusSlot;
  const anyDimSlot =
    mdWidthSlot || mdHeightSlot || minWidthSlot || minHeightSlot ||
    paddingInlineStartSlot || paddingInlineEndSlot || paddingBlockStartSlot ||
    paddingBlockEndSlot;
  const consumesTokens =
    Boolean(anyColorSlot) ||
    Boolean(anyDimSlot) ||
    Boolean(pressDurationSlot) ||
    ir.tokenScopes.some((scope) => scope.values.length > 0);
  if (consumesTokens) {
    lines.push(`import com.fullstackds.tokens.LocalFsdsTheme`);
    if (anyColorSlot) {
      lines.push(`import com.fullstackds.tokens.toFsdsColor`);
    }
    if (anyDimSlot) {
      lines.push(`import com.fullstackds.tokens.toFsdsDp`);
    }
    if (pressDurationSlot) {
      lines.push(`import com.fullstackds.tokens.toFsdsMs`);
    }
  }
  lines.push(`// @generated:end`);
  lines.push(``);
  lines.push(`// @generated:start component`);
  if (sizeEnumName && sizeValues.length > 0) {
    lines.push(
      `/** Size axis lowered from the contract's ${sizeEnumName} type. */`,
    );
    lines.push(
      `enum class ${sizeEnumName} { ${sizeValues.map(pascalCase).join(", ")} }`,
    );
    lines.push(``);
  }
  lines.push(`@Composable`);
  lines.push(`fun ${name}(`);
  lines.push(`    ${valueProp}: Boolean? = null,`);
  lines.push(`    ${defaultValueProp}: Boolean = false,`);
  lines.push(`    ${changeProp}: ((Boolean) -> Unit)? = null,`);
  if (sizeEnumName && sizeDefault) {
    lines.push(
      `    size: ${sizeEnumName} = ${sizeEnumName}.${pascalCase(sizeDefault)},`,
    );
  }
  if (hasDisabled) {
    lines.push(`    enabled: Boolean = true,`);
  }
  for (const prop of stringProps) {
    lines.push(`    ${prop.safeName}: String? = null,`);
  }
  lines.push(`    contentDescription: String? = null,`);
  lines.push(`    modifier: Modifier = Modifier,`);
  lines.push(`) {`);
  lines.push(
    `    var uncontrolled${pascalCase(valueProp)} by remember { mutableStateOf(${defaultValueProp}) }`,
  );
  lines.push(
    `    val resolved${pascalCase(valueProp)} = ${valueProp} ?: uncontrolled${pascalCase(valueProp)}`,
  );
  if (consumesTokens) {
    lines.push(`    val fsdsTheme = LocalFsdsTheme.current`);
    // Color vals always exist (nullable) so the style constructor stays
    // uniform; absent slots resolve to null and ledgered constants apply.
    const colorVal = (
      valName: string,
      slot: { name: string } | undefined,
      scopeKey: string,
    ) => {
      if (slot) {
        lines.push(
          `    val ${valName} = fsdsTheme.resolve(${tokenConstName(ir)}[${JSON.stringify(scopeKey)}]?.get(${JSON.stringify(slot.name)}))?.toFsdsColor()`,
        );
      } else {
        lines.push(`    val ${valName}: Color? = null`);
      }
    };
    colorVal("checkedTrackColor", checkedTrackSlot, "checked");
    colorVal("checkedThumbColor", checkedThumbSlot, "checked");
    colorVal("uncheckedTrackColor", rootTrackSlot, "root");
    colorVal("uncheckedThumbColor", rootThumbSlot, "root");
    colorVal("disabledTrackColor", disabledTrackSlot, "disabled");
    colorVal("disabledThumbColor", disabledThumbSlot, "disabled");
    colorVal("trackBorderColor", trackBorderSlot, "root");
    colorVal("focusRingColor", focusSlot, "root");
    if (pressDurationSlot) {
      lines.push(
        `    val pressDurationMs = fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(pressDurationSlot.name)}))?.toFsdsMs() ?: 100`,
      );
    }
    if (minWidthSlot) {
      lines.push(
        `    val minTouchWidth = fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(minWidthSlot.name)}))?.toFsdsDp() ?: 32.dp`,
      );
    }
    if (minHeightSlot) {
      lines.push(
        `    val minTouchHeight = fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(minHeightSlot.name)}))?.toFsdsDp() ?: 32.dp`,
      );
    }
    if (
      paddingInlineStartSlot ||
      paddingInlineEndSlot ||
      paddingBlockStartSlot ||
      paddingBlockEndSlot
    ) {
      const side = (slot: { name: string } | undefined) =>
        slot
          ? `fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(slot.name)}))?.toFsdsDp() ?: 0.dp`
          : `0.dp`;
      lines.push(
        `    val togglePadding = PaddingValues(start = ${side(paddingInlineStartSlot)}, end = ${side(paddingInlineEndSlot)}, top = ${side(paddingBlockStartSlot)}, bottom = ${side(paddingBlockEndSlot)})`,
      );
    }
    lines.push(``);
  }
  if (sizeEnumName) {
    lines.push(``);
    lines.push(`    val (trackWidth, trackHeight) = when (size) {`);
    for (const value of sizeValues) {
      const [w, h] = SIZE_TRACK_DP[value]!;
      // The default size resolves its dims through the token scopes when the
      // graph carries them; non-default sizes keep the framework-grammar
      // table (ledgered gap pending token-graph coverage).
      if (
        value === mdSizeValue &&
        mdWidthSlot &&
        mdHeightSlot
      ) {
        lines.push(
          `        ${sizeEnumName}.${pascalCase(value)} -> (fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(mdWidthSlot.name)}))?.toFsdsDp() ?: ${w}.dp) to (fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(mdHeightSlot.name)}))?.toFsdsDp() ?: ${h}.dp)`,
        );
        continue;
      }
      lines.push(
        `        ${sizeEnumName}.${pascalCase(value)} -> ${w}.dp to ${h}.dp`,
      );
    }
    lines.push(`    }`);
  }
  lines.push(``);
  // Custom-painted lowering (FEAT-COMPOSE-CUSTOM-PAINTED-001): the style is
  // resolved from scope data through the theme and handed to the foundation-
  // only substrate; dead-safe color constants mirror the slot fallbacks and
  // fire only when a slot is absent from the graph.
  lines.push(`    val toggleStyle = FsdsToggleStyle(`);
  if (sizeEnumName) {
    lines.push(`        trackWidth = trackWidth,`);
    lines.push(`        trackHeight = trackHeight,`);
  } else {
    const [w, h] = SIZE_TRACK_DP.md ?? [48, 24];
    lines.push(`        trackWidth = ${w}.dp,`);
    lines.push(`        trackHeight = ${h}.dp,`);
  }
  lines.push(
    `        trackColorChecked = checkedTrackColor ?: Color(0xFFD92D2E),`,
  );
  lines.push(
    `        trackColorUnchecked = uncheckedTrackColor ?: Color(0xFFB8B8B8),`,
  );
  lines.push(
    `        trackColorDisabled = disabledTrackColor ?: uncheckedTrackColor ?: Color(0xFFB8B8B8),`,
  );
  lines.push(
    `        thumbColorChecked = checkedThumbColor ?: Color(0xFFFFFFFF),`,
  );
  lines.push(
    `        thumbColorUnchecked = uncheckedThumbColor ?: Color(0xFFFFFFFF),`,
  );
  lines.push(
    `        thumbColorDisabled = disabledThumbColor ?: uncheckedThumbColor ?: Color(0xFFFFFFFF),`,
  );
  lines.push(`        trackBorderColor = trackBorderColor,`);
  lines.push(`        focusRingColor = focusRingColor,`);
  if (pressDurationSlot) {
    lines.push(`        pressDurationMs = pressDurationMs,`);
  }
  if (minWidthSlot) {
    lines.push(`        minTouchWidth = minTouchWidth,`);
  }
  if (minHeightSlot) {
    lines.push(`        minTouchHeight = minTouchHeight,`);
  }
  if (
    paddingInlineStartSlot ||
    paddingInlineEndSlot ||
    paddingBlockStartSlot ||
    paddingBlockEndSlot
  ) {
    lines.push(`        padding = togglePadding,`);
  }
  lines.push(`    )`);
  lines.push(``);
  lines.push(`    FsdsToggle(`);
  lines.push(`        checked = resolved${pascalCase(valueProp)},`);
  lines.push(`        onCheckedChange = { next ->`);
  lines.push(`            if (${valueProp} == null) {`);
  lines.push(
    `                uncontrolled${pascalCase(valueProp)} = next`,
  );
  lines.push(`            }`);
  lines.push(`            ${changeProp}?.invoke(next)`);
  lines.push(`        },`);
  lines.push(`        style = toggleStyle,`);
  if (hasDisabled) {
    lines.push(`        enabled = enabled,`);
  }
  lines.push(`        contentDescription = contentDescription,`);
  lines.push(`        modifier = modifier,`);
  lines.push(`    )`);
  lines.push(`}`);
  lines.push(`// @generated:end`);
  lines.push(``);
  return lines.join("\n");
}
