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

/**
 * Kotlin parameter-name escape: hard keywords are backtick-quoted
 * (`` `as` ``), so a contract axis named `as`/`in`/`is` can still lower to
 * a composable parameter.
 */
function kotlinParamName(name: string): string {
  return KOTLIN_HARD_KEYWORDS.has(name) ? `\`${name}\`` : name;
}

function pascalCase(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Kotlin enum-entry identifier: pascalCase plus a digit-leading guard —
 * "2xl" must not emit as an enum member (identifier starting with a digit
 * is a syntax error). Prefixes "N" so TextSize.2xl -> TextSize.N2xl.
 */
function kotlinEnumName(value: string): string {
  const pascal = pascalCase(value);
  return /^[0-9]/.test(pascal) ? `N${pascal}` : pascal;
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
 * Chrome-role slot lookup with a corpus-derived suffix grammar. The corpus
 * names chrome slots with a per-component prefix plus a role suffix that
 * varies by family (passive roots use `.color.foreground.primary`, interactive
 * use `.color.foreground.default`; radius appears as `.size.radius`,
 * `.border.radius`, `.radius.default`, …). This mirrors the RN emitter's
 * suffix-list selection (`tokenStringByName`/`tokenNumberByName`) so both
 * families resolve the SAME slot for a role — the usage-parity ratchet in
 * scripts/compose-parity-diff.mjs asserts the consumed keys agree. Returns the
 * first role slot found; `undefined` when the component carries no slot for
 * the role, and the emitter then omits the resolution entirely (no dead
 * lookups).
 */
function findLayeredSlotAny(
  ir: ComponentIR,
  layers: string[],
  suffixes: readonly string[],
) {
  for (const layer of [...layers].reverse()) {
    const scope = ir.tokenScopes.find((s) => s.scope === layer);
    if (!scope) continue;
    for (const suffix of suffixes) {
      const hit = scope.values.find((value) => value.name.endsWith(suffix));
      if (hit) return { scopeKey: layer, name: hit.name };
    }
  }
  return undefined;
}

/** Corpus chrome-role suffix grammar, mirroring the RN emitter's lists. */
const CHROME_ROLE_SUFFIXES = {
  background: [".color.background.default", ".color.bg.default", ".color.bg"],
  foreground: [".color.foreground.default", ".color.foreground.primary"],
  radius: [".border.radius", ".size.radius", ".radius.default", ".radius"],
} as const;

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

  const containerSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.background);
  const hoverSlot = findLayeredSlot(ir, ["root"], "color.background.hover");
  const activeSlot = findLayeredSlot(ir, ["root"], "color.background.active");
  const disabledBgSlot = findLayeredSlot(ir, ["root"], "color.background.disabled");
  const fgSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.foreground);
  const fgDisabledSlot = findLayeredSlot(ir, ["root"], "color.foreground.disabled");
  const borderSlot = findLayeredSlot(ir, ["root"], "color.border.default");
  const focusSlot = findLayeredSlot(ir, ["root"], "color.border.focus");
  const radiusSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.radius);
  const borderWidthSlot = findLayeredSlot(ir, ["root"], "size.border");
  const durationSlot = findLayeredSlot(ir, ["root"], "motion.duration.fast");
  const minHeightSlot = findLayeredSlot(ir, ["root"], "size.minHeight.medium");
  const minWidthSlot = findLayeredSlot(ir, ["root"], "box-model.min-width");
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
    lines.push(`enum class ${size.enumName} { ${size.values.map(kotlinEnumName).join(", ")} }`);
    lines.push(``);
  }
  if (intent) {
    lines.push(`/** Intent axis lowered from the contract's ${intent.propName} variant. */`);
    lines.push(`enum class ${intent.enumName} { ${intent.values.map(kotlinEnumName).join(", ")} }`);
    lines.push(``);
  }
  lines.push(`@Composable`);
  lines.push(`fun ${name}(`);
  // AOSP Compose API guideline: `modifier` is the first optional parameter.
  lines.push(`    modifier: Modifier = Modifier,`);
  if (size) {
    lines.push(`    ${size.propName}: ${size.enumName} = ${size.enumName}.${kotlinEnumName(size.defaultExpr)},`);
  }
  if (intent) {
    lines.push(`    ${intent.propName}: ${intent.enumName} = ${intent.enumName}.${kotlinEnumName(intent.defaultExpr)},`);
  }
  if (hasDisabled) lines.push(`    disabled: Boolean = false,`);
  if (hasLoading) lines.push(`    loading: Boolean = false,`);
  if (hasAriaLabel) lines.push(`    accessibilityLabel: String? = null,`);
  lines.push(`    ${onClickProp}: (() -> Unit)? = null,`);
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
  // Dimension slots resolve through the theme when the component carries
  // them; absent roles fall back to the ledgered constant with NO dead lookup.
  const dimVal = (valName: string, s: { name: string } | undefined, fallback: string) => {
    if (s) {
      lines.push(
        `    val ${valName} = layeredSlot(${JSON.stringify(s.name)})?.toFsdsDp() ?: ${fallback}`,
      );
    } else {
      lines.push(`    val ${valName} = ${fallback}`);
    }
  };
  dimVal("cornerRadius", radiusSlot, "4.dp");
  dimVal("borderWidth", borderWidthSlot, "1.dp");
  if (durationSlot) {
    lines.push(
      `    val pressDurationMs = layeredSlot(${JSON.stringify(durationSlot.name)})?.toFsdsMs() ?: 100`,
    );
  }
  dimVal("minHeight", minHeightSlot, "32.dp");
  dimVal("minWidth", minWidthSlot, "32.dp");
  dimVal("paddingInline", paddingInlineSlot, "8.dp");
  dimVal("paddingBlock", paddingBlockSlot, "4.dp");
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

/**
 * The static-content class: a passive non-container root (label,
 * blockquote, p, …) whose entire dom is one projected children region —
 * no channels, no surface. Mirror of the swift static-content gate: same
 * shared IR shape facts, no component-name lore.
 */
function isStaticContent(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  if (ir.dom.tag === "button" || ir.dom.tag === "input") return false;
  let childrenLeaves = 0;
  let hasInstance = false;
  const walk = (node: NonNullable<ComponentIR["dom"]>): void => {
    if ((node as { componentRef?: string }).componentRef) hasInstance = true;
    const kids = node.children ?? [];
    if (node.tag === "children" && kids.length === 0) childrenLeaves += 1;
    kids.forEach(walk);
  };
  walk(ir.dom);
  if (hasInstance) return false;
  if (ir.dom.tag === "img") return false;
  if (childrenLeaves === 1) return true;
  // Decorative box: no children leaf at all, no content binding — a pure
  // chrome surface (Skeleton).
  if (childrenLeaves === 0 && !ir.dom.content && (ir.dom.children ?? []).length === 0) {
    return true;
  }
  return false;
}

/**
 * Static-content composable: a passive root whose content is the consumer's
 * composable lambda, with chrome (padding/background/radius/foreground)
 * resolved from the component's token scopes through the theme. Variant
 * axes lower to enums; layered resolution prefers the active variant scope
 * over root — the same ordering the projected-children path uses.
 */
function emitStaticContent(ir: ComponentIR): string {
  const name = ir.name;
  const segment = packageSegment(name);
  const axes = Object.keys(ir.variants ?? {}).map((axis) => {
    const values = ir.variants[axis] ?? [];
    const prop = ir.styledProps.find((p) => p.safeName === axis);
    const defaultExpr =
      prop?.defaultExpr?.replace(/^["']|["']$/g, "") ?? values[0];
    return {
      propName: prop?.safeName ?? axis,
      enumName: `${name}${pascalCase(axis)}`,
      values,
      defaultExpr,
    };
  });
  const variantKeysKt = axes
    .map((a) => `"variant_" + ${kotlinParamName(a.propName)}.name.lowercase()`)
    .join(", ");

  // Chrome roles resolve through the corpus suffix grammar; a role slot that
  // the component does not carry is OMITTED entirely — never a dead
  // `layeredSlot("")` lookup (A1).
  const bgSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.background);
  const fgSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.foreground);
  const radiusSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.radius);
  const paddingInlineStartSlot = findLayeredSlot(ir, ["root"], "box-model.padding-inline-start");
  const paddingInlineEndSlot = findLayeredSlot(ir, ["root"], "box-model.padding-inline-end");
  const paddingBlockStartSlot = findLayeredSlot(ir, ["root"], "box-model.padding-block-start");
  const paddingBlockEndSlot = findLayeredSlot(ir, ["root"], "box-model.padding-block-end");
  const minHeightSlot = findLayeredSlot(ir, ["root"], "box-model.min-height");
  const usesTheme = ir.tokenScopes.length > 0;
  const usesColors = Boolean(bgSlot || fgSlot);
  const anyPaddingSlot = Boolean(
    paddingInlineStartSlot || paddingInlineEndSlot || paddingBlockStartSlot || paddingBlockEndSlot,
  );
  const usesDims = Boolean(radiusSlot || anyPaddingSlot || minHeightSlot);
  const needsClip = Boolean(bgSlot || radiusSlot);

  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${name}/${name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${segment}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  if (usesColors) lines.push(`import androidx.compose.foundation.background`);
  lines.push(`import androidx.compose.foundation.layout.Box`);
  if (minHeightSlot) lines.push(`import androidx.compose.foundation.layout.height`);
  if (anyPaddingSlot) {
    lines.push(`import androidx.compose.foundation.layout.padding`);
  }
  if (needsClip) lines.push(`import androidx.compose.foundation.shape.RoundedCornerShape`);
  lines.push(`import androidx.compose.runtime.Composable`);
  if (fgSlot) {
    lines.push(`import androidx.compose.runtime.CompositionLocalProvider`);
  }
  lines.push(`import androidx.compose.ui.Modifier`);
  if (needsClip) lines.push(`import androidx.compose.ui.draw.clip`);
  if (usesColors) lines.push(`import androidx.compose.ui.graphics.Color`);
  if (usesDims) lines.push(`import androidx.compose.ui.unit.dp`);
  if (usesTheme) {
    lines.push(`import com.fullstackds.tokens.LocalFsdsTheme`);
    if (usesColors) lines.push(`import com.fullstackds.tokens.toFsdsColor`);
    if (usesDims) lines.push(`import com.fullstackds.tokens.toFsdsDp`);
  }
  if (fgSlot) lines.push(`import com.fullstackds.tokens.LocalFsdsContentColor`);
  lines.push(`// @generated:end`);
  lines.push(``);
  lines.push(`// @generated:start component`);
  for (const axis of axes) {
    lines.push(
      `/** ${axis.propName} axis lowered from the contract's ${axis.propName} variant. */`,
    );
    lines.push(
      `enum class ${axis.enumName} { ${axis.values.map(kotlinEnumName).join(", ")} }`,
    );
    lines.push(``);
  }
  lines.push(`@Composable`);
  lines.push(`fun ${name}(`);
  // AOSP Compose API guideline: `modifier` is the first optional parameter.
  lines.push(`    modifier: Modifier = Modifier,`);
  for (const axis of axes) {
    lines.push(
      `    ${kotlinParamName(axis.propName)}: ${axis.enumName} = ${axis.enumName}.${kotlinEnumName(axis.defaultExpr)},`,
    );
  }
  lines.push(`    content: @Composable () -> Unit,`);
  lines.push(`) {`);
  if (usesTheme) {
    lines.push(`    val fsdsTheme = LocalFsdsTheme.current`);
    lines.push(`    fun layeredSlot(slotName: String): String? {`);
    lines.push(
      `        for (key in listOf(${[variantKeysKt, `"root"`].filter(Boolean).join(", ")})) {`,
    );
    lines.push(`            val def = ${tokenConstName(ir)}[key]?.get(slotName)`);
    lines.push(`            if (def != null) return fsdsTheme.resolve(def)`);
    lines.push(`        }`);
    lines.push(`        return null`);
    lines.push(`    }`);
    if (bgSlot) {
      lines.push(
        `    val containerColor = layeredSlot(${JSON.stringify(bgSlot.name)})?.toFsdsColor()`,
      );
    }
    if (fgSlot) {
      lines.push(
        `    val contentColor = layeredSlot(${JSON.stringify(fgSlot.name)})?.toFsdsColor()`,
      );
    }
    if (radiusSlot) {
      lines.push(
        `    val cornerRadius = layeredSlot(${JSON.stringify(radiusSlot.name)})?.toFsdsDp() ?: 0.dp`,
      );
    }
    // Four-sided padding resolves each side slot the component carries;
    // absent sides default to 0.dp (RN mirrors the same per-side access).
    const sideVal = (valName: string, slot: { name: string } | undefined) => {
      if (slot) {
        lines.push(
          `    val ${valName} = layeredSlot(${JSON.stringify(slot.name)})?.toFsdsDp() ?: 0.dp`,
        );
        return valName;
      }
      return "0.dp";
    };
    const paddingInlineStart = sideVal("paddingInlineStart", paddingInlineStartSlot);
    const paddingInlineEnd = sideVal("paddingInlineEnd", paddingInlineEndSlot);
    const paddingBlockStart = sideVal("paddingBlockStart", paddingBlockStartSlot);
    const paddingBlockEnd = sideVal("paddingBlockEnd", paddingBlockEndSlot);
    if (minHeightSlot) {
      lines.push(
        `    val minHeight = layeredSlot(${JSON.stringify(minHeightSlot.name)})?.toFsdsDp()`,
      );
    }
    lines.push(``);
    const chromeLines: string[] = [`    val chromeModifier = Modifier`];
    if (needsClip) {
      lines.push(`    val shape = RoundedCornerShape(cornerRadius)`);
      chromeLines.push(`        .clip(shape)`);
    }
    if (bgSlot) {
      chromeLines.push(
        `        .then(if (containerColor != null) Modifier.background(containerColor, shape) else Modifier)`,
      );
    }
    if (anyPaddingSlot) {
      chromeLines.push(
        `        .padding(start = ${paddingInlineStart}, end = ${paddingInlineEnd}, top = ${paddingBlockStart}, bottom = ${paddingBlockEnd})`,
      );
    }
    if (minHeightSlot) {
      chromeLines.push(
        `        .then(if (minHeight != null) Modifier.height(minHeight) else Modifier)`,
      );
    }
    lines.push(...chromeLines);
    lines.push(``);
    const box = `Box(modifier.then(chromeModifier)) { content() }`;
    if (fgSlot) {
      // Content-color propagation (A3): the resolved foreground is provided to
      // the content lambda through a foundation-only CompositionLocal, the
      // Compose analog of swift's foregroundStyle / RN's color on the element.
      lines.push(
        `    CompositionLocalProvider(LocalFsdsContentColor provides (contentColor ?: Color.Unspecified)) {`,
      );
      lines.push(`        ${box}`);
      lines.push(`    }`);
    } else {
      lines.push(`    ${box}`);
    }
  } else {
    lines.push(`    Box(modifier) { content() }`);
  }
  lines.push(`}`);
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
  if (isStaticContent(ir)) {
    return emitStaticContent(ir);
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
      `enum class ${sizeEnumName} { ${sizeValues.map(kotlinEnumName).join(", ")} }`,
    );
    lines.push(``);
  }
  lines.push(`@Composable`);
  lines.push(`fun ${name}(`);
  // AOSP Compose API guideline: `modifier` is the first optional parameter.
  lines.push(`    modifier: Modifier = Modifier,`);
  lines.push(`    ${valueProp}: Boolean? = null,`);
  lines.push(`    ${defaultValueProp}: Boolean = false,`);
  lines.push(`    ${changeProp}: ((Boolean) -> Unit)? = null,`);
  if (sizeEnumName && sizeDefault) {
    lines.push(
      `    size: ${sizeEnumName} = ${sizeEnumName}.${kotlinEnumName(sizeDefault)},`,
    );
  }
  if (hasDisabled) {
    lines.push(`    enabled: Boolean = true,`);
  }
  for (const prop of stringProps) {
    lines.push(`    ${prop.safeName}: String? = null,`);
  }
  lines.push(`    contentDescription: String? = null,`);
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
          `        ${sizeEnumName}.${kotlinEnumName(value)} -> (fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(mdWidthSlot.name)}))?.toFsdsDp() ?: ${w}.dp) to (fsdsTheme.resolve(${tokenConstName(ir)}["root"]?.get(${JSON.stringify(mdHeightSlot.name)}))?.toFsdsDp() ?: ${h}.dp)`,
        );
        continue;
      }
      lines.push(
        `        ${sizeEnumName}.${kotlinEnumName(value)} -> ${w}.dp to ${h}.dp`,
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
