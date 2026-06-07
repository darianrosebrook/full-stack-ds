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
  const rnImports = new Set(["StyleProp", "View", "ViewStyle"]);
  if (usesNativeToggle(ir)) {
    rnImports.add("Switch as RNSwitch");
  } else {
    collectRnComponents(ir.dom, rnImports);
  }
  if (hasChildrenSlotUnderNonTextParent(ir.dom)) rnImports.add("Text as RNText");
  if (rootPressableAcceptsOnPress(ir)) rnImports.add("GestureResponderEvent");
  const reactImports = new Set(["ReactNode"]);
  if (ir.behavior.normalizedChannels.length > 0) {
    reactImports.add("useCallback");
    reactImports.add("useState");
  }
  reactImports.add("useMemo");

  return [
    "// @generated:start imports",
    `import { ${Array.from(rnImports).sort().join(", ")} } from "react-native";`,
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

function hasChildrenSlotUnderNonTextParent(node: DomNodeIR | undefined): boolean {
  if (!node) return false;
  const component = rnComponentForNode(node);
  if (component !== "RNText" && node.children.length === 0 && node.part === "root") {
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
  lines.push(`${INDENT}style?: StyleProp<ViewStyle>;`);
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

function emitComponent(ir: ComponentIR): string {
  const lines = ["// @generated:start component"];
  const destructured = propDestructureEntries(ir);
  lines.push(`export function ${ir.name}({`);
  for (const entry of destructured) lines.push(`${INDENT}${entry},`);
  lines.push(`}: ${ir.name}Props) {`);
  lines.push(`${INDENT}const fsdsTheme = useFsdsTheme();`);
  lines.push(`${INDENT}const styles = useMemo(() => create${ir.name}Styles(fsdsTheme), [fsdsTheme]);`);
  if (usesNativeToggle(ir)) {
    lines.push(`${INDENT}const tokens = useMemo(() => resolve${ir.name}Tokens(fsdsTheme), [fsdsTheme]);`);
  }
  for (const channel of ir.behavior.normalizedChannels) {
    lines.push(...emitChannelState(ir, channel));
  }
  if (usesNativeToggle(ir)) {
    lines.push(...emitNativeToggleReturn(ir));
  } else {
    const rendered = emitNode(ir.dom, ir, 2) ?? `${INDENT}${INDENT}<View testID={testID} style={[styles.root, style]}>{children}</View>`;
    lines.push(`${INDENT}return (`);
    lines.push(rendered);
    lines.push(`${INDENT});`);
  }
  lines.push("}");
  lines.push("// @generated:end");
  return lines.join("\n");
}

function propDestructureEntries(ir: ComponentIR): string[] {
  const entries: string[] = [];
  const emitted = new Set<string>();
  for (const prop of ir.styledProps) {
    if (RESERVED_PROPS.has(prop.name)) continue;
    const channel = ir.behavior.normalizedChannels.find((c) => c.valueProp === prop.name);
    if (channel) {
      entries.push(`${prop.safeName}: controlled${capitalize(channel.name)}`);
    } else {
      const suffix = prop.defaultExpr ? ` = ${prop.defaultExpr}` : "";
      entries.push(`${prop.safeName}${suffix}`);
    }
    emitted.add(prop.safeName);
  }
  for (const channel of ir.behavior.normalizedChannels) {
    if (channel.defaultValueProp && !emitted.has(channel.defaultValueProp)) {
      entries.push(
        `${channel.defaultValueProp} = ${defaultForChannel(channel)}`,
      );
      emitted.add(channel.defaultValueProp);
    }
    if (!emitted.has(channel.changeHandlerProp)) {
      entries.push(channel.changeHandlerProp);
      emitted.add(channel.changeHandlerProp);
    }
  }
  entries.push("children");
  if (rootPressableAcceptsOnPress(ir)) entries.push("onPress");
  entries.push("style", "testID", "accessibilityLabel", "accessibilityLabelledBy");
  return entries;
}

function emitChannelState(ir: ComponentIR, channel: NormalizedChannelIR): string[] {
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
  lines.push(`${INDENT}const [${internal}, ${setInternal}] = useState<${type}>((${initial}) as ${type});`);
  lines.push(`${INDENT}const ${value} = ${controlled} ?? ${internal};`);
  lines.push(`${INDENT}const ${setter} = useCallback((next: ${type}) => {`);
  lines.push(`${INDENT}${INDENT}if (${controlled} === undefined) ${setInternal}(next);`);
  lines.push(`${INDENT}${INDENT}${handler}?.(next);`);
  lines.push(`${INDENT}}, [${controlled}, ${handler}]);`);
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

function emitNode(node: DomNodeIR | undefined, ir: ComponentIR, depth: number): string | null {
  if (!node) return null;
  if (node.tag === "children" || node.tag === "slot") return `${INDENT.repeat(depth)}{children}`;
  if (node.iteration) return emitIteration(node, ir, depth);

  const component = rnComponentForNode(node);
  const attrs = emitNodeProps(node, ir, component, depth + 1);
  const childLines = emitNodeChildren(node, ir, depth + 1);
  const pad = INDENT.repeat(depth);
  if (VOID_RN_COMPONENTS.has(component) || childLines.length === 0) {
    return [`${pad}<${component}`, ...attrs, `${pad}/>`].join("\n");
  }
  return [`${pad}<${component}`, ...attrs, `${pad}>`, ...childLines, `${pad}</${component}>`].join("\n");
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
): string[] {
  const pad = INDENT.repeat(depth);
  const props: string[] = [];
  const styleKey = styleKeyForPart(node.part);
  const isRootNode = node === ir.dom;
  const fillWidthBinding = node.cssVarBindings.find((binding) =>
    binding.varName.includes("fill-width"),
  );
  if (fillWidthBinding) {
    const fillExpr = bindingExpr(fillWidthBinding.value, ir);
    props.push(`${pad}style={[styles.${styleKey}, { width: \`\${Math.max(0, Math.min(100, Number(${fillExpr} ?? 0)))}%\` }]}`);
  } else if (isRootNode) {
    props.push(`${pad}testID={testID}`);
    props.push(`${pad}style={[styles.${styleKey}, style]}`);
  } else {
    props.push(`${pad}style={styles.${styleKey}}`);
  }

  const accessibilityState: string[] = [];
  for (const [name, value] of Object.entries(node.attrs)) {
    const mapped = staticAttributeProp(name, value);
    if (mapped) props.push(`${pad}${mapped}`);
  }
  for (const [name, binding] of Object.entries(node.bindings)) {
    const expr = bindingExpr(binding, ir);
    if (name === "disabled") {
      if (component === "TextInput") props.push(`${pad}editable={!${expr}}`);
      else props.push(`${pad}disabled={${expr}}`);
      accessibilityState.push(`disabled: ${expr}`);
      continue;
    }
    if (name === "aria-label") {
      props.push(`${pad}accessibilityLabel={${expr}}`);
      continue;
    }
    if (name === "aria-labelledby") {
      props.push(`${pad}accessibilityLabelledBy={${expr}}`);
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
    if (name === "type" && component === "TextInput") {
      props.push(`${pad}secureTextEntry={${expr} === "password"}`);
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
  if (isRootNode && component === "Pressable" && !hasOnPressEvent) {
    props.push(`${pad}onPress={onPress}`);
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
  if (node.tag === "input" && (node.attrs.type === "checkbox" || node.attrs.type === "radio")) return "Pressable";
  if (node.tag === "input") return "TextInput";
  if (node.tag === "img" || node.tag === "image") return "RNImage";
  if (node.tag === "button" || node.attrs.role === "button") return "Pressable";
  if (node.tag === "p" || node.tag === "strong" || node.tag === "em" || node.tag === "small") return "RNText";
  return "View";
}

function roleFromNode(node: DomNodeIR): string | undefined {
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
  return rnComponentForNode(ir.dom) === "Pressable" && Object.keys(ir.dom.events).length === 0;
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
    return binding.local === "item"
      ? pathExprAny(binding.local, binding.path)
      : pathExpr(binding.local, binding.path);
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

function pathExprAny(base: string, path: string[] | undefined): string {
  if (!path || path.length === 0) return base;
  return [`(${base} as any)`, ...path].join(".");
}

function safePropName(ir: ComponentIR, propName: string): string {
  return ir.styledProps.find((p) => p.name === propName)?.safeName ?? propName;
}

function emitIteration(node: DomNodeIR, ir: ComponentIR, depth: number): string {
  const iteration = node.iteration;
  if (!iteration) return emitNode({ ...node, iteration: undefined }, ir, depth) ?? "";
  const pad = INDENT.repeat(depth);
  const childNode: DomNodeIR = { ...node, iteration: undefined };
  const rendered = emitNode(childNode, ir, depth + 2) ?? "";
  const indexVar = iteration.indexVar;
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
      : "{}";
    lines.push(`${INDENT}${INDENT}${key}: ${style},`);
  }
  lines.push(`${INDENT}});`);
  lines.push("}");
  lines.push("");
  lines.push(`export const styles = create${ir.name}Styles();`);
  lines.push("// @generated:end");
  return lines.join("\n") + "\n";
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
  const binding = node.cssVarBindings.find((item) => item.varName.includes("max-lines"));
  if (!binding) return undefined;
  const maxLines = bindingExpr(binding.value, ir);
  const expandedChannel = ir.behavior.normalizedChannels.find(
    (channel) => channel.name === "expanded",
  );
  return expandedChannel ? `${expandedChannel.name} ? undefined : ${maxLines}` : maxLines;
}

function nativeTokenLiteral(rawValue: string): string {
  const px = /^(-?\d+(?:\.\d+)?)px$/.exec(rawValue.trim());
  if (px) return px[1]!;
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
