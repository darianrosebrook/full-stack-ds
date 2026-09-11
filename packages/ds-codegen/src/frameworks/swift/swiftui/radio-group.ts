import type { BindingExpression, ComponentIR } from "../../../ir.js";

const member = (binding: BindingExpression | undefined): string | undefined =>
  binding?.kind === "iterationLocal" && binding.local === "item" && binding.path?.length === 1
    ? binding.path[0] : undefined;

/** Native radio collection: identity, label, disabled state and writes all come from IR. */
export function emitNativeRadioGroup(ir: ComponentIR, exportName: string): string | undefined {
  const control = ir.compositeControl;
  if (!ir.dom || ir.dom.attrs.role !== "radiogroup" || !control ||
      control.interactionModel !== "collection-selection" || control.commit !== "change" ||
      control.channel.valueType !== "string" || control.update.kind !== "channelCall") return;

  const item = ir.dom.children.find((node) => node.iteration?.kind === "array");
  const option = item?.children.find((node) => node.part === control.part.name);
  const valueMember = member(option?.bindings.value);
  const labelMember = member(option?.bindings["aria-label"]);
  const disabledMember = member(option?.bindings.disabled);
  const checked = option?.bindings.checked;
  if (!item?.iteration?.itemType || !option || option.tag !== "input" ||
      option.attrs.type !== "radio" || !valueMember || !labelMember ||
      member(control.update.arg) !== valueMember || checked?.kind !== "predicate" ||
      checked.op !== "eq" || member(checked.left) !== valueMember ||
      checked.right.kind !== "channel" || checked.right.channel !== control.channel.name ||
      checked.right.field !== "value") return;

  const type = item.iteration.itemType;
  const alias = ir.definedTypes[type]?.alias ?? "";
  const members = [...alias.matchAll(/(\w+)(\?)?:\s*(string|boolean)(?=\s*[;}])/g)]
    .map((match) => ({ name: match[1]!, optional: !!match[2], type: match[3] === "string" ? "String" : "Bool" }));
  const hasMember = (name: string, swiftType: string, required = false): boolean =>
    members.some((entry) => entry.name === name && entry.type === swiftType && (!required || !entry.optional));
  if (!hasMember(valueMember, "String", true) || !hasMember(labelMember, "String", true) ||
      (disabledMember && !hasMember(disabledMember, "Bool"))) return;
  const disabledOptional = members.find((entry) => entry.name === disabledMember)?.optional;
  const label = ir.dom.bindings["aria-label"];
  const labelProp = label?.kind === "prop" && !label.path?.length ? label.prop : undefined;
  const orientation = ir.styledProps.find((prop) => prop.safeName === "orientation");
  const orientationType = orientation?.typeRefs[0];
  const hasOrientation = orientationType &&
    ir.definedTypes[orientationType]?.values?.includes("horizontal") &&
    ir.definedTypes[orientationType]?.values?.includes("vertical");
  const channel = control.channel;
  const optionsProp = item.iteration.sourceProp;
  const defaultValue = channel.defaultValueProp;
  const params = [
    `${optionsProp}: [${type}]`,
    `${channel.valueProp}: Binding<String>? = nil`,
    ...(defaultValue ? [`${defaultValue}: String = ""`] : []),
    `${channel.changeHandlerProp}: ((String) -> Void)? = nil`,
    ...(labelProp ? [`${labelProp}: String = ""`] : []),
    ...(hasOrientation ? [`orientation: ${orientationType} = .${orientation.defaultExpr === '"horizontal"' ? "horizontal" : "vertical"}`] : []),
  ];
  const lines = ["// @generated:start component", `public struct ${type} {`];
  for (const field of members) lines.push(`    public let ${field.name}: ${field.type}${field.optional ? "?" : ""}`);
  lines.push(`    public init(${members.map((field) => `${field.name}: ${field.type}${field.optional ? "? = nil" : ""}`).join(", ")}) {`);
  for (const field of members) lines.push(`        self.${field.name} = ${field.name}`);
  lines.push("    }", "}", "", "/// Native single-choice Picker; web form names have no SwiftUI transport meaning.",
    `public struct ${exportName}: View {`, `    private let ${optionsProp}: [${type}]`,
    "    @StateObject private var selection: ControllableValue<String>");
  if (labelProp) lines.push(`    private let ${labelProp}: String`);
  if (hasOrientation) lines.push(`    private let orientation: ${orientationType}`);
  lines.push("", `    public init(${params.join(", ")}) {`, `        self.${optionsProp} = ${optionsProp}`,
    `        self._selection = StateObject(wrappedValue: ControllableValue(controlled: ${channel.valueProp}, defaultValue: ${defaultValue ?? '""'}, onChange: ${channel.changeHandlerProp}))`);
  if (labelProp) lines.push(`        self.${labelProp} = ${labelProp}`);
  if (hasOrientation) lines.push("        self.orientation = orientation");
  lines.push("    }", "", "    private var choices: some View {",
    `        SwiftUI.Picker(${labelProp ?? '""'}, selection: selection.binding()) {`,
    `            ForEach(${optionsProp}, id: \\.${valueMember}) { item in`,
    `                SwiftUI.Text(verbatim: item.${labelMember}).tag(item.${valueMember})`);
  if (disabledMember) lines.push(`                    .disabled(item.${disabledMember}${disabledOptional ? " ?? false" : ""})`);
  const help = member(item.bindings.title);
  if (help && hasMember(help, "String")) {
    const optional = members.find((entry) => entry.name === help)?.optional;
    lines.push(`                    .help(item.${help}${optional ? ' ?? ""' : ""})`);
  }
  lines.push("            }", "        }", "        .pickerStyle(.radioGroup)", "    }", "", "    public var body: some View {");
  if (hasOrientation) lines.push("        if orientation == .horizontal {", "            choices.horizontalRadioGroupLayout()", "        } else {", "            choices", "        }");
  else lines.push("        choices");
  lines.push("    }", "}", "// @generated:end");
  return lines.join("\n");
}
