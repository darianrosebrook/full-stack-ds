import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildComponentIR, composeBindingProjectionExpression, parseBindingExpression } from "./ir.js";
import type { ComponentContract } from "./contract.js";
import { generateReactComponentSource } from "./frameworks/react/component-source.js";
import { generateVueComponentSource } from "./frameworks/vue/component-source.js";
import { generateSvelteComponentSource } from "./frameworks/svelte/component-source.js";
import { generateAngularComponentSource } from "./frameworks/angular/component-source.js";
import { generateLitComponentSource } from "./frameworks/lit/component-source.js";
import { generateReactNativeComponentSource } from "./frameworks/react-native/component-source.js";

const contract = JSON.parse(readFileSync(resolve(__dirname, '../../ds-contracts/components/Select/Select.contract.json'), 'utf8')) as ComponentContract;
const expression = composeBindingProjectionExpression('selectionLabel', 'choices', 'selection', 'placeholder');
const label = new Function('choices', 'selection', 'placeholder', `return ${expression}`);

describe('selection label projection', () => {
  const choices = [{ value: 'b', label: 'Bee' }, { value: 'a', label: '<Alpha>' }];
  it('resolves labels in option order and falls back when nothing matches', () => {
    expect(label(choices, 'a', 'Choose')).toBe('<Alpha>');
    expect(label(choices, ['a', 'b', 'missing'], 'Choose')).toBe('Bee, <Alpha>');
    expect(label(choices, [], 'Choose')).toBe('Choose');
    expect(label(choices, 'missing', 'Choose')).toBe('Choose');
    expect(label([], 'a', 'Choose')).toBe('Choose');
  });
  it('rejects malformed operands and undeclared references', () => {
    for (const source of ['project:selectionLabel(prop:options)', 'project:selectionLabel(literal:bad, channel:selection.value, prop:placeholder)', 'project:selectionLabel(prop:options, channel:selection.onChange, prop:placeholder)']) {
      expect(() => parseBindingExpression(source)).toThrow(/selectionLabel/);
    }
    const broken = structuredClone(contract);
    if (!broken.anatomy || Array.isArray(broken.anatomy)) throw new Error('Expected DOM anatomy');
    broken.anatomy.dom!.children![0].children![0].content = 'project:selectionLabel(prop:missing, channel:selection.value, prop:placeholder)';
    expect(() => buildComponentIR(broken)).toThrow(/unknown prop.*missing/);
  });
  it('lowers an independently named contract in every admitted JavaScript target', () => {
    const renamed = structuredClone(contract);
    renamed.name = 'ChoiceSummary';
    const ir = buildComponentIR(renamed);
    for (const emit of [(ir: ReturnType<typeof buildComponentIR>) => generateReactComponentSource(ir, "../../primitives"), generateVueComponentSource, generateSvelteComponentSource, generateAngularComponentSource, generateLitComponentSource, (ir: ReturnType<typeof buildComponentIR>) => JSON.stringify(generateReactNativeComponentSource(ir))]) {
      expect(emit(ir)).toMatch(/\.map\(option => option.label\)/);
    }
  });
});
