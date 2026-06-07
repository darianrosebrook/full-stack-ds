import type { ComponentIR } from "../../ir.js";
import { collectCollapseIntents } from "../../ir.js";

export function generateReactNativeTest(ir: ComponentIR): string {
  const runtimeTest = runtimeTestBody(ir);
  if (runtimeTest) return runtimeTest;
  return [
    "// @generated:start imports",
    `import { describe, it } from "vitest";`,
    `import type { ComponentProps } from "react";`,
    `import { ${ir.name} } from "../${ir.name}";`,
    "// @generated:end",
    "",
    "// @generated:start tests",
    `describe("${ir.name} React Native type surface", () => {`,
    `${INDENT}it("accepts generated props", () => {`,
    `${INDENT}${INDENT}type ${ir.name}SmokeProps = ComponentProps<typeof ${ir.name}>;`,
    `${INDENT}${INDENT}const smokeProps = {} as ${ir.name}SmokeProps;`,
    `${INDENT}${INDENT}void smokeProps;`,
    `${INDENT}});`,
    `});`,
    "// @generated:end",
    "",
  ].join("\n");
}

function runtimeTestBody(ir: ComponentIR): string | null {
  if (isNativeToggle(ir)) return nativeToggleTest(ir);
  if (isTextInput(ir)) return textInputTest(ir);
  if (isCheckbox(ir)) return checkboxTest(ir);
  if (isFieldLayoutPattern(ir)) return fieldLayoutTest(ir);
  if (isButton(ir)) return buttonTest(ir);
  if (isProgressbar(ir)) return progressTest(ir);
  if (isExpandableDisclosure(ir)) return expandableTest(ir);
  return null;
}

function renderImports(ir: ComponentIR): string[] {
  return [
    "// @generated:start imports",
    `import { describe, expect, it } from "vitest";`,
    `import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";`,
    `import { ${ir.name} } from "../${ir.name}";`,
    "// @generated:end",
    "",
    "// @generated:start tests",
  ];
}

function renderFooter(): string[] {
  return ["// @generated:end", ""];
}

function rendererHelper(jsx: string): string[] {
  return [
    `${INDENT}let renderer: ReactTestRenderer | undefined;`,
    `${INDENT}act(() => {`,
    `${INDENT}${INDENT}renderer = TestRenderer.create(${jsx});`,
    `${INDENT}});`,
  ];
}

const INDENT = "  ";

function nativeToggleTest(ir: ComponentIR): string {
  return [
    ...renderImports(ir),
    `describe("${ir.name} React Native", () => {`,
    `${INDENT}it("renders native switch state and change handler", () => {`,
    ...rendererHelper(`<${ir.name} checked={false} onChange={() => undefined} testID="subject" />`),
    `${INDENT}${INDENT}const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;`,
    `${INDENT}${INDENT}expect(subject.props.accessibilityRole).toBe("switch");`,
    `${INDENT}${INDENT}expect(subject.props.value).toBe(false);`,
    `${INDENT}${INDENT}expect(subject.props.onValueChange).toEqual(expect.any(Function));`,
    `${INDENT}});`,
    `});`,
    ...renderFooter(),
  ].join("\n");
}

function textInputTest(ir: ComponentIR): string {
  return [
    ...renderImports(ir),
    `describe("${ir.name} React Native", () => {`,
    `${INDENT}it("renders text input value and change handler", () => {`,
    ...rendererHelper(`<${ir.name} value="Ada" onChange={() => undefined} placeholder="Name" testID="subject" />`),
    `${INDENT}${INDENT}const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;`,
    `${INDENT}${INDENT}expect(subject.props.value).toBe("Ada");`,
    `${INDENT}${INDENT}expect(subject.props.placeholder).toBe("Name");`,
    `${INDENT}${INDENT}expect(subject.props.onChangeText).toEqual(expect.any(Function));`,
    `${INDENT}});`,
    `});`,
    ...renderFooter(),
  ].join("\n");
}

function checkboxTest(ir: ComponentIR): string {
  return [
    ...renderImports(ir),
    `describe("${ir.name} React Native", () => {`,
    `${INDENT}it("renders checkbox semantics and press handler", () => {`,
    ...rendererHelper(`<${ir.name} checked={true} onChange={() => undefined} testID="subject" />`),
    `${INDENT}${INDENT}const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;`,
    `${INDENT}${INDENT}expect(subject.props.accessibilityRole).toBe("checkbox");`,
    `${INDENT}${INDENT}expect(subject.props.accessibilityState).toMatchObject({ checked: true });`,
    `${INDENT}${INDENT}expect(subject.props.onPress).toEqual(expect.any(Function));`,
    `${INDENT}${INDENT}expect(renderer!.root.findAll((node) => node.props.children === "x").length).toBeGreaterThan(0);`,
    `${INDENT}});`,
    `});`,
    ...renderFooter(),
  ].join("\n");
}

function fieldLayoutTest(ir: ComponentIR): string {
  return [
    ...renderImports(ir),
    `describe("${ir.name} React Native", () => {`,
    `${INDENT}it("renders label, control, help, and error slots from props", () => {`,
    ...rendererHelper(`<${ir.name} name="email" label="Email" helpText="Use work email" error="Required" testID="subject">Control</${ir.name}>`),
    `${INDENT}${INDENT}const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;`,
    `${INDENT}${INDENT}expect(subject).toBeTruthy();`,
    `${INDENT}${INDENT}expect(renderer!.root.findAll((node) => node.props.children === "Email").length).toBeGreaterThan(0);`,
    `${INDENT}${INDENT}expect(renderer!.root.findAll((node) => node.props.children === "Control").length).toBeGreaterThan(0);`,
    `${INDENT}${INDENT}expect(renderer!.root.findAll((node) => node.props.children === "Use work email").length).toBeGreaterThan(0);`,
    `${INDENT}${INDENT}expect(renderer!.root.findAll((node) => node.props.children === "Required").length).toBeGreaterThan(0);`,
    `${INDENT}});`,
    `});`,
    ...renderFooter(),
  ].join("\n");
}

function buttonTest(ir: ComponentIR): string {
  return [
    ...renderImports(ir),
    `describe("${ir.name} React Native", () => {`,
    `${INDENT}it("renders button semantics and press passthrough", () => {`,
    ...rendererHelper(`<${ir.name} onPress={() => undefined} testID="subject">Save</${ir.name}>`),
    `${INDENT}${INDENT}const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;`,
    `${INDENT}${INDENT}expect(subject.props.accessibilityRole).toBe("button");`,
    `${INDENT}${INDENT}expect(subject.props.onPress).toEqual(expect.any(Function));`,
    `${INDENT}${INDENT}expect(renderer!.root.findAll((node) => node.props.children === "Save").length).toBeGreaterThan(0);`,
    `${INDENT}});`,
    `});`,
    ...renderFooter(),
  ].join("\n");
}

function progressTest(ir: ComponentIR): string {
  return [
    ...renderImports(ir),
    `describe("${ir.name} React Native", () => {`,
    `${INDENT}it("renders progressbar accessibility value and fill width", () => {`,
    ...rendererHelper(`<${ir.name} value={42} label="Loading" testID="subject" />`),
    `${INDENT}${INDENT}const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;`,
    `${INDENT}${INDENT}expect(subject.props.accessibilityRole).toBe("progressbar");`,
    `${INDENT}${INDENT}expect(subject.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 42 });`,
    `${INDENT}${INDENT}const fill = renderer!.root.findAll((node) => Array.isArray(node.props.style) && node.props.style.some((entry: { width?: string }) => entry?.width === "42%"))[0];`,
    `${INDENT}${INDENT}expect(fill).toBeTruthy();`,
    `${INDENT}});`,
    `});`,
    ...renderFooter(),
  ].join("\n");
}

function expandableTest(ir: ComponentIR): string {
  return [
    ...renderImports(ir),
    `describe("${ir.name} React Native", () => {`,
    `${INDENT}it("renders collapsed content and expanded trigger state", () => {`,
    ...rendererHelper(`<${ir.name} expanded={false} maxLines={2} showMoreLabel="More" showLessLabel="Less" testID="subject">Long copy</${ir.name}>`),
    `${INDENT}${INDENT}const trigger = renderer!.root.findByProps({ accessibilityRole: "button" });`,
    `${INDENT}${INDENT}expect(trigger.props.accessibilityState).toMatchObject({ expanded: false });`,
    `${INDENT}${INDENT}expect(renderer!.root.findAll((node) => node.props.children === "More").length).toBeGreaterThan(0);`,
    `${INDENT}${INDENT}const content = renderer!.root.findAll((node) => node.props.children === "Long copy").at(-1);`,
    `${INDENT}${INDENT}expect(content?.props.numberOfLines).toBe(2);`,
    `${INDENT}});`,
    `});`,
    ...renderFooter(),
  ].join("\n");
}

function isNativeToggle(ir: ComponentIR): boolean {
  return collectCollapseIntents(ir).has("native-toggle-affordance");
}

function isTextInput(ir: ComponentIR): boolean {
  return ir.dom?.tag === "input" && ir.dom.attrs.type !== "checkbox" && Boolean(ir.behavior.normalizedChannels[0]);
}

function isCheckbox(ir: ComponentIR): boolean {
  return ir.dom?.tag === "input" && ir.dom.attrs.type === "checkbox";
}

function isButton(ir: ComponentIR): boolean {
  return (
    ir.behavior.normalizedChannels.length === 0 &&
    (ir.dom?.tag === "button" || ir.dom?.attrs.role === "button")
  );
}

function isProgressbar(ir: ComponentIR): boolean {
  return ir.dom?.attrs.role === "progressbar";
}

function isExpandableDisclosure(ir: ComponentIR): boolean {
  return (
    ir.behavior.normalizedChannels.some((channel) => channel.name === "expanded") &&
    ir.styledProps.some((prop) => prop.safeName === "maxLines")
  );
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
