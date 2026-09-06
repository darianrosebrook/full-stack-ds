import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { createGodotEmitter, godotPlan, themeColor } from "./factory.js";
const root = path.resolve(__dirname, "../../../../..");
function fixture(name: string) { return JSON.parse(fs.readFileSync(path.join(root,`packages/ds-contracts/components/${name}/${name}.contract.json`),"utf8")) as ComponentContract; }
describe("Godot bounded lowering", () => {
  it.each([["Switch","boolean"],["Accordion","toggle-item"],["Tabs","select"],["Popover","surface"]])("lowers %s after identity substitution", (name,op) => {
    const c=fixture(name); c.name="Renamed";
    expect(godotPlan(buildComponentIR(c)).operation).toBe(op);
  });
  it("rejects an unknown prop and unsupported surface instead of silent omission", () => {
    const c=fixture("Switch"); c.props!.designed!.members!.push({name:"futureBehavior",propType:{kind:"boolean"}});
    expect(()=>godotPlan(buildComponentIR(c))).toThrow("GODOT_UNSUPPORTED_PROP: Switch.futureBehavior");
    expect(()=>godotPlan(buildComponentIR(fixture("Dialog")))).toThrow(/GODOT_UNSUPPORTED/);
  });
  it("exposes known pilot exclusions", () => {
    expect(godotPlan(buildComponentIR(fixture("Switch"))).excluded).toEqual(expect.arrayContaining(["size","name","value","defaultChecked"]));
  });
  it("projects a changed token fallback into the Godot theme", () => {
    const ir=buildComponentIR(fixture("Accordion"));
    ir.cssBlocks=[{selector:".renamed",declarations:{color:"var(--probe)"}}];
    ir.tokenFacts=[{name:"probe",cssVar:"--probe",category:"color",layer:"semantic",source:"tokens-sidecar",isLiteral:true,rawValue:"#123456"}];
    expect(themeColor(ir)).toBe("#123456");
    const files=createGodotEmitter().emitComponent(ir,{componentsRoot:"",contractsRoot:""});
    expect(files.find(f=>f.relativePath.endsWith("theme.tres"))!.contents).toContain("Color(0.07058823529411765, 0.20392156862745098, 0.33725490196078434, 1)");
  });
});
