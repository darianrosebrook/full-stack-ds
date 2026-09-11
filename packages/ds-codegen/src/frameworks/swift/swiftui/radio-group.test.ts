import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildComponentIR } from "../../../ir.js";
import { generateSwiftUIComponentSource } from "./component-source.js";

const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../ds-contracts/components", "RadioGroup/RadioGroup.contract.json"), "utf8");

describe("SwiftUI native radio collection", () => {
  it("uses contract identity, fields, channel props and label without component-name dispatch", () => {
    const contract = JSON.parse(source.replaceAll("RadioGroup", "ShippingChoice")
      .replaceAll("options", "choices").replaceAll("ariaLabel", "caption")
      .replaceAll("defaultValue", "initialChoice").replaceAll('"onChange"', '"onChoice"')
      .replaceAll("iter:item.value", "iter:item.key").replaceAll("{ value: string;", "{ key: string;"));
    // Channel member keys are grammar; only the referenced consumer prop is renamed.
    contract.channels.selection.defaultValue = "initialChoice";
    delete contract.channels.selection.initialChoice;
    contract.channels.selection.onChange = "onChoice";
    delete contract.channels.selection.onChoice;
    const emitted = generateSwiftUIComponentSource(buildComponentIR(contract));
    expect(emitted).toContain("public struct ShippingChoice: View");
    expect(emitted).toContain("choices: [ShippingChoiceOption]");
    expect(emitted).toContain("controlled: value, defaultValue: initialChoice, onChange: onChoice");
    expect(emitted).toContain("SwiftUI.Picker(caption, selection: selection.binding())");
    expect(emitted).toContain("ForEach(choices, id: \\.key)");
    expect(emitted).toContain("SwiftUI.Text(verbatim: item.label).tag(item.key)");
    expect(emitted).toContain(".disabled(item.disabled ?? false)");
    expect(emitted).toContain(".horizontalRadioGroupLayout()");
    expect(emitted).not.toContain("public struct RadioGroup");
    expect(emitted).not.toContain("[RadioGroupOption]");
  });

  it("does not silently reinterpret a different selection write as a radio value", () => {
    const contract = JSON.parse(source);
    contract.compositeControl.update = "channel:selection.onChange(iter:item.label)";
    expect(() => generateSwiftUIComponentSource(buildComponentIR(contract))).toThrow();
  });
});
