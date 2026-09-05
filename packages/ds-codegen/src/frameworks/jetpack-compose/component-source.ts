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
    if ((node as { componentRef?: string }).componentRef) {
      const role = ir.parts.find((part) => part.name === node.part)?.details?.role;
      // Compose has no emitted iconography target yet. A contract-authored
      // decoration may degrade while essential component refs remain a hard
      // stop; the native lane proves compilation, not visual parity.
      if (role !== "decoration") hasInstance = true;
    }
    const kids = node.children ?? [];
    if (node.tag === "children" && kids.length === 0) childrenLeaves += 1;
    kids.forEach(walk);
  };
  walk(ir.dom);
  if (hasInstance) return false;
  if (ir.dom.tag === "img") return false;
  if (childrenLeaves === 1) return true;
  // Decorative box: no consumer content leaf at all and no content binding —
  // a pure chrome surface (Skeleton). Purely internal decorative children do
  // not change that; see the twin comment in the swiftui emitter for why
  // requiring an empty child list here was a web-topology proxy.
  if (childrenLeaves === 0 && !ir.dom.content) {
    return true;
  }
  return false;
}

/** Chrome-role slots a passive root can realize, resolved through the corpus
 *  suffix grammar. Shared by the static-content, prop-text, expandable, and
 *  progress/status paths — one grammar, one place. */
interface StaticChromeSlots {
  bgSlot?: { name: string };
  fgSlot?: { name: string };
  radiusSlot?: { name: string };
  paddingInlineStartSlot?: { name: string };
  paddingInlineEndSlot?: { name: string };
  paddingBlockStartSlot?: { name: string };
  paddingBlockEndSlot?: { name: string };
  minHeightSlot?: { name: string };
  usesColors: boolean;
  anyPaddingSlot: boolean;
  usesDims: boolean;
  needsClip: boolean;
}

function resolveStaticChrome(ir: ComponentIR): StaticChromeSlots {
  const bgSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.background);
  const fgSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.foreground);
  const radiusSlot = findLayeredSlotAny(ir, ["root"], CHROME_ROLE_SUFFIXES.radius);
  const paddingInlineStartSlot = findLayeredSlot(ir, ["root"], "box-model.padding-inline-start");
  const paddingInlineEndSlot = findLayeredSlot(ir, ["root"], "box-model.padding-inline-end");
  const paddingBlockStartSlot = findLayeredSlot(ir, ["root"], "box-model.padding-block-start");
  const paddingBlockEndSlot = findLayeredSlot(ir, ["root"], "box-model.padding-block-end");
  const minHeightSlot = findLayeredSlot(ir, ["root"], "box-model.min-height");
  const usesColors = Boolean(bgSlot || fgSlot);
  const anyPaddingSlot = Boolean(
    paddingInlineStartSlot || paddingInlineEndSlot || paddingBlockStartSlot || paddingBlockEndSlot,
  );
  const usesDims = Boolean(radiusSlot || anyPaddingSlot || minHeightSlot);
  const needsClip = Boolean(bgSlot || radiusSlot);
  return {
    bgSlot,
    fgSlot,
    radiusSlot,
    paddingInlineStartSlot,
    paddingInlineEndSlot,
    paddingBlockStartSlot,
    paddingBlockEndSlot,
    minHeightSlot,
    usesColors,
    anyPaddingSlot,
    usesDims,
    needsClip,
  };
}

/** Emits the theme read + layeredSlot resolver (variant scopes then root). */
function emitThemeHeader(
  lines: string[],
  ir: ComponentIR,
  variantKeysKt: string,
): void {
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
}

/** Emits the chrome val resolutions (gated on slot existence) and returns the
 *  four padding side expressions (a slot val name, or "0.dp"). */
function emitChromeVals(
  lines: string[],
  slots: StaticChromeSlots,
): [string, string, string, string] {
  if (slots.bgSlot) {
    lines.push(
      `    val containerColor = layeredSlot(${JSON.stringify(slots.bgSlot.name)})?.toFsdsColor()`,
    );
  }
  if (slots.fgSlot) {
    lines.push(
      `    val contentColor = layeredSlot(${JSON.stringify(slots.fgSlot.name)})?.toFsdsColor()`,
    );
  }
  if (slots.radiusSlot) {
    lines.push(
      `    val cornerRadius = layeredSlot(${JSON.stringify(slots.radiusSlot.name)})?.toFsdsDp() ?: 0.dp`,
    );
  }
  const sideVal = (valName: string, slot: { name: string } | undefined): string => {
    if (slot) {
      lines.push(
        `    val ${valName} = layeredSlot(${JSON.stringify(slot.name)})?.toFsdsDp() ?: 0.dp`,
      );
      return valName;
    }
    return "0.dp";
  };
  const paddingInlineStart = sideVal("paddingInlineStart", slots.paddingInlineStartSlot);
  const paddingInlineEnd = sideVal("paddingInlineEnd", slots.paddingInlineEndSlot);
  const paddingBlockStart = sideVal("paddingBlockStart", slots.paddingBlockStartSlot);
  const paddingBlockEnd = sideVal("paddingBlockEnd", slots.paddingBlockEndSlot);
  if (slots.minHeightSlot) {
    lines.push(
      `    val minHeight = layeredSlot(${JSON.stringify(slots.minHeightSlot.name)})?.toFsdsDp()`,
    );
  }
  return [paddingInlineStart, paddingInlineEnd, paddingBlockStart, paddingBlockEnd];
}

/** Emits the chrome modifier chain (clip/background/padding/min-height).
 *  `sides` are the four padding side expressions from emitChromeVals. */
function emitChromeModifier(
  lines: string[],
  slots: StaticChromeSlots,
  sides: [string, string, string, string],
): void {
  const [paddingInlineStart, paddingInlineEnd, paddingBlockStart, paddingBlockEnd] = sides;
  const chromeLines: string[] = [`    val chromeModifier = Modifier`];
  if (slots.needsClip) {
    lines.push(`    val shape = RoundedCornerShape(cornerRadius)`);
    chromeLines.push(`        .clip(shape)`);
  }
  if (slots.bgSlot) {
    chromeLines.push(
      `        .then(if (containerColor != null) Modifier.background(containerColor, shape) else Modifier)`,
    );
  }
  if (slots.anyPaddingSlot) {
    chromeLines.push(
      `        .padding(start = ${paddingInlineStart}, end = ${paddingInlineEnd}, top = ${paddingBlockStart}, bottom = ${paddingBlockEnd})`,
    );
  }
  if (slots.minHeightSlot) {
    chromeLines.push(
      `        .then(if (minHeight != null) Modifier.height(minHeight) else Modifier)`,
    );
  }
  lines.push(...chromeLines);
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
  const slots = resolveStaticChrome(ir);
  const { fgSlot } = slots;
  const usesTheme = ir.tokenScopes.length > 0;

  // Typography-bearing content root: the scopes carry text-size slots
  // (`text.size.*`) — the same slot evidence the parity ratchet keys on, so
  // this generalizes to any content root without component-name lore.
  const isTypographyRoot = ir.tokenScopes.some((s) =>
    s.values.some((v) => v.name.includes("text.size.")),
  );
  // The typography weight axis: the variant axis whose values name the
  // corpus's `text.typography.fontWeight.<value>` slots.
  const weightAxis = axes.find((a) =>
    ir.tokenScopes.some((s) =>
      s.values.some((v) => v.name === `text.typography.fontWeight.${a.values[0]}`),
    ),
  );
  // A TextStyle is emitted only when both typography facts hold: text-size
  // slots exist AND a weight axis names the fontWeight slots.
  const emitsTextStyle = isTypographyRoot && weightAxis !== undefined;
  // Weight-value → slot-name vocabulary: normal lowers to the "regular" slot
  // and semibold to "medium" (the corpus slot vocabulary, mirrored from the
  // RN emitter's per-value entries).
  const WEIGHT_SLOT_SYNONYM: Record<string, string> = {
    normal: "regular",
    semibold: "medium",
  };
  // Element-tag union prop (`as`: p/span/div/h1-h6): a designed prop whose
  // defined-type union is entirely element tags. General over the union
  // values; heading semantics derive from h1-h6, never from names.
  const ELEMENT_TAGS = new Set(["p", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6"]);
  const elementProp = ir.styledProps.find((p) =>
    p.typeRefs.some((ref) => {
      const def = ir.definedTypes[ref];
      return (
        def?.kind === "union" &&
        (def.values?.length ?? 0) > 0 &&
        def.values!.every((v) => ELEMENT_TAGS.has(v))
      );
    }),
  );
  const elementTypeRef = elementProp?.typeRefs.find(
    (r) => ir.definedTypes[r]?.kind === "union",
  );
  const elementType = elementTypeRef ? ir.definedTypes[elementTypeRef] : undefined;
  const elementAxis = elementProp && elementType
    ? {
        propName: elementProp.safeName,
        typeName: elementTypeRef!,
        values: elementType.values as string[],
        defaultExpr:
          elementProp.defaultExpr?.replace(/^["']|["']$/g, "") ?? elementType.values![0],
      }
    : undefined;

  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${name}/${name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${segment}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  if (slots.usesColors) lines.push(`import androidx.compose.foundation.background`);
  lines.push(`import androidx.compose.foundation.layout.Box`);
  if (slots.minHeightSlot) lines.push(`import androidx.compose.foundation.layout.height`);
  if (slots.anyPaddingSlot) {
    lines.push(`import androidx.compose.foundation.layout.padding`);
  }
  if (slots.needsClip) lines.push(`import androidx.compose.foundation.shape.RoundedCornerShape`);
  lines.push(`import androidx.compose.runtime.Composable`);
  if (fgSlot) {
    lines.push(`import androidx.compose.runtime.CompositionLocalProvider`);
  }
  lines.push(`import androidx.compose.ui.Modifier`);
  if (slots.needsClip) lines.push(`import androidx.compose.ui.draw.clip`);
  if (slots.usesColors) lines.push(`import androidx.compose.ui.graphics.Color`);
  if (slots.usesDims) lines.push(`import androidx.compose.ui.unit.dp`);
  if (emitsTextStyle) {
    lines.push(`import androidx.compose.ui.text.TextStyle`);
    lines.push(`import androidx.compose.ui.text.font.FontWeight`);
    lines.push(`import androidx.compose.ui.unit.TextUnit`);
  }
  if (elementAxis) {
    lines.push(`import androidx.compose.ui.semantics.heading`);
    lines.push(`import androidx.compose.ui.semantics.semantics`);
  }
  if (usesTheme) {
    lines.push(`import com.fullstackds.tokens.LocalFsdsTheme`);
    if (slots.usesColors) lines.push(`import com.fullstackds.tokens.toFsdsColor`);
    if (slots.usesDims) lines.push(`import com.fullstackds.tokens.toFsdsDp`);
  }
  if (fgSlot) lines.push(`import com.fullstackds.tokens.LocalFsdsContentColor`);
  if (emitsTextStyle) {
    lines.push(`import com.fullstackds.tokens.ProvideFsdsTextStyle`);
    lines.push(`import com.fullstackds.tokens.toFsdsSp`);
    lines.push(`import com.fullstackds.tokens.toFsdsWeight`);
  }
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
  if (elementAxis) {
    lines.push(
      `/** Element-tag prop lowered from the contract's ${elementAxis.propName} union type. */`,
    );
    lines.push(
      `enum class ${elementAxis.typeName} { ${elementAxis.values.map(kotlinEnumName).join(", ")} }`,
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
  if (elementAxis) {
    lines.push(
      `    ${kotlinParamName(elementAxis.propName)}: ${elementAxis.typeName} = ${elementAxis.typeName}.${kotlinEnumName(elementAxis.defaultExpr)},`,
    );
  }
  lines.push(`    content: @Composable () -> Unit,`);
  lines.push(`) {`);
  if (usesTheme) {
    emitThemeHeader(lines, ir, variantKeysKt);
    const sides = emitChromeVals(lines, slots);
    if (isTypographyRoot && weightAxis) {
      // Typography lowering (FEAT-COMPOSE-TYPOGRAPHY-CONTENT-01): the type
      // scale resolves from the layered scopes — fontSize from the `text.size.md`
      // slot (variant scope first), fontWeight from the `text.typography.
      // fontWeight.<weight>` slot with the corpus value→slot vocabulary.
      lines.push(
        `    val fsdsFontSize = layeredSlot("text.size.md")?.toFsdsSp()`,
      );
      lines.push(`    val fsdsFontWeight = layeredSlot(`);
      lines.push(`        when (${kotlinParamName(weightAxis.propName)}) {`);
      for (const value of weightAxis.values) {
        lines.push(
          `            ${weightAxis.enumName}.${kotlinEnumName(value)} -> "text.typography.fontWeight.${WEIGHT_SLOT_SYNONYM[value] ?? value}"`,
        );
      }
      lines.push(`        },`);
      lines.push(`    )?.toFsdsWeight()`);
      lines.push(
        `    val fsdsTextStyle = TextStyle(fontSize = fsdsFontSize ?: TextUnit.Unspecified, fontWeight = fsdsFontWeight ?: FontWeight.Normal)`,
      );
    }
    lines.push(``);
    emitChromeModifier(lines, slots, sides);
    if (elementAxis) {
      // Element semantics: h1-h6 lower to the heading semantics marker (the
      // union values are the fact — no component names); p/span/div carry no
      // heading. The CMP 1.8.0 desktop semantics artifact exposes only the
      // level-less `heading()` marker (Heading.Level is absent — verified by
      // jar scan), so the H1-H6 level distinction is a named non-claim.
      lines.push(`    val headingModifier = when (${kotlinParamName(elementAxis.propName)}) {`);
      for (const value of elementAxis.values) {
        if (/^h[1-6]$/.test(value)) {
          lines.push(
            `        ${elementAxis.typeName}.${kotlinEnumName(value)} -> Modifier.semantics { heading() }`,
          );
        }
      }
      lines.push(`        else -> Modifier`);
      lines.push(`    }`);
      lines.push(``);
    }
    const box = elementAxis
      ? `Box(modifier.then(chromeModifier).then(headingModifier)) { content() }`
      : `Box(modifier.then(chromeModifier)) { content() }`;
    // Wrapping: text style outermost (M3 LocalTextStyle bridge), then the
    // content-color provider, then the box — each only when its fact exists.
    const contentLines: string[] = [];
    if (fgSlot) {
      contentLines.push(
        `CompositionLocalProvider(LocalFsdsContentColor provides (contentColor ?: Color.Unspecified)) {`,
      );
      contentLines.push(`    ${box}`);
      contentLines.push(`}`);
    } else {
      contentLines.push(box);
    }
    if (emitsTextStyle) {
      lines.push(`    ProvideFsdsTextStyle(fsdsTextStyle) {`);
      for (const l of contentLines) lines.push(`        ${l}`);
      lines.push(`    }`);
    } else {
      for (const l of contentLines) lines.push(`    ${l}`);
    }
  } else {
    lines.push(`    Box(modifier) { content() }`);
  }
  lines.push(`}`);
  lines.push(`// @generated:end`);
  lines.push(``);
  return lines.join("\n");
}

/** Variant axes for a component: enum per axis from ir.variants with the
 *  same-named designed prop's defaultExpr. Shared by the axis-bearing paths. */
function collectVariantAxes(ir: ComponentIR) {
  return Object.keys(ir.variants ?? {}).map((axis) => {
    const values = ir.variants[axis] ?? [];
    const prop = ir.styledProps.find((p) => p.safeName === axis);
    const defaultExpr = prop?.defaultExpr?.replace(/^["']|["']$/g, "") ?? values[0];
    return {
      propName: prop?.safeName ?? axis,
      enumName: `${ir.name}${pascalCase(axis)}`,
      values,
      defaultExpr,
    };
  });
}

/** Resolve the text source of a prop-text leaf: a prop binding on the root,
 *  on a single `code` part child, or the source prop of a content transform
 *  (highlight/markdown degrade to their source prop — the swift gate's facts).
 *  The IR owns the content binding shape; no per-component names. */
function propTextSource(ir: ComponentIR): { prop: string } | undefined {
  const direct = ir.dom?.content;
  if (direct && "prop" in direct) return { prop: direct.prop };
  const codeChild = (ir.dom?.children ?? []).find((c) => c.part === "code");
  const nested = codeChild?.content;
  if (nested && "prop" in nested) return { prop: nested.prop };
  const nestedSrc = (nested as { source?: unknown } | undefined)?.source;
  if (nestedSrc && typeof nestedSrc === "object" && "prop" in nestedSrc) {
    return { prop: (nestedSrc as { prop: string }).prop };
  }
  const directSrc = (direct as { source?: unknown } | undefined)?.source;
  if (directSrc && typeof directSrc === "object" && "prop" in directSrc) {
    return { prop: (directSrc as { prop: string }).prop };
  }
  return undefined;
}

/** Prop-text leaf: a passive root (no channels, no surface) whose text
 *  content binds to a prop — CodeBlock/CodeSnippet/Markdown. */
function isPropTextLeaf(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  if (ir.dom.tag === "button" || ir.dom.tag === "input") return false;
  return propTextSource(ir) !== undefined;
}

/**
 * Prop-text leaf composable: foundation BasicText rendering the bound prop,
 * with chrome resolved from the token scopes and the font-size role slot
 * (`*.size.fontSize.default` / `*.typography.fontSize.default` — the corpus's
 * text-leaf size vocabulary, distinct from the content-role `text.size.*`).
 */
function emitPropTextLeaf(ir: ComponentIR): string {
  const name = ir.name;
  const segment = packageSegment(name);
  const slots = resolveStaticChrome(ir);
  const textSource = propTextSource(ir)!;
  const textProp = ir.styledProps.find((p) => p.safeName === textSource.prop);
  const propHasDefault = textProp?.defaultExpr !== undefined;
  const fontSizeSlot = findLayeredSlotAny(ir, ["root"], [
    ".size.fontSize.default",
    ".typography.fontSize.default",
    "text.size.md",
  ]);
  const usesTheme = ir.tokenScopes.length > 0;
  const usesColors = slots.usesColors;
  const emitsTextStyle = Boolean(fontSizeSlot || slots.fgSlot);

  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${name}/${name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${segment}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  if (usesColors) lines.push(`import androidx.compose.foundation.background`);
  lines.push(`import androidx.compose.foundation.text.BasicText`);
  if (slots.minHeightSlot) lines.push(`import androidx.compose.foundation.layout.height`);
  if (slots.anyPaddingSlot) lines.push(`import androidx.compose.foundation.layout.padding`);
  if (slots.needsClip) lines.push(`import androidx.compose.foundation.shape.RoundedCornerShape`);
  lines.push(`import androidx.compose.runtime.Composable`);
  lines.push(`import androidx.compose.ui.Modifier`);
  if (slots.needsClip) lines.push(`import androidx.compose.ui.draw.clip`);
  if (usesColors || emitsTextStyle) lines.push(`import androidx.compose.ui.graphics.Color`);
  if (slots.usesDims) lines.push(`import androidx.compose.ui.unit.dp`);
  if (emitsTextStyle) {
    lines.push(`import androidx.compose.ui.text.TextStyle`);
    lines.push(`import androidx.compose.ui.unit.TextUnit`);
  }
  if (usesTheme) {
    lines.push(`import com.fullstackds.tokens.LocalFsdsTheme`);
    if (usesColors) lines.push(`import com.fullstackds.tokens.toFsdsColor`);
    if (slots.usesDims) lines.push(`import com.fullstackds.tokens.toFsdsDp`);
    if (fontSizeSlot) lines.push(`import com.fullstackds.tokens.toFsdsSp`);
  }
  lines.push(`// @generated:end`);
  lines.push(``);
  lines.push(`// @generated:start component`);
  lines.push(`@Composable`);
  lines.push(`fun ${name}(`);
  if (propHasDefault) {
    lines.push(`    modifier: Modifier = Modifier,`);
    lines.push(
      `    ${textSource.prop}: String = ${JSON.stringify(textProp!.defaultExpr!.replace(/^["']|["']$/g, ""))},`,
    );
  } else {
    lines.push(`    ${textSource.prop}: String,`);
    lines.push(`    modifier: Modifier = Modifier,`);
  }
  lines.push(`) {`);
  if (usesTheme) {
    emitThemeHeader(lines, ir, "");
    const sides = emitChromeVals(lines, slots);
    if (fontSizeSlot) {
      lines.push(
        `    val fsdsFontSize = layeredSlot(${JSON.stringify(fontSizeSlot.name)})?.toFsdsSp()`,
      );
    }
    lines.push(``);
    emitChromeModifier(lines, slots, sides);
    lines.push(`    val fsdsTextStyle = TextStyle(`);
    lines.push(
      `        fontSize = ${fontSizeSlot ? "fsdsFontSize ?: TextUnit.Unspecified" : "TextUnit.Unspecified"},`,
    );
    lines.push(
      `        color = ${slots.fgSlot ? "contentColor ?: Color.Unspecified" : "Color.Unspecified"},`,
    );
    lines.push(`    )`);
    lines.push(`    BasicText(`);
    lines.push(`        text = ${textSource.prop},`);
    lines.push(`        modifier = modifier.then(chromeModifier),`);
    lines.push(`        style = fsdsTextStyle,`);
    lines.push(`    )`);
  } else {
    lines.push(
      `    BasicText(text = ${textSource.prop}, modifier = modifier, style = TextStyle.Default)`,
    );
  }
  lines.push(`}`);
  lines.push(`// @generated:end`);
  lines.push(``);
  return lines.join("\n");
}

/** Expandable content: a children leaf paired with an `expand*` boolean
 *  channel — Truncate/ShowMore. The expanded channel drives the disclosure
 *  toggle; the toggle's label comes from the IR's conditional content (the
 *  whenTrue/whenFalse props the contract authors). */
function isExpandableContent(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  const expandChannel = ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "boolean" && c.name.startsWith("expand"),
  );
  if (!expandChannel) return false;
  let childrenLeaves = 0;
  const walk = (node: NonNullable<ComponentIR["dom"]>): void => {
    if (node.tag === "children" && (node.children ?? []).length === 0) childrenLeaves += 1;
    (node.children ?? []).forEach(walk);
  };
  walk(ir.dom);
  return childrenLeaves >= 1;
}

/** Prop name of a BindingExpression when it is a `prop` binding. */
function propNameOf(expr: { kind?: string; prop?: string } | undefined): string | undefined {
  if (expr && "prop" in (expr as Record<string, unknown>)) return (expr as { prop: string }).prop;
  return undefined;
}

/** Find the disclosure-toggle dom node (part `toggle` or `trigger`). */
function findTogglePart(ir: ComponentIR) {
  const walk = (node: NonNullable<ComponentIR["dom"]>): typeof node | undefined => {
    if (node.part === "toggle" || node.part === "trigger") return node;
    for (const child of node.children ?? []) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return undefined;
  };
  return ir.dom ? walk(ir.dom) : undefined;
}

function emitExpandableContent(ir: ComponentIR): string {
  const name = ir.name;
  const segment = packageSegment(name);
  const slots = resolveStaticChrome(ir);
  const channel = ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "boolean" && c.name.startsWith("expand"),
  )!;
  const valueProp = channel.valueProp;
  const defaultValueProp = channel.defaultValueProp ?? `${valueProp}Default`;
  const changeProp = channel.changeHandlerProp;
  const toggleNode = findTogglePart(ir);
  const conditional = toggleNode?.content;
  const collapseProp =
    conditional && "whenTrue" in conditional ? propNameOf(conditional.whenTrue) : undefined;
  const expandProp =
    conditional && "whenTrue" in conditional ? propNameOf(conditional.whenFalse) : undefined;
  const gateProp = toggleNode?.ifProp ?? undefined;
  const gapSlot = findLayeredSlot(ir, ["root"], "box-model.gap");
  const usesTheme = ir.tokenScopes.length > 0;
  const hasToggle = Boolean(collapseProp || expandProp || gateProp);

  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${name}/${name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${segment}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  if (slots.usesColors) lines.push(`import androidx.compose.foundation.background`);
  lines.push(`import androidx.compose.foundation.clickable`);
  if (slots.minHeightSlot) lines.push(`import androidx.compose.foundation.layout.height`);
  lines.push(`import androidx.compose.foundation.layout.Arrangement`);
  lines.push(`import androidx.compose.foundation.layout.Column`);
  lines.push(`import androidx.compose.foundation.text.BasicText`);
  if (slots.anyPaddingSlot) lines.push(`import androidx.compose.foundation.layout.padding`);
  if (slots.needsClip) lines.push(`import androidx.compose.foundation.shape.RoundedCornerShape`);
  lines.push(`import androidx.compose.runtime.Composable`);
  lines.push(`import androidx.compose.runtime.getValue`);
  lines.push(`import androidx.compose.runtime.mutableStateOf`);
  lines.push(`import androidx.compose.runtime.remember`);
  lines.push(`import androidx.compose.runtime.setValue`);
  if (slots.fgSlot) lines.push(`import androidx.compose.runtime.CompositionLocalProvider`);
  lines.push(`import androidx.compose.ui.Modifier`);
  if (slots.needsClip) lines.push(`import androidx.compose.ui.draw.clip`);
  if (slots.usesColors) lines.push(`import androidx.compose.ui.graphics.Color`);
  if (slots.usesDims) lines.push(`import androidx.compose.ui.unit.dp`);
  if (hasToggle) {
    lines.push(`import androidx.compose.ui.semantics.Role`);
    lines.push(`import androidx.compose.ui.semantics.semantics`);
    lines.push(`import androidx.compose.ui.semantics.stateDescription`);
  }
  if (usesTheme) {
    lines.push(`import com.fullstackds.tokens.LocalFsdsTheme`);
    if (slots.usesColors) lines.push(`import com.fullstackds.tokens.toFsdsColor`);
    if (slots.usesDims) lines.push(`import com.fullstackds.tokens.toFsdsDp`);
  }
  if (slots.fgSlot) lines.push(`import com.fullstackds.tokens.LocalFsdsContentColor`);
  lines.push(`// @generated:end`);
  lines.push(``);
  lines.push(`// @generated:start component`);
  lines.push(`@Composable`);
  lines.push(`fun ${name}(`);
  lines.push(`    modifier: Modifier = Modifier,`);
  lines.push(`    ${valueProp}: Boolean? = null,`);
  lines.push(`    ${defaultValueProp}: Boolean = false,`);
  lines.push(`    ${changeProp}: ((Boolean) -> Unit)? = null,`);
  if (gateProp) {
    const gatePropDef = ir.styledProps.find((p) => p.safeName === gateProp);
    lines.push(`    ${gateProp}: Boolean = ${gatePropDef?.defaultExpr ?? "false"},`);
  }
  if (collapseProp) lines.push(`    ${collapseProp}: String? = null,`);
  if (expandProp) lines.push(`    ${expandProp}: String? = null,`);
  lines.push(`    content: @Composable () -> Unit,`);
  lines.push(`) {`);
  lines.push(
    `    var uncontrolled${pascalCase(valueProp)} by remember { mutableStateOf(${defaultValueProp}) }`,
  );
  lines.push(
    `    val resolved${pascalCase(valueProp)} = ${valueProp} ?: uncontrolled${pascalCase(valueProp)}`,
  );
  if (usesTheme) {
    emitThemeHeader(lines, ir, "");
    const sides = emitChromeVals(lines, slots);
    if (gapSlot) {
      lines.push(`    val gap = layeredSlot(${JSON.stringify(gapSlot.name)})?.toFsdsDp() ?: 0.dp`);
    }
    lines.push(``);
    emitChromeModifier(lines, slots, sides);
    lines.push(``);
    lines.push(`    Column(`);
    lines.push(`        modifier = modifier.then(chromeModifier),`);
    lines.push(
      `        verticalArrangement = ${gapSlot ? "Arrangement.spacedBy(gap)" : "Arrangement.Top"},`,
    );
    lines.push(`    ) {`);
    if (slots.fgSlot) {
      // Content-color propagation (same contract as the static-content path):
      // the resolved foreground reaches the consumer's content region.
      lines.push(
        `        CompositionLocalProvider(LocalFsdsContentColor provides (contentColor ?: Color.Unspecified)) {`,
      );
      lines.push(`            content()`);
      lines.push(`        }`);
    } else {
      lines.push(`        content()`);
    }
    if (hasToggle) {
      const toggleBody = () => {
        lines.push(`            BasicText(`);
        lines.push(
          `                text = (if (resolved${pascalCase(valueProp)}) ${collapseProp ?? "null"} else ${expandProp ?? "null"}) ?: "",`,
        );
        lines.push(`                modifier = Modifier.clickable(`);
        lines.push(`                    role = Role.Button,`);
        lines.push(`                ) {`);
        lines.push(
          `                    if (${valueProp} == null) { uncontrolled${pascalCase(valueProp)} = !resolved${pascalCase(valueProp)} }`,
        );
        lines.push(`                    ${changeProp}?.invoke(!resolved${pascalCase(valueProp)})`);
        lines.push(`                }.semantics {`);
        lines.push(
          `                    stateDescription = if (resolved${pascalCase(valueProp)}) "expanded" else "collapsed"`,
        );
        lines.push(`                },`);
        lines.push(`            )`);
      };
      if (gateProp) {
        lines.push(`        if (${gateProp}) {`);
        toggleBody();
        lines.push(`        }`);
      } else {
        toggleBody();
      }
    }
    lines.push(`    }`);
  } else {
    lines.push(`    Column(modifier = modifier) { content() }`);
  }
  lines.push(`}`);
  lines.push(`// @generated:end`);
  lines.push(``);
  return lines.join("\n");
}

/** Progress/status indicator: a progressbar-role root (determinate bar from
 *  the 0-100 value prop, or circular when the contract declares a circular
 *  variant) or a status-role visual leaf (indeterminate spinner). */
function isProgressIndicator(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  const role = ir.root?.effectiveRole;
  if (role === "progressbar") return true;
  if (role === "status") {
    // A status-role indicator must BE a single animated mark: exactly one
    // child, that child a leaf, and its part declared `decoration` (Spinner's
    // aria-hidden `visual`). Skeleton is also role status but is a placeholder
    // — its single child is the `group`-role `stack` holding one row per
    // `lines`, so it stays on the static-content path.
    //
    // This used to test only `children.length === 0`, treating "has any dom
    // children" as the Spinner/Skeleton discriminator. That is a web-topology
    // proxy for a semantic distinction: realizing Skeleton's declared
    // stack/row/shape parts on the web silently reclassified it as a spinning
    // progress indicator here and dropped its `content` parameter.
    const kids = ir.dom.children ?? [];
    if (kids.length !== 1) return false;
    const only = kids[0]!;
    if ((only.children ?? []).length > 0) return false;
    const roleOfChild = ir.parts.find((part) => part.name === only.part)
      ?.details?.role;
    if (roleOfChild !== "decoration") return false;
    let childrenLeaves = 0;
    const walk = (node: NonNullable<ComponentIR["dom"]>): void => {
      if (node.tag === "children" && (node.children ?? []).length === 0) childrenLeaves += 1;
      (node.children ?? []).forEach(walk);
    };
    walk(ir.dom);
    return childrenLeaves === 0;
  }
  return false;
}

/** Per-axis slot lookup: resolves `<prefix>.<axis>.<value>` through the
 *  layered scopes — the Switch track-dims pattern, generalized. */
function emitAxisSlotLookup(
  lines: string[],
  valName: string,
  prefix: string,
  axis: { propName: string; enumName: string; values: string[] },
  accessor: "toFsdsDp" | "toFsdsColor" | "toFsdsMs",
): void {
  lines.push(`    val ${valName} = layeredSlot(`);
  lines.push(`        when (${kotlinParamName(axis.propName)}) {`);
  for (const value of axis.values) {
    lines.push(
      `            ${axis.enumName}.${kotlinEnumName(value)} -> ${JSON.stringify(`${prefix}.${value}`)}`,
    );
  }
  lines.push(`        },`);
  lines.push(`    )?.${accessor}()`);
}

function emitProgressIndicator(ir: ComponentIR): string {
  const name = ir.name;
  const segment = packageSegment(name);
  const slots = resolveStaticChrome(ir);
  const axes = collectVariantAxes(ir);
  const variantKeysKt = axes
    .map((a) => `"variant_" + ${kotlinParamName(a.propName)}.name.lowercase()`)
    .join(", ");
  const isBar = ir.root?.effectiveRole === "progressbar";
  const valueProp = ir.styledProps.find((p) => p.safeName === "value");
  const labelProp = ir.styledProps.find((p) => p.safeName === "label");
  const showValueProp = ir.styledProps.find((p) => p.safeName === "showValue");
  const textColorSlot = findLayeredSlot(ir, ["root"], ".color.text.default");
  const trackColorSlot = findLayeredSlot(ir, ["root"], ".color.track.background");
  const fillSlot = findLayeredSlotAny(ir, ["root"], [".color.fill.info", ".color.fill"]);
  const durationSlot = findLayeredSlot(ir, ["root"], ".motion.duration.indeterminate");
  const sizeAxis = axes.find((a) => a.propName === "size");
  const thicknessAxis = axes.find((a) => a.propName === "thickness");
  const variantAxis = axes.find((a) => a.propName === "variant");
  const intentAxis = axes.find((a) => a.propName === "intent");
  const usesTheme = ir.tokenScopes.length > 0;

  const lines: string[] = [];
  lines.push(
    `// @generated by ds-codegen from components/${name}/${name}.contract.json — do not edit by hand.`,
  );
  lines.push(`package com.fullstackds.components.${segment}`);
  lines.push(``);
  lines.push(`// @generated:start imports`);
  if (slots.usesColors) lines.push(`import androidx.compose.foundation.background`);
  if (slots.minHeightSlot) lines.push(`import androidx.compose.foundation.layout.height`);
  if (slots.anyPaddingSlot) lines.push(`import androidx.compose.foundation.layout.padding`);
  if (slots.needsClip) lines.push(`import androidx.compose.foundation.shape.RoundedCornerShape`);
  lines.push(`import androidx.compose.runtime.Composable`);
  if (textColorSlot) lines.push(`import androidx.compose.runtime.CompositionLocalProvider`);
  lines.push(`import androidx.compose.ui.Modifier`);
  if (slots.needsClip) lines.push(`import androidx.compose.ui.draw.clip`);
  // Color is always referenced (the substrate call carries ledgered fallback
  // constants), and toFsdsColor whenever any color slot resolves.
  const usesProgressColors = Boolean(textColorSlot || trackColorSlot || fillSlot);
  lines.push(`import androidx.compose.ui.graphics.Color`);
  if (slots.usesDims) lines.push(`import androidx.compose.ui.unit.dp`);
  lines.push(`import com.fullstackds.components.progress.FsdsProgressIndicator`);
  if (usesTheme) {
    lines.push(`import com.fullstackds.tokens.LocalFsdsTheme`);
    if (slots.usesColors || usesProgressColors) lines.push(`import com.fullstackds.tokens.toFsdsColor`);
    if (slots.usesDims) lines.push(`import com.fullstackds.tokens.toFsdsDp`);
    if (durationSlot) lines.push(`import com.fullstackds.tokens.toFsdsMs`);
  }
  if (textColorSlot) lines.push(`import com.fullstackds.tokens.LocalFsdsContentColor`);
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
  lines.push(`    modifier: Modifier = Modifier,`);
  if (valueProp && isBar) lines.push(`    value: Float? = null,`);
  if (labelProp) lines.push(`    label: String? = null,`);
  if (showValueProp && isBar) lines.push(`    showValue: Boolean = false,`);
  for (const axis of axes) {
    lines.push(
      `    ${kotlinParamName(axis.propName)}: ${axis.enumName} = ${axis.enumName}.${kotlinEnumName(axis.defaultExpr)},`,
    );
  }
  if (isBar && showValueProp) lines.push(`    content: @Composable () -> Unit = {},`);
  lines.push(`) {`);
  if (usesTheme) {
    emitThemeHeader(lines, ir, variantKeysKt);
    const sides = emitChromeVals(lines, slots);
    if (textColorSlot) {
      lines.push(
        `    val textColor = layeredSlot(${JSON.stringify(textColorSlot.name)})?.toFsdsColor()`,
      );
    }
    if (trackColorSlot) {
      lines.push(
        `    val trackColor = layeredSlot(${JSON.stringify(trackColorSlot.name)})?.toFsdsColor()`,
      );
    }
    if (fillSlot && intentAxis) {
      emitAxisSlotLookup(lines, "fillColor", "progress.color.fill", intentAxis, "toFsdsColor");
    } else if (fillSlot) {
      lines.push(
        `    val fillColor = layeredSlot(${JSON.stringify(fillSlot.name)})?.toFsdsColor()`,
      );
    }
    if (durationSlot) {
      lines.push(
        `    val durationMs = layeredSlot(${JSON.stringify(durationSlot.name)})?.toFsdsMs() ?: 1200`,
      );
    }
    // The per-value dim lookups emit only when the component's scopes carry
    // the spinner size/thickness slots (Spinner does; Progress's size axis
    // has no dim slots — the substrate default applies instead).
    const hasSpinnerSizeSlots = ir.tokenScopes.some((s) =>
      s.values.some((v) => v.name.startsWith("spinner.size.")),
    );
    const hasSpinnerThicknessSlots = ir.tokenScopes.some((s) =>
      s.values.some((v) => v.name.startsWith("spinner.thickness.")),
    );
    if (sizeAxis && hasSpinnerSizeSlots) {
      emitAxisSlotLookup(lines, "spinnerSize", "spinner.size", sizeAxis, "toFsdsDp");
    }
    if (thicknessAxis && hasSpinnerThicknessSlots) {
      emitAxisSlotLookup(lines, "spinnerThickness", "spinner.thickness", thicknessAxis, "toFsdsDp");
    }
    lines.push(``);
    emitChromeModifier(lines, slots, sides);
    lines.push(``);
    lines.push(`    FsdsProgressIndicator(`);
    lines.push(
      `        progress = ${valueProp && isBar ? "value?.let { it / 100f }" : "null"},`,
    );
    lines.push(
      `        linear = ${isBar ? (variantAxis ? `${variantAxis.enumName}.Linear == ${kotlinParamName(variantAxis.propName)}` : "true") : "false"},`,
    );
    lines.push(
      `        size = ${hasSpinnerSizeSlots && sizeAxis ? "spinnerSize ?: 24.dp" : "24.dp"},`,
    );
    lines.push(
      `        strokeWidth = ${hasSpinnerThicknessSlots && thicknessAxis ? "spinnerThickness ?: 3.dp" : "4.dp"},`,
    );
    lines.push(
      `        trackColor = ${trackColorSlot ? "trackColor ?: Color(0xFFD0D0D0)" : "Color(0xFFD0D0D0)"},`,
    );
    lines.push(
      `        fillColor = ${fillSlot ? "fillColor ?: Color(0xFF0566FE)" : "Color(0xFF0566FE)"},`,
    );
    lines.push(`        durationMs = ${durationSlot ? "durationMs" : "1200"},`);
    lines.push(`        contentDescription = ${labelProp ? "label" : "null"},`);
    lines.push(`        modifier = modifier.then(chromeModifier),`);
    lines.push(`    )`);
    if (isBar && showValueProp) {
      lines.push(``);
      lines.push(`    if (showValue) {`);
      if (textColorSlot) {
        lines.push(
          `        CompositionLocalProvider(LocalFsdsContentColor provides (textColor ?: Color.Unspecified)) {`,
        );
        lines.push(`            content()`);
        lines.push(`        }`);
      } else {
        lines.push(`        content()`);
      }
      lines.push(`    }`);
    }
  } else {
    lines.push(`    FsdsProgressIndicator(`);
    lines.push(`        progress = null,`);
    lines.push(`        linear = false,`);
    lines.push(`        modifier = modifier,`);
    lines.push(`    )`);
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
  if (isPropTextLeaf(ir)) {
    return emitPropTextLeaf(ir);
  }
  if (isExpandableContent(ir)) {
    return emitExpandableContent(ir);
  }
  if (isProgressIndicator(ir)) {
    return emitProgressIndicator(ir);
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
