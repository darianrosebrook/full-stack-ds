import type {
  BindingExpression,
  ComponentIR,
  DomNodeIR,
  NormalizedChannelIR,
  ResolvedPropIR,
} from "../../ir.js";
import { collectCollapseIntents } from "../../ir.js";

export interface ReactNativeComponentFiles {
  componentFile: string;
  stylesFile: string;
  tokensFile: string;
}

const INDENT = "  ";
const VOID_RN_COMPONENTS = new Set(["TextInput", "RNImage", "RNSwitch"]);
const RESERVED_PROPS = new Set(["children", "style", "testID"]);
const GLOBAL_TYPE_NAMES = new Set([
  "Array",
  "Date",
  "NonNullable",
  "Omit",
  "Partial",
  "Pick",
  "Promise",
  "ReactNode",
  "Record",
  "Required",
]);

interface RuntimeUsage {
  props: Set<string>;
  channels: Set<string>;
  channelSetters: Set<string>;
}

export function generateReactNativeComponentSource(
  ir: ComponentIR,
): ReactNativeComponentFiles {
  return {
    componentFile: generateReactNativeComponentFile(ir),
    stylesFile: generateReactNativeStylesFile(ir),
    tokensFile: generateReactNativeTokensFile(ir),
  };
}

function generateReactNativeComponentFile(ir: ComponentIR): string {
  const sections: string[] = [];
  sections.push(emitImports(ir));
  sections.push(emitTypes(ir));
  sections.push(emitProps(ir));
  sections.push(emitComponent(ir));
  return sections.filter(Boolean).join("\n\n") + "\n";
}

function emitImports(ir: ComponentIR): string {
  const usage = collectRuntimeUsage(ir);
  const rnValueImports = new Set<string>();
  const rnTypeImports = new Set<string>(["StyleProp", rootStyleType(ir)]);
  if (usesNativeToggle(ir)) {
    rnValueImports.add("Switch as RNSwitch");
  } else {
    collectRnComponents(ir.dom, rnValueImports);
  }
  if (usesLinking(ir.dom)) rnValueImports.add("Linking");
  if (
    hasChildrenSlotUnderNonTextParent(ir.dom) ||
    isFieldLayoutPattern(ir) ||
    isCheckboxRootPattern(ir)
  ) {
    rnValueImports.add("Text as RNText");
  }
  if (isFieldLayoutPattern(ir) || isCheckboxRootPattern(ir)) rnValueImports.add("View");
  if (isCheckboxRootPattern(ir)) rnValueImports.add("Pressable");
  if (rootPressableAcceptsOnPress(ir)) rnTypeImports.add("GestureResponderEvent");
  const reactImports = new Set(["ReactNode"]);
  if (usage.channelSetters.size > 0) {
    reactImports.add("useCallback");
  }
  if (usage.channels.size > 0) {
    reactImports.add("useState");
  }
  reactImports.add("useMemo");

  return [
    "// @generated:start imports",
    rnTypeImports.size > 0
      ? `import type { ${Array.from(rnTypeImports).sort().join(", ")} } from "react-native";`
      : "",
    rnValueImports.size > 0
      ? `import { ${Array.from(rnValueImports).sort().join(", ")} } from "react-native";`
      : "",
    `import { ${Array.from(reactImports)
      .sort()
      .map((name) => (name === "ReactNode" ? "type ReactNode" : name))
      .join(", ")} } from "react";`,
    `import { useFsdsTheme } from "../../tokens";`,
    `import { create${ir.name}Styles } from "./${ir.name}.styles";`,
    usesNativeToggle(ir)
      ? `import { resolve${ir.name}Tokens } from "./${ir.name}.tokens";`
      : "",
    "// @generated:end",
  ].filter(Boolean).join("\n");
}

function collectRnComponents(node: DomNodeIR | undefined, imports: Set<string>): void {
  if (!node) {
    imports.add("View");
    return;
  }
  if (node.tag === "children" || node.tag === "slot") return;
  if (node.content) imports.add("Text as RNText");
  const component = rnComponentForNode(node);
  imports.add(
    component === "RNText"
      ? "Text as RNText"
      : component === "RNImage"
        ? "Image as RNImage"
        : component,
  );
  for (const child of node.children) collectRnComponents(child, imports);
}

function usesLinking(node: DomNodeIR | undefined): boolean {
  if (!node) return false;
  if (node.tag === "a" && Boolean(node.bindings.href)) return true;
  return node.children.some((child) => usesLinking(child));
}

function hasChildrenSlotUnderNonTextParent(node: DomNodeIR | undefined): boolean {
  if (!node) return false;
  const component = rnComponentForNode(node);
  if (
    component !== "RNText" &&
    !VOID_RN_COMPONENTS.has(component) &&
    node.children.length === 0 &&
    node.part === "root"
  ) {
    return true;
  }
  if (
    component !== "RNText" &&
    node.children.some((child) => child.tag === "children" || child.tag === "slot")
  ) {
    return true;
  }
  return node.children.some((child) => hasChildrenSlotUnderNonTextParent(child));
}

function emitTypes(ir: ComponentIR): string {
  const lines = ["// @generated:start types"];
  const emitted = new Set<string>();
  for (const [typeName, def] of Object.entries(ir.definedTypes)) {
    if (def.kind === "union" && def.values) {
      lines.push(
        `export type ${typeName} = ${def.values.map((v) => JSON.stringify(v)).join(" | ")};`,
      );
      emitted.add(typeName);
    } else if (def.kind === "alias" && def.alias) {
      lines.push(`export type ${typeName} = ${stripReactNamespace(def.alias)};`);
      emitted.add(typeName);
    } else {
      lines.push(`export type ${typeName} = unknown;`);
      emitted.add(typeName);
    }
  }
  for (const prop of ir.styledProps) {
    for (const ref of collectTypeRefs(prop)) {
      if (ref === "ReactNode" || emitted.has(ref) || ir.definedTypes[ref]) continue;
      lines.push(`export type ${ref} = unknown;`);
      emitted.add(ref);
    }
  }
  lines.push("// @generated:end");
  return lines.join("\n");
}

function collectTypeRefs(prop: ResolvedPropIR): string[] {
  const refs = new Set(prop.typeRefs);
  const matches = prop.type.match(/\b[A-Z][A-Za-z0-9_]*\b/g) ?? [];
  for (const match of matches) {
    if (!GLOBAL_TYPE_NAMES.has(match)) refs.add(match);
  }
  for (const global of GLOBAL_TYPE_NAMES) refs.delete(global);
  return [...refs];
}

function stripReactNamespace(value: string): string {
  return value.replace(/\bReact\.ReactNode\b/g, "ReactNode");
}

function emitProps(ir: ComponentIR): string {
  const lines = ["// @generated:start props", `export interface ${ir.name}Props {`];
  const emitted = new Set<string>();
  for (const prop of ir.styledProps) {
    if (RESERVED_PROPS.has(prop.name)) continue;
    lines.push(`${INDENT}${prop.safeName}${prop.required ? "" : "?"}: ${rnPropType(ir, prop)};`);
    emitted.add(prop.safeName);
  }
  if (!emitted.has("children")) lines.push(`${INDENT}children?: ReactNode;`);
  if (rootPressableAcceptsOnPress(ir)) {
    lines.push(`${INDENT}onPress?: (event: GestureResponderEvent) => void;`);
  }
  lines.push(`${INDENT}style?: StyleProp<${rootStyleType(ir)}>;`);
  lines.push(`${INDENT}testID?: string;`);
  lines.push(`${INDENT}accessibilityLabel?: string;`);
  lines.push(`${INDENT}accessibilityLabelledBy?: string | string[];`);
  lines.push("}");
  lines.push("// @generated:end");
  return lines.join("\n");
}

function rnPropType(ir: ComponentIR, prop: ResolvedPropIR): string {
  if (prop.propType.kind === "node") return "ReactNode";
  const unresolved = new Set(ir.unresolvedTypeRefs.map((ref) => ref.ref));
  if (prop.typeRefs.some((ref) => unresolved.has(ref))) return "unknown";
  return prop.type.replace(/\bReactNode\b/g, "ReactNode");
}

function collectRuntimeUsage(ir: ComponentIR): RuntimeUsage {
  const usage: RuntimeUsage = {
    props: new Set(["style", "testID", "accessibilityLabel", "accessibilityLabelledBy"]),
    channels: new Set(),
    channelSetters: new Set(),
  };
  if (rootPressableAcceptsOnPress(ir)) usage.props.add("onPress");

  if (usesNativeToggle(ir)) {
    const channel = ir.behavior.normalizedChannels[0];
    if (channel) {
      usage.channels.add(channel.name);
      usage.channelSetters.add(channel.name);
    }
    addPropIfPresent(ir, usage, "disabled");
    addPropIfPresent(ir, usage, "size");
    return usage;
  }

  if (isFieldLayoutPattern(ir)) {
    for (const prop of ["id", "label", "helpText", "error", "validating"]) {
      addPropIfPresent(ir, usage, prop);
    }
    usage.props.add("children");
    return usage;
  }

  if (isCheckboxRootPattern(ir)) {
    const channel = ir.behavior.normalizedChannels[0];
    if (channel) {
      usage.channels.add(channel.name);
      usage.channelSetters.add(channel.name);
    }
    addPropIfPresent(ir, usage, "disabled");
    addPropIfPresent(ir, usage, "indeterminate");
    usage.props.add("children");
    return usage;
  }

  collectNodeRuntimeUsage(ir.dom, ir, usage);
  if (!ir.dom) usage.props.add("children");
  return usage;
}

function addPropIfPresent(ir: ComponentIR, usage: RuntimeUsage, propName: string): void {
  const prop = findProp(ir, propName);
  if (prop) usage.props.add(prop.safeName);
}

function collectNodeRuntimeUsage(
  node: DomNodeIR | undefined,
  ir: ComponentIR,
  usage: RuntimeUsage,
): void {
  if (!node) return;
  if (node.tag === "children" || node.tag === "slot") {
    usage.props.add("children");
    return;
  }
  const component = rnComponentForNode(node);
  if (node.ifProp) collectGuardRuntimeUsage(node.ifProp, ir, usage);
  if (node.iteration) collectBindingRuntimeUsage(node.iteration.source, ir, usage);
  if (node.content) collectBindingRuntimeUsage(node.content, ir, usage);
  for (const binding of node.cssVarBindings) {
    collectBindingRuntimeUsage(binding.value, ir, usage);
  }
  for (const [name, binding] of Object.entries(node.bindings)) {
    if (!isSupportedBindingForComponent(name, component)) continue;
    collectBindingRuntimeUsage(binding, ir, usage);
  }
  for (const [eventName, binding] of Object.entries(node.events)) {
    if (!eventPropFor(component, eventName)) continue;
    collectBindingRuntimeUsage(binding, ir, usage, "setter");
  }
  for (const child of node.children) {
    collectNodeRuntimeUsage(child, ir, usage);
  }
  if (
    node.children.length === 0 &&
    node.part === "root" &&
    !VOID_RN_COMPONENTS.has(component)
  ) {
    usage.props.add("children");
  }
}

function collectBindingRuntimeUsage(
  binding: BindingExpression,
  ir: ComponentIR,
  usage: RuntimeUsage,
  channelPurpose: "value" | "setter" = "value",
): void {
  if (binding.kind === "prop") {
    const safeName = safePropName(ir, binding.prop);
    usage.props.add(safeName);
    if (
      safeName === "showMoreLabel" &&
      ir.styledProps.some((prop) => prop.safeName === "showLessLabel") &&
      ir.behavior.normalizedChannels.some((channel) => channel.name === "expanded")
    ) {
      usage.props.add("showLessLabel");
      usage.channels.add("expanded");
    }
    return;
  }
  if (binding.kind === "channel") {
    usage.channels.add(binding.channel);
    if (channelPurpose === "setter" || binding.field === "onChange") {
      usage.channelSetters.add(binding.channel);
    }
    return;
  }
  if (binding.kind === "iterationLocal" || binding.kind === "literal") return;
  collectBindingRuntimeUsage(binding.left, ir, usage, channelPurpose);
  collectBindingRuntimeUsage(binding.right, ir, usage, channelPurpose);
}

function collectGuardRuntimeUsage(
  ifProp: string,
  ir: ComponentIR,
  usage: RuntimeUsage,
): void {
  if (ifProp === "children") {
    usage.props.add("children");
    return;
  }
  const channel = channelForIfProp(ir, ifProp);
  if (channel) {
    usage.channels.add(channel.name);
    return;
  }
  usage.props.add(safePropName(ir, ifProp));
}

function emitComponent(ir: ComponentIR): string {
  const lines = ["// @generated:start component"];
  const usage = collectRuntimeUsage(ir);
  const destructured = propDestructureEntries(ir, usage);
  lines.push(`export function ${ir.name}({`);
  for (const entry of destructured) lines.push(`${INDENT}${entry},`);
  lines.push(`}: ${ir.name}Props) {`);
  lines.push(`${INDENT}const fsdsTheme = useFsdsTheme();`);
  lines.push(`${INDENT}const styles = useMemo(() => create${ir.name}Styles(fsdsTheme), [fsdsTheme]);`);
  if (usesNativeToggle(ir)) {
    lines.push(`${INDENT}const tokens = useMemo(() => resolve${ir.name}Tokens(fsdsTheme), [fsdsTheme]);`);
  }
  for (const channel of ir.behavior.normalizedChannels.filter((candidate) =>
    usage.channels.has(candidate.name),
  )) {
    lines.push(...emitChannelState(ir, channel, usage.channelSetters.has(channel.name)));
  }
  if (usesNativeToggle(ir)) {
    lines.push(...emitNativeToggleReturn(ir));
  } else if (isFieldLayoutPattern(ir)) {
    lines.push(...emitFieldLayoutReturn());
  } else if (isCheckboxRootPattern(ir)) {
    lines.push(...emitCheckboxReturn(ir));
  } else {
    const rendered = emitNode(ir.dom, ir, 2) ?? [
      `${INDENT}${INDENT}<View`,
      `${INDENT}${INDENT}${INDENT}testID={testID}`,
      `${INDENT}${INDENT}${INDENT}style={[styles.root, style]}`,
      `${INDENT}${INDENT}${INDENT}accessibilityLabel={accessibilityLabel}`,
      `${INDENT}${INDENT}${INDENT}accessibilityLabelledBy={accessibilityLabelledBy}`,
      `${INDENT}${INDENT}>`,
      `${INDENT}${INDENT}${INDENT}{children}`,
      `${INDENT}${INDENT}</View>`,
    ].join("\n");
    lines.push(`${INDENT}return (`);
    lines.push(rendered);
    lines.push(`${INDENT});`);
  }
  lines.push("}");
  lines.push("// @generated:end");
  return lines.join("\n");
}

function emitFieldLayoutReturn(): string[] {
  const lines: string[] = [];
  lines.push(`${INDENT}return (`);
  lines.push(`${INDENT}${INDENT}<View`);
  lines.push(`${INDENT}${INDENT}${INDENT}testID={testID}`);
  lines.push(`${INDENT}${INDENT}${INDENT}style={[styles.root, style]}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityLabel={accessibilityLabel}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityLabelledBy={accessibilityLabelledBy}`);
  lines.push(`${INDENT}${INDENT}>`);
  lines.push(`${INDENT}${INDENT}${INDENT}{label ? (`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}<RNText nativeID={id ? \`\${id}-label\` : undefined} style={styles.label}>`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}{label}`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}</RNText>`);
  lines.push(`${INDENT}${INDENT}${INDENT}) : null}`);
  lines.push(`${INDENT}${INDENT}${INDENT}<View style={styles.control}>`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}{children}`);
  lines.push(`${INDENT}${INDENT}${INDENT}</View>`);
  lines.push(`${INDENT}${INDENT}${INDENT}{helpText || error || validating ? (`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}<View style={styles.meta}>`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}{helpText ? <RNText style={styles.help}>{helpText}</RNText> : null}`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}{error ? <RNText accessibilityRole="alert" style={styles.error}>{error}</RNText> : null}`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}{validating ? <RNText style={styles.validatingIndicator}>Validating</RNText> : null}`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}</View>`);
  lines.push(`${INDENT}${INDENT}${INDENT}) : null}`);
  lines.push(`${INDENT}${INDENT}</View>`);
  lines.push(`${INDENT});`);
  return lines;
}

function emitCheckboxReturn(ir: ComponentIR): string[] {
  const channel = ir.behavior.normalizedChannels[0];
  if (!channel) return [];
  const valueName = channel.name;
  const setterName = `set${capitalize(channel.name)}Value`;
  const disabledProp = findProp(ir, "disabled") ? "disabled" : "false";
  const indeterminateProp = findProp(ir, "indeterminate") ? "indeterminate" : "false";
  const lines: string[] = [];
  lines.push(`${INDENT}return (`);
  lines.push(`${INDENT}${INDENT}<Pressable`);
  lines.push(`${INDENT}${INDENT}${INDENT}testID={testID}`);
  lines.push(`${INDENT}${INDENT}${INDENT}style={[styles.input, style]}`);
  lines.push(`${INDENT}${INDENT}${INDENT}disabled={${disabledProp}}`);
  lines.push(`${INDENT}${INDENT}${INDENT}onPress={() => ${setterName}(!${valueName})}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityLabel={accessibilityLabel}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityLabelledBy={accessibilityLabelledBy}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityRole="checkbox"`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityState={{ checked: ${indeterminateProp} ? "mixed" : Boolean(${valueName}), disabled: ${disabledProp} }}`);
  lines.push(`${INDENT}${INDENT}>`);
  lines.push(`${INDENT}${INDENT}${INDENT}<View style={[styles.indicator, ${valueName} || ${indeterminateProp} ? styles.indicator_checked : undefined]}>`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}<RNText style={styles.indicatorMark}>{${indeterminateProp} ? "-" : ${valueName} ? "x" : ""}</RNText>`);
  lines.push(`${INDENT}${INDENT}${INDENT}</View>`);
  lines.push(`${INDENT}${INDENT}${INDENT}{typeof children === "string" ? <RNText style={styles.label}>{children}</RNText> : children}`);
  lines.push(`${INDENT}${INDENT}</Pressable>`);
  lines.push(`${INDENT});`);
  return lines;
}

function propDestructureEntries(ir: ComponentIR, usage: RuntimeUsage): string[] {
  const entries: string[] = [];
  const emitted = new Set<string>();
  for (const prop of ir.styledProps) {
    if (RESERVED_PROPS.has(prop.name)) continue;
    const channel = ir.behavior.normalizedChannels.find((c) => c.valueProp === prop.name);
    const channelIsUsed = channel ? usage.channels.has(channel.name) : false;
    if (!usage.props.has(prop.safeName) && !channelIsUsed) continue;
    if (channel && channelIsUsed) {
      entries.push(`${prop.safeName}: controlled${capitalize(channel.name)}`);
    } else {
      const suffix = prop.defaultExpr ? ` = ${prop.defaultExpr}` : "";
      entries.push(`${prop.safeName}${suffix}`);
    }
    emitted.add(prop.safeName);
  }
  for (const channel of ir.behavior.normalizedChannels) {
    if (!usage.channels.has(channel.name)) continue;
    if (channel.defaultValueProp && !emitted.has(channel.defaultValueProp)) {
      entries.push(
        `${channel.defaultValueProp} = ${defaultForChannel(channel)}`,
      );
      emitted.add(channel.defaultValueProp);
    }
    if (usage.channelSetters.has(channel.name) && !emitted.has(channel.changeHandlerProp)) {
      entries.push(channel.changeHandlerProp);
      emitted.add(channel.changeHandlerProp);
    }
  }
  if (usage.props.has("children")) entries.push("children");
  if (rootPressableAcceptsOnPress(ir)) entries.push("onPress");
  entries.push("style", "testID", "accessibilityLabel", "accessibilityLabelledBy");
  return entries;
}

function emitChannelState(
  ir: ComponentIR,
  channel: NormalizedChannelIR,
  needsSetter: boolean,
): string[] {
  const cap = capitalize(channel.name);
  const controlled = `controlled${cap}`;
  const value = channel.name;
  const setter = `set${cap}Value`;
  const internal = `uncontrolled${cap}`;
  const setInternal = `setUncontrolled${cap}`;
  const handler = channel.changeHandlerProp;
  const type = tsTypeForChannel(ir, channel);
  const initial = channel.defaultValueProp
    ? `${channel.defaultValueProp} ?? ${defaultForChannel(channel)}`
    : defaultForChannel(channel);
  const lines: string[] = [];
  lines.push(
    `${INDENT}const [${internal}${needsSetter ? `, ${setInternal}` : ""}] = useState<${type}>((${initial}) as ${type});`,
  );
  lines.push(`${INDENT}const ${value} = ${controlled} ?? ${internal};`);
  if (needsSetter) {
    lines.push(`${INDENT}const ${setter} = useCallback((next: ${type}) => {`);
    lines.push(`${INDENT}${INDENT}if (${controlled} === undefined) ${setInternal}(next);`);
    lines.push(`${INDENT}${INDENT}${handler}?.(next);`);
    lines.push(`${INDENT}}, [${controlled}, ${handler}]);`);
  }
  lines.push("");
  return lines;
}

function emitNativeToggleReturn(ir: ComponentIR): string[] {
  const channel = ir.behavior.normalizedChannels[0];
  if (!channel) {
    throw new Error(
      `generateReactNativeComponentSource: ${ir.name} declares native-toggle-affordance but no channel.`,
    );
  }
  const valueName = channel.name;
  const setterName = `set${capitalize(channel.name)}Value`;
  const disabledProp = findProp(ir, "disabled") ? "disabled" : "false";
  const trackFalse = tokenStringAccess(ir, "root", `${ir.cssPrefix}.color.track.background.default`);
  const trackTrue = tokenStringFallbackAccess(ir, `${ir.cssPrefix}.color.track.background.default`, [
    "checked",
    "root",
  ]);
  const thumbColor = tokenStringFallbackAccess(ir, `${ir.cssPrefix}.color.thumb.background.default`, [
    "checked",
    "root",
  ]);
  const styleName = variantStyleExpression(ir);
  const lines: string[] = [];
  lines.push(`${INDENT}return (`);
  lines.push(`${INDENT}${INDENT}<RNSwitch`);
  lines.push(`${INDENT}${INDENT}${INDENT}testID={testID}`);
  lines.push(`${INDENT}${INDENT}${INDENT}style={[${styleName}, style]}`);
  lines.push(`${INDENT}${INDENT}${INDENT}value={${valueName}}`);
  lines.push(`${INDENT}${INDENT}${INDENT}onValueChange={${setterName}}`);
  lines.push(`${INDENT}${INDENT}${INDENT}disabled={${disabledProp}}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityLabel={accessibilityLabel}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityLabelledBy={accessibilityLabelledBy}`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityRole="switch"`);
  lines.push(`${INDENT}${INDENT}${INDENT}accessibilityState={{ checked: ${valueName}, disabled: ${disabledProp} }}`);
  if (trackFalse || trackTrue) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}trackColor={{ false: ${trackFalse ?? "undefined"}, true: ${trackTrue ?? "undefined"} }}`,
    );
  }
  if (trackFalse) {
    lines.push(`${INDENT}${INDENT}${INDENT}ios_backgroundColor={${trackFalse}}`);
  }
  if (thumbColor) {
    lines.push(`${INDENT}${INDENT}${INDENT}thumbColor={${thumbColor}}`);
  }
  lines.push(`${INDENT}${INDENT}/>`); 
  lines.push(`${INDENT});`);
  return lines;
}

function emitNode(
  node: DomNodeIR | undefined,
  ir: ComponentIR,
  depth: number,
  keyExpr?: string,
): string | null {
  if (!node) return null;
  if (node.tag === "children" || node.tag === "slot") return `${INDENT.repeat(depth)}{children}`;
  if (node.iteration) return emitIteration(node, ir, depth);

  const component = rnComponentForNode(node);
  const attrs = emitNodeProps(node, ir, component, depth + 1, keyExpr);
  const childLines = emitNodeChildren(node, ir, depth + 1);
  const pad = INDENT.repeat(depth);
  let rendered: string;
  if (VOID_RN_COMPONENTS.has(component) || childLines.length === 0) {
    rendered = [`${pad}<${component}`, ...attrs, `${pad}/>`].join("\n");
  } else {
    rendered = [`${pad}<${component}`, ...attrs, `${pad}>`, ...childLines, `${pad}</${component}>`].join("\n");
  }
  return applyIfGuard(rendered, node, ir, pad);
}

function emitNodeChildren(node: DomNodeIR, ir: ComponentIR, depth: number): string[] {
  if (node.content) {
    return [`${INDENT.repeat(depth)}<RNText>{${bindingExpr(node.content, ir)}}</RNText>`];
  }
  const lines: string[] = [];
  for (const child of node.children) {
    if (child.tag === "children" || child.tag === "slot") {
      lines.push(
        emitChildrenSlot(rnComponentForNode(node), depth, maxLinesExpressionForNode(node, ir)),
      );
      continue;
    }
    const rendered = emitNode(child, ir, depth);
    if (rendered) lines.push(rendered);
  }
  if (node.children.length === 0 && node.part === "root") {
    lines.push(
      emitChildrenSlot(rnComponentForNode(node), depth, maxLinesExpressionForNode(node, ir)),
    );
  }
  return lines;
}

function emitChildrenSlot(
  parentComponent: string,
  depth: number,
  numberOfLinesExpr?: string,
): string {
  const pad = INDENT.repeat(depth);
  if (parentComponent === "RNText") return `${pad}{children}`;
  const linesProp = numberOfLinesExpr ? ` numberOfLines={${numberOfLinesExpr}}` : "";
  return `${pad}{typeof children === "string" ? <RNText${linesProp}>{children}</RNText> : children}`;
}

function emitNodeProps(
  node: DomNodeIR,
  ir: ComponentIR,
  component: string,
  depth: number,
  keyExpr?: string,
): string[] {
  const pad = INDENT.repeat(depth);
  const props: string[] = [];
  const styleKey = styleKeyForPart(node.part);
  const isRootNode = node === ir.dom;
  const dynamicStyleEntries = rnDynamicStyleEntries(node, ir, component);
  const dynamicStyle = dynamicStyleEntries.length > 0
    ? `, { ${dynamicStyleEntries.join(", ")} }`
    : "";
  const fillWidthBinding = node.cssVarBindings.find((binding) =>
    binding.varName.includes("fill-width"),
  );
  if (fillWidthBinding) {
    const fillExpr = bindingExpr(fillWidthBinding.value, ir);
    props.push(`${pad}style={[styles.${styleKey}, { width: \`\${Math.max(0, Math.min(100, Number(${fillExpr} ?? 0)))}%\` }]}`);
  } else if (isRootNode) {
    props.push(`${pad}testID={testID}`);
    props.push(`${pad}style={[styles.${styleKey}${dynamicStyle}, style]}`);
  } else if (dynamicStyleEntries.length > 0) {
    props.push(`${pad}style={[styles.${styleKey}${dynamicStyle}]}`);
  } else {
    props.push(`${pad}style={styles.${styleKey}}`);
  }
  if (keyExpr) props.unshift(`${pad}key={${keyExpr}}`);

  const accessibilityState: string[] = [];
  let hasAccessibilityLabel = false;
  let hasAccessibilityLabelledBy = false;
  for (const [name, value] of Object.entries(node.attrs)) {
    const mapped = staticAttributeProp(name, value);
    if (mapped) props.push(`${pad}${mapped}`);
  }
  for (const [name, binding] of Object.entries(node.bindings)) {
    const expr = bindingExpr(binding, ir);
    if (name === "disabled") {
      if (component === "TextInput") {
        const readOnly = textInputReadOnlyExpr(node, ir);
        props.push(`${pad}editable={!(${expr}${readOnly ? ` || ${readOnly}` : ""})}`);
      }
      else props.push(`${pad}disabled={${expr}}`);
      accessibilityState.push(`disabled: ${expr}`);
      continue;
    }
    if (name === "aria-label") {
      props.push(
        `${pad}accessibilityLabel={${isRootNode ? `accessibilityLabel ?? ${expr}` : expr}}`,
      );
      hasAccessibilityLabel = true;
      continue;
    }
    if (name === "aria-labelledby") {
      props.push(
        `${pad}accessibilityLabelledBy={${isRootNode ? `accessibilityLabelledBy ?? ${expr}` : expr}}`,
      );
      hasAccessibilityLabelledBy = true;
      continue;
    }
    if (name === "aria-checked") {
      accessibilityState.push(`checked: Boolean(${expr})`);
      continue;
    }
    if (name === "aria-expanded") {
      accessibilityState.push(`expanded: Boolean(${expr})`);
      continue;
    }
    if (name === "aria-pressed") {
      continue;
    }
    if (name === "aria-selected") {
      accessibilityState.push(`selected: Boolean(${expr})`);
      continue;
    }
    if (name === "aria-busy") {
      accessibilityState.push(`busy: Boolean(${expr})`);
      continue;
    }
    if (name === "checked") {
      accessibilityState.push(`checked: Boolean(${expr})`);
      continue;
    }
    if (name === "aria-valuenow") {
      props.push(`${pad}accessibilityValue={{ min: 0, max: 100, now: Number(${expr} ?? 0) }}`);
      continue;
    }
    if (name === "value" && component === "TextInput") {
      props.push(`${pad}value={String(${expr} ?? "")}`);
      continue;
    }
    if (name === "placeholder" && component === "TextInput") {
      props.push(`${pad}placeholder={${expr}}`);
      continue;
    }
    if (name === "src" && component === "RNImage") {
      props.push(`${pad}source={${expr} ? { uri: String(${expr}) } : undefined}`);
      continue;
    }
    if (name === "alt" && component === "RNImage") {
      props.push(
        `${pad}accessibilityLabel={${isRootNode ? `accessibilityLabel ?? ${expr}` : expr}}`,
      );
      hasAccessibilityLabel = true;
      continue;
    }
    if ((name === "width" || name === "height") && component === "RNImage") {
      continue;
    }
    if ((name === "loading" || name === "sizes") && component === "RNImage") {
      continue;
    }
    if (name === "type" && component === "TextInput") {
      props.push(`${pad}secureTextEntry={${expr} === "password"}`);
      continue;
    }
    if ((name === "aria-readonly" || name === "readonly") && component === "TextInput") {
      props.push(`${pad}readOnly={Boolean(${expr})}`);
      continue;
    }
    if (name === "href" && component === "Pressable") {
      props.push(`${pad}onPress={() => { if (${expr}) void Linking.openURL(String(${expr})); }}`);
      continue;
    }
  }
  for (const [eventName, binding] of Object.entries(node.events)) {
    const eventProp = eventPropFor(component, eventName);
    if (!eventProp) continue;
    props.push(`${pad}${eventProp}={${eventHandlerExpr(component, eventName, binding, ir)}}`);
  }
  const hasOnPressEvent = Object.keys(node.events).some(
    (eventName) => eventPropFor(component, eventName) === "onPress",
  );
  if (isRootNode && component === "Pressable" && node.tag !== "a" && !hasOnPressEvent) {
    props.push(`${pad}onPress={onPress}`);
  }
  if (isRootNode && !hasAccessibilityLabel) {
    props.push(`${pad}accessibilityLabel={accessibilityLabel}`);
  }
  if (isRootNode && !hasAccessibilityLabelledBy) {
    props.push(`${pad}accessibilityLabelledBy={accessibilityLabelledBy}`);
  }
  const role = node.attrs.role ?? roleFromNode(node);
  const accessibilityRole = rnAccessibilityRole(role, component);
  if (accessibilityRole) props.push(`${pad}accessibilityRole=${JSON.stringify(accessibilityRole)}`);
  if (accessibilityState.length > 0) {
    props.push(`${pad}accessibilityState={{ ${accessibilityState.join(", ")} }}`);
  }
  return props;
}

function rnComponentForNode(node: DomNodeIR): string {
  if (node.tag === "a") return "Pressable";
  if (node.tag === "input" && (node.attrs.type === "checkbox" || node.attrs.type === "radio")) return "Pressable";
  if (node.tag === "input") return "TextInput";
  if (node.tag === "img" || node.tag === "image") return "RNImage";
  if (node.tag === "button" || node.attrs.role === "button") return "Pressable";
  if (node.tag === "p" || node.tag === "strong" || node.tag === "em" || node.tag === "small") return "RNText";
  return "View";
}

function isSupportedBindingForComponent(name: string, component: string): boolean {
  if (name.startsWith("data-")) return false;
  if (name === "aria-pressed") return false;
  if (name === "aria-describedby") return false;
  if (name === "name" || name === "required" || name === "aria-invalid") return false;
  if (name === "htmlFor" || name === "form") return false;
  if (name === "type") return component === "TextInput";
  if (component === "RNImage") {
    return ["src", "alt", "width", "height"].includes(name);
  }
  if (component === "Pressable" && name === "href") return true;
  if (name === "target" || name === "rel") return false;
  if ((name === "aria-readonly" || name === "readonly") && component === "TextInput") {
    return true;
  }
  return !["src", "alt", "width", "height", "loading", "sizes"].includes(name);
}

function textInputReadOnlyExpr(node: DomNodeIR, ir: ComponentIR): string | undefined {
  const binding = node.bindings["aria-readonly"] ?? node.bindings.readonly;
  return binding ? `Boolean(${bindingExpr(binding, ir)})` : undefined;
}

function applyIfGuard(
  rendered: string,
  node: DomNodeIR,
  ir: ComponentIR,
  pad: string,
): string {
  if (!node.ifProp) return rendered;
  const expr = ifGuardExpr(node.ifProp, ir);
  const guard = node.ifNegated ? `!(${expr})` : expr;
  return [`${pad}{${guard} ? (`, rendered, `${pad}) : null}`].join("\n");
}

function ifGuardExpr(ifProp: string, ir: ComponentIR): string {
  if (ifProp === "children") return "children";
  const channel = channelForIfProp(ir, ifProp);
  if (channel) return channel.name;
  return safePropName(ir, ifProp);
}

function channelForIfProp(
  ir: ComponentIR,
  ifProp: string,
): NormalizedChannelIR | undefined {
  return ir.behavior.normalizedChannels.find(
    (channel) => channel.name === ifProp || channel.valueProp === ifProp,
  );
}

function rnDynamicStyleEntries(
  node: DomNodeIR,
  ir: ComponentIR,
  component: string,
): string[] {
  if (component !== "RNImage") return [];
  const entries: string[] = [];
  const width = node.bindings.width;
  const height = node.bindings.height;
  if (width) entries.push(`width: Number(${bindingExpr(width, ir)} ?? 0) || undefined`);
  if (height) entries.push(`height: Number(${bindingExpr(height, ir)} ?? 0) || undefined`);
  return entries;
}

function roleFromNode(node: DomNodeIR): string | undefined {
  if (node.tag === "a") return "link";
  if (node.tag === "button") return "button";
  if (node.tag === "img") return "image";
  if (node.tag === "input" && node.attrs.type === "checkbox") return "checkbox";
  return undefined;
}

function rnAccessibilityRole(role: string | undefined, component: string): string | undefined {
  if (!role) return component === "RNText" ? "text" : undefined;
  if (role === "presentation") return "none";
  if (role === "switch") return "switch";
  if (role === "button") return "button";
  if (role === "checkbox") return "checkbox";
  if (role === "progressbar") return "progressbar";
  if (role === "img") return "image";
  if (role === "link") return "link";
  if (role === "tab") return "tab";
  if (role === "menu") return "menu";
  if (role === "menuitem") return "menuitem";
  if (role === "alert") return "alert";
  return undefined;
}

function rootPressableAcceptsOnPress(ir: ComponentIR): boolean {
  if (!ir.dom) return false;
  if (ir.dom.tag === "a") return false;
  return rnComponentForNode(ir.dom) === "Pressable" && Object.keys(ir.dom.events).length === 0;
}

function rootStyleType(ir: ComponentIR): "ImageStyle" | "TextStyle" | "ViewStyle" {
  const component = ir.dom ? rnComponentForNode(ir.dom) : "View";
  if (component === "RNImage") return "ImageStyle";
  if (component === "RNText") return "TextStyle";
  return "ViewStyle";
}

function staticAttributeProp(name: string, value: string): string | null {
  if (name === "id") return `nativeID=${JSON.stringify(value)}`;
  if (name === "aria-hidden" && value === "true") return "accessible={false}";
  if (name === "alt") return `accessibilityLabel=${JSON.stringify(value)}`;
  return null;
}

function eventPropFor(component: string, eventName: string): string | null {
  if (
    component === "Pressable" &&
    (eventName === "click" || eventName === "press" || eventName === "change")
  ) {
    return "onPress";
  }
  if (component === "TextInput" && (eventName === "input" || eventName === "change")) {
    return "onChangeText";
  }
  return null;
}

function eventHandlerExpr(
  component: string,
  eventName: string,
  binding: BindingExpression,
  ir: ComponentIR,
): string {
  if (binding.kind === "prop") {
    const propName = safePropName(ir, binding.prop);
    return `() => ${propName}?.()`;
  }
  if (binding.kind === "channel" && binding.field === "onChange") {
      const channel = ir.behavior.normalizedChannels.find((c) => c.name === binding.channel);
    if (channel) {
      const setter = `set${capitalize(channel.name)}Value`;
      if (
        component === "Pressable" ||
        eventName === "click" ||
        eventName === "press"
      ) {
        return channel.valueType === "boolean"
          ? `() => ${setter}(!${channel.name})`
          : `() => ${setter}(${channel.name})`;
      }
      return `(next: ${tsTypeForChannel(ir, channel)}) => ${setter}(next)`;
    }
  }
  return "() => undefined";
}

function bindingExpr(binding: BindingExpression, ir: ComponentIR): string {
  if (binding.kind === "prop") {
    const propName = safePropName(ir, binding.prop);
    if (
      propName === "showMoreLabel" &&
      ir.styledProps.some((prop) => prop.safeName === "showLessLabel") &&
      ir.behavior.normalizedChannels.some((channel) => channel.name === "expanded")
    ) {
      return "(expanded ? showLessLabel : showMoreLabel)";
    }
    return pathExpr(propName, binding.path);
  }
  if (binding.kind === "channel") {
    if (binding.field === "value") return pathExpr(binding.channel, binding.path);
    if (binding.field === "defaultValue") return pathExpr(binding.channel, binding.path);
    return binding.channel;
  }
  if (binding.kind === "literal") return JSON.stringify(binding.value);
  if (binding.kind === "iterationLocal") {
    return pathExpr(binding.local, binding.path);
  }
  const left = bindingExpr(binding.left, ir);
  const right = bindingExpr(binding.right, ir);
  if (binding.op === "eq") return `${left} === ${right}`;
  if (binding.op === "contains") return `Array.isArray(${left}) && ${left}.includes(${right})`;
  return `Array.isArray(${right}) ? ${right}.includes(${left}) : ${left} === ${right}`;
}

function pathExpr(base: string, path: string[] | undefined): string {
  if (!path || path.length === 0) return base;
  return [base, ...path].join(".");
}

function safePropName(ir: ComponentIR, propName: string): string {
  return ir.styledProps.find((p) => p.name === propName)?.safeName ?? propName;
}

function emitIteration(node: DomNodeIR, ir: ComponentIR, depth: number): string {
  const iteration = node.iteration;
  if (!iteration) return emitNode({ ...node, iteration: undefined }, ir, depth) ?? "";
  const pad = INDENT.repeat(depth);
  const childNode: DomNodeIR = { ...node, iteration: undefined };
  const indexVar = iteration.indexVar;
  const rendered = emitNode(childNode, ir, depth + 2, indexVar) ?? "";
  if (iteration.kind === "array") {
    const source = bindingExpr(iteration.source, ir);
    const itemVar = iteration.itemVar ?? "item";
    return [
      `${pad}{(${source} ?? []).map((${itemVar}, ${indexVar}) => (`,
      rendered,
      `${pad}${INDENT}))}`,
    ].join("\n");
  }
  const source = bindingExpr(iteration.source, ir);
  return [
    `${pad}{Array.from({ length: Number(${source} ?? 0) }).map((_, ${indexVar}) => (`,
    rendered,
    `${pad}${INDENT}))}`,
  ].join("\n");
}

function generateReactNativeStylesFile(ir: ComponentIR): string {
  const keys = new Set<string>(["root"]);
  for (const part of ir.parts) keys.add(styleKeyForPart(part.name));
  if (isCheckboxRootPattern(ir)) {
    keys.add("indicator_checked");
    keys.add("indicatorMark");
    keys.add("label");
  }
  if (usesNativeToggle(ir)) {
    for (const value of Object.values(ir.variants).flat()) {
      keys.add(`root_${sanitizeStyleKey(value)}`);
    }
  }
  const lines = [
    "// @generated:start imports",
    `import { StyleSheet } from "react-native";`,
    `import type { FsdsTheme } from "../../tokens";`,
    `import { resolve${ir.name}Tokens } from "./${ir.name}.tokens";`,
    "// @generated:end",
    "",
    "// @generated:start styles",
    `export function create${ir.name}Styles(theme?: FsdsTheme) {`,
    `${INDENT}const tokens = resolve${ir.name}Tokens(theme);`,
    `${INDENT}return StyleSheet.create({`,
  ];
  for (const key of Array.from(keys).sort()) {
    const style = usesNativeToggle(ir) && key.startsWith("root_")
      ? nativeToggleSizeStyle(ir, key.slice("root_".length))
      : nativeStyleForKey(ir, key);
    lines.push(`${INDENT}${INDENT}${key}: ${style},`);
  }
  lines.push(`${INDENT}});`);
  lines.push("}");
  lines.push("");
  lines.push(`export const styles = create${ir.name}Styles();`);
  lines.push("// @generated:end");
  return lines.join("\n") + "\n";
}

function nativeStyleForKey(ir: ComponentIR, key: string): string {
  const entries: string[] = [];
  const scope = key.includes("_") ? key.slice(0, key.indexOf("_")) : key;
  if (key === "root" || key === "input" || key === "control") {
    const isCheckboxInput = key === "input" && isCheckboxRootPattern(ir);
    if (!isCheckboxInput) {
      pushStyle(entries, "paddingTop", tokenNumberAccessForStyle(ir, scope, "box-model.padding-block-start"));
      pushStyle(entries, "paddingBottom", tokenNumberAccessForStyle(ir, scope, "box-model.padding-block-end"));
      pushStyle(entries, "minHeight", tokenNumberAccessForStyle(ir, scope, "box-model.min-height"));
    }
    pushStyle(entries, "paddingLeft", tokenNumberAccessForStyle(ir, scope, "box-model.padding-inline-start"));
    pushStyle(entries, "paddingRight", tokenNumberAccessForStyle(ir, scope, "box-model.padding-inline-end"));
    pushStyle(entries, "gap", tokenNumberAccessForStyle(ir, scope, "box-model.gap"));
    pushStyle(entries, "minWidth", tokenNumberAccessForStyle(ir, scope, "box-model.min-width"));
    if (!isCheckboxInput) {
      pushStyle(entries, "backgroundColor", tokenStringByName(ir, scope, [
        ".color.background.default",
        ".color.bg.default",
        ".color.bg",
      ]));
      pushStyle(entries, "borderColor", tokenStringByName(ir, scope, [
        ".color.border.default",
        ".color.border",
      ]));
      pushStyle(entries, "borderWidth", tokenNumberByName(ir, scope, [
        ".border.width",
        ".size.border",
      ]));
      pushStyle(entries, "borderRadius", tokenNumberByName(ir, scope, [
        ".border.radius",
        ".size.radius",
        ".radius.default",
        ".radius",
      ]));
    }
  }
  if (key === "root" && rnComponentForNode(ir.dom ?? fallbackViewNode()) === "Pressable") {
    entries.push("alignItems: \"center\"", "justifyContent: \"center\"");
  }
  if (key === "input" && isCheckboxRootPattern(ir)) {
    entries.push("alignItems: \"center\"", "flexDirection: \"row\"");
  }
  if (key === "indicator") {
    entries.push("alignItems: \"center\"", "height: 20", "justifyContent: \"center\"", "width: 20");
    pushStyle(entries, "backgroundColor", tokenStringByName(ir, "root", [".color.background.default"]));
    pushStyle(entries, "borderColor", tokenStringByName(ir, "root", [".color.border.default"]));
    pushStyle(entries, "borderWidth", tokenNumberByName(ir, "root", [".border.width"]));
    pushStyle(entries, "borderRadius", tokenNumberByName(ir, "root", [".border.radius"]));
  }
  if (key === "indicator_checked") {
    pushStyle(entries, "backgroundColor", tokenStringByName(ir, "root", [
      ".color.border.default",
      ".color.background.default",
    ]));
  }
  if (key === "indicatorMark") {
    entries.push("color: \"#ffffff\"", "fontSize: 12", "fontWeight: \"700\"", "lineHeight: 16");
  }
  if (key === "label" || key === "help" || key === "error" || key === "validatingIndicator") {
    pushStyle(entries, "color", tokenStringByName(ir, "root", [
      key === "error" ? ".color.invalid-text" : "",
      key === "label" ? ".label.color" : "",
      ".color.fg",
      ".color.text.default",
      ".color.foreground.default",
    ].filter(Boolean)));
  }
  if (key === "root" && isFieldLayoutPattern(ir)) {
    entries.push("flexDirection: \"column\"");
    pushStyle(entries, "gap", tokenNumberByName(ir, "root", [".gap.y", ".gap"]));
  }
  if (key === "meta") {
    entries.push("flexDirection: \"column\"");
    pushStyle(entries, "gap", tokenNumberByName(ir, "root", [".gap.meta"]));
  }
  return entries.length > 0 ? `{ ${entries.join(", ")} }` : "{}";
}

function fallbackViewNode(): DomNodeIR {
  return {
    attrs: {},
    bindings: {},
    children: [],
    content: undefined,
    cssVarBindings: [],
    events: {},
    ifNegated: false,
    ifProp: undefined,
    iteration: undefined,
    part: "root",
    slotName: undefined,
    tag: "div",
  };
}

function pushStyle(entries: string[], prop: string, value: string | undefined): void {
  if (value === undefined) return;
  const existingIndex = entries.findIndex((entry) => entry.startsWith(`${prop}: `));
  const next = `${prop}: ${value}`;
  if (existingIndex >= 0) {
    entries[existingIndex] = next;
  } else {
    entries.push(next);
  }
}

function tokenNumberAccessForStyle(
  ir: ComponentIR,
  scope: string,
  name: string,
): string | undefined {
  return tokenNumberAccess(ir, scope, name) ?? tokenNumberAccess(ir, "root", name);
}

function tokenByName(
  ir: ComponentIR,
  scope: string,
  predicates: string[],
): string | undefined {
  const scopes = [scope, "root"].filter((value, index, array) => array.indexOf(value) === index);
  for (const scopeName of scopes) {
    const tokenScope = ir.tokenScopes.find((candidate) => candidate.scope === scopeName);
    if (!tokenScope) continue;
    for (const predicate of predicates) {
      const match = tokenScope.values.find((value) =>
        value.name.endsWith(predicate) || value.name.includes(predicate),
      );
      if (match) return match.name;
    }
  }
  return undefined;
}

function tokenNumberByName(
  ir: ComponentIR,
  scope: string,
  predicates: string[],
): string | undefined {
  const name = tokenByName(ir, scope, predicates);
  return name ? tokenNumberAccess(ir, scope, name) ?? tokenNumberAccess(ir, "root", name) : undefined;
}

function tokenStringByName(
  ir: ComponentIR,
  scope: string,
  predicates: string[],
): string | undefined {
  const name = tokenByName(ir, scope, predicates);
  return name ? tokenStringAccess(ir, scope, name) ?? tokenStringAccess(ir, "root", name) : undefined;
}

function nativeToggleSizeStyle(ir: ComponentIR, variant: string): string {
  const width = tokenNumberAccess(ir, "root", `${ir.cssPrefix}.size.${variant}.track.width`);
  const height = tokenNumberAccess(ir, "root", `${ir.cssPrefix}.size.${variant}.track.height`);
  const entries: string[] = [];
  if (width !== undefined) entries.push(`width: ${width}`);
  if (height !== undefined) entries.push(`height: ${height}`);
  return entries.length > 0 ? `{ ${entries.join(", ")} }` : "{}";
}

function generateReactNativeTokensFile(ir: ComponentIR): string {
  const lines = [
    "// @generated:start imports",
    `import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";`,
    "// @generated:end",
    "",
    "// @generated:start tokens",
    `export const ${tokenConstName(ir)} = {`,
  ];
  for (const scope of ir.tokenScopes) {
    if (scope.values.length === 0) continue;
    lines.push(`${INDENT}${JSON.stringify(scope.scope)}: {`);
    for (const value of scope.values) {
      lines.push(`${INDENT}${INDENT}${JSON.stringify(value.name)}: {`);
      lines.push(`${INDENT}${INDENT}${INDENT}name: ${JSON.stringify(value.name)},`);
      lines.push(`${INDENT}${INDENT}${INDENT}cssVar: ${JSON.stringify(value.cssVar)},`);
      if (value.resolvesTo) {
        lines.push(`${INDENT}${INDENT}${INDENT}ref: ${JSON.stringify(value.resolvesTo)},`);
      }
      if (value.rawValue !== undefined) {
        const nativeValue = nativeTokenLiteral(value.rawValue);
        lines.push(`${INDENT}${INDENT}${INDENT}${value.isLiteral ? "literal" : "fallback"}: ${nativeValue},`);
      }
      lines.push(`${INDENT}${INDENT}},`);
    }
    lines.push(`${INDENT}},`);
  }
  lines.push("} satisfies ComponentTokenScopes;");
  lines.push("");
  lines.push(`export function resolve${ir.name}Tokens(theme?: FsdsTheme) {`);
  lines.push(`${INDENT}return resolveComponentTokens(${tokenConstName(ir)}, theme);`);
  lines.push("}");
  lines.push("// @generated:end");
  return lines.join("\n") + "\n";
}

function tokenConstName(ir: ComponentIR): string {
  return `${ir.cssPrefix.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}TokenScopes`;
}

function styleKeyForPart(part: string | undefined): string {
  if (!part || part === "root") return "root";
  return sanitizeStyleKey(part);
}

function variantStyleExpression(ir: ComponentIR): string {
  const sizeProp = ir.styledProps.find((p) => p.name === "size");
  if (!sizeProp) return "styles.root";
  return `styles[\`root_\${${sizeProp.safeName}}\`] ?? styles.root`;
}

function usesNativeToggle(ir: ComponentIR): boolean {
  return collectCollapseIntents(ir).has("native-toggle-affordance");
}

function isCheckboxRootPattern(ir: ComponentIR): boolean {
  return ir.dom?.tag === "input" && ir.dom.attrs.type === "checkbox";
}

function isFieldLayoutPattern(ir: ComponentIR): boolean {
  const partNames = new Set(ir.parts.map((part) => part.name));
  const propNames = new Set(ir.styledProps.map((prop) => prop.safeName));
  return (
    partNames.has("label") &&
    partNames.has("control") &&
    partNames.has("meta") &&
    propNames.has("label") &&
    propNames.has("helpText") &&
    propNames.has("error")
  );
}

function findProp(ir: ComponentIR, name: string): ResolvedPropIR | undefined {
  return ir.styledProps.find((p) => p.name === name);
}

function tokenAccess(
  ir: ComponentIR,
  scope: string,
  name: string,
): string | undefined {
  if (!hasToken(ir, scope, name)) return undefined;
  return `tokens.${scope}?.[${JSON.stringify(name)}]`;
}

function tokenNumberAccess(
  ir: ComponentIR,
  scope: string,
  name: string,
): string | undefined {
  const access = tokenAccess(ir, scope, name);
  return access ? `(${access} as number | undefined)` : undefined;
}

function tokenStringAccess(
  ir: ComponentIR,
  scope: string,
  name: string,
): string | undefined {
  const access = tokenAccess(ir, scope, name);
  return access ? `(${access} as string | undefined)` : undefined;
}

function tokenStringFallbackAccess(
  ir: ComponentIR,
  name: string,
  scopes: string[],
): string | undefined {
  const accesses = scopes
    .map((scope) => tokenStringAccess(ir, scope, name))
    .filter((value): value is string => value !== undefined);
  return accesses.length > 0 ? accesses.join(" ?? ") : undefined;
}

function hasToken(ir: ComponentIR, scope: string, name: string): boolean {
  return ir.tokenScopes.some((tokenScope) =>
    tokenScope.scope === scope && tokenScope.values.some((value) => value.name === name),
  );
}

function maxLinesExpressionForNode(node: DomNodeIR, ir: ComponentIR): string | undefined {
  const binding = node.cssVarBindings.find((item) =>
    item.varName.includes("max-lines") || item.varName.includes("content-lines"),
  );
  if (!binding) return undefined;
  const maxLines = bindingExpr(binding.value, ir);
  const expandedChannel = ir.behavior.normalizedChannels.find(
    (channel) => channel.name === "expanded",
  );
  return expandedChannel ? `${expandedChannel.name} ? undefined : ${maxLines}` : maxLines;
}

function nativeTokenLiteral(rawValue: string): string {
  if (rawValue.trim() === "0") return "0";
  const px = /^(-?\d+(?:\.\d+)?)px$/.exec(rawValue.trim());
  if (px) return px[1]!;
  const rem = /^(-?\d+(?:\.\d+)?)rem$/.exec(rawValue.trim());
  if (rem) return String(Number(rem[1]) * 16);
  return JSON.stringify(rawValue);
}

function tsTypeForChannel(ir: ComponentIR, channel: NormalizedChannelIR): string {
  const prop = ir.styledProps.find((p) => p.name === channel.valueProp);
  if (prop) return rnPropType(ir, prop);
  if (channel.valueType === "boolean") return "boolean";
  if (channel.valueType === "number") return "number";
  if (channel.valueType === "string") return "string";
  return "unknown";
}

function defaultForChannel(channel: NormalizedChannelIR): string {
  if (channel.valueType === "boolean") return "false";
  if (channel.valueType === "number") return "0";
  if (channel.valueType === "string") return '""';
  return "undefined";
}

function sanitizeStyleKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9_$]/g, "_");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
