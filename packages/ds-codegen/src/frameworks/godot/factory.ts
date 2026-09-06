import fs from "node:fs";
import path from "node:path";
import type { FrameworkEmitter } from "../../emitter.js";
import type { ComponentIR } from "../../ir.js";
import { isPartAnchoredSurface } from "../../semantics.js";
const q = JSON.stringify;
const handled = new Set(["checked","defaultChecked","onChange","open","defaultOpen","onOpenChange","value","defaultValue","onValueChange","disabled","collapsible","type","orientation","activationMode","loop","unmountInactive","appearance","placement","closeOnEscape","closeOnOutsideClick","closeOnBlur"]);
// Explicit pilot exclusions are visible in the emitted capability receipt.
const excluded = new Set(["size", "name", "idBase"]);
export function godotPlan(ir: ComponentIR) {
  for (const p of ir.styledProps) if (!handled.has(p.name) && !excluded.has(p.name)) throw new Error(`GODOT_UNSUPPORTED_PROP: ${ir.name}.${p.name}`);
  let operation: string;
  if (ir.surface) {
    if (!isPartAnchoredSurface(ir.surface) || ir.surface.modality !== "non-blocking" || ir.surface.openTriggers.join() !== "click") throw new Error(`GODOT_UNSUPPORTED_SURFACE: ${ir.name}`);
    operation = "surface";
  } else if (ir.formControl?.valueModel === "boolean") operation = "boolean";
  else if (ir.interaction?.triggers.length === 1 && ["select","toggle-item"].includes(ir.interaction.triggers[0]!.operation)) operation = ir.interaction.triggers[0]!.operation;
  else throw new Error(`GODOT_UNSUPPORTED_SHAPE: ${ir.name}`);
  const realized = new Set(["checked", "open", "value", "disabled", "collapsible", "onChange", "onValueChange", "onOpenChange"]);
  return { operation, excluded: ir.styledProps.filter(p => !realized.has(p.name) || (ir.formControl && p.name === "value")).map(p=>p.name) };
}
export function themeColor(ir: ComponentIR): string {
  // Project an authored foreground fallback through normalized CSS/token facts.
  // No component-name dispatch and no interpretation of raw contract fields.
  for (const block of ir.cssBlocks) {
    if (/[[:]/.test(block.selector)) continue;
    const color = block.declarations.color;
    if (!color) continue;
    if (/^#[0-9a-f]{6}$/i.test(color)) return color;
    for (const fact of ir.tokenFacts) if (color.includes(fact.cssVar) && fact.rawValue && /^#[0-9a-f]{6}$/i.test(fact.rawValue)) return fact.rawValue;
  }
  return "#141414";
}
export function createGodotEmitter(): FrameworkEmitter {
  return {
    id: "godot",
    discoverComponentIds: root => fs.existsSync(root) ? fs.readdirSync(root).filter(n => fs.existsSync(path.join(root,n,`${n}.gd`))).sort() : [],
    emitComponent(ir) {
      const plan = godotPlan(ir);
      const defaults = Object.fromEntries(ir.styledProps.filter(p=>p.defaultExpr !== undefined).map(p=>[p.name,p.defaultExpr]));
      const config = { operation: plan.operation, defaults, theme_color: themeColor(ir) };
      const script = `@tool\nclass_name DS${ir.name}\nextends "res://addons/full_stack_ds/runtime/control.gd"\n\nfunc _init() -> void:\n\tconfiguration = JSON.parse_string(${q(JSON.stringify(config))})\n\tlabel = ${q(ir.name)}\n`;
      const hex = themeColor(ir).slice(1);
      const rgb = [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255).join(", ");
      return [
        { relativePath: `${ir.name}/${ir.name}.gd`, contents: script },
        { relativePath: `${ir.name}/${ir.name}.tscn`, contents: `[gd_scene load_steps=3 format=3]\n\n[ext_resource type="Script" path="res://addons/full_stack_ds/components/${ir.name}/${ir.name}.gd" id="1"]\n[ext_resource type="Theme" path="res://addons/full_stack_ds/components/${ir.name}/theme.tres" id="2"]\n\n[node name="${ir.name}" type="VBoxContainer"]\nscript = ExtResource("1")\ntheme = ExtResource("2")\n` },
        { relativePath: `${ir.name}/theme.tres`, contents: `[gd_resource type="Theme" format=3]\n\n[resource]\ndefault_font_size = 16\nButton/colors/font_color = Color(${rgb}, 1)\nLabel/colors/font_color = Color(${rgb}, 1)\n` },
        { relativePath: `${ir.name}/capabilities.json`, contents: JSON.stringify({ ...plan, theme: "unconditional foreground fallback only", otherStyling: "unsupported", excludedProps: plan.excluded, proof: "requires-runtime-witness" },null,2)+"\n" },
      ];
    },
    emitTests: () => [],
    emitBarrel: names => `extends RefCounted\nconst COMPONENTS = ${q(names.sort())}\n`,
  };
}
