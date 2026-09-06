import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { buildComponentIR } from "./ir.js";
import { emitCss } from "./css.js";

function contract(name: string): ComponentContract {
  return JSON.parse(readFileSync(resolve(__dirname, `../../ds-contracts/components/${name}/${name}.contract.json`), "utf8"));
}

describe("interaction capability", () => {
  it.each([
    ["Details", "open", "content", "unmount", "toggle"],
    ["ShowMore", "expanded", "content", "clamp", "toggle"],
    ["Accordion", "openness", "content", "hidden", "toggle-item"],
    ["Tabs", "activeTab", "panel", "hidden", "select"],
    ["Dialog", "openness", "modal", "unmount", "close"],
    ["Sheet", "openness", "content", "unmount", "close"],
    ["Popover", "open", "content", "unmount", "toggle"],
    ["Tooltip", "open", "content", "unmount", "open"],
  ])("normalizes %s independently of its name", (name, channel, content, presence, operation) => {
    const source = contract(name);
    source.name = "RenamedFixture";
    source.cssPrefix = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    const ir = buildComponentIR(source);
    expect(ir.interaction).toMatchObject({ channel: { name: channel }, content: { name: content }, presence, triggers: [{ operation }] });
  });

  it.each(["Accordion", "Tabs"])("protects %s hidden panels against authored display rules", name => {
    const ir = buildComponentIR(contract(name));
    const panel = ir.interaction!.content.name;
    expect(emitCss(ir)).toContain(`.${ir.cssPrefix}__${panel}[hidden]:not([hidden="until-found"])`);
    expect(ir.cssBlocks.find(block => block.selector.includes('[hidden]:not'))?.declarations).toEqual({ display: "none !important" });
  });

  it("rejects missing channels, missing parts, and invalid operation domains", () => {
    const source = contract("ShowMore");
    expect(() => buildComponentIR({ ...source, interaction: { ...source.interaction!, channel: "missing" } })).toThrow(/interaction.*channel/);
    expect(() => buildComponentIR({ ...source, interaction: { ...source.interaction!, content: "missing" } })).toThrow(/interaction.*content/);
    expect(() => buildComponentIR({ ...source, interaction: { ...source.interaction!, triggers: [{ part: "trigger", operation: "select" }] } })).toThrow(/interaction.*select/);
  });

  it("binds trap behavior to the declared content host, including renamed contracts", () => {
    const source = contract("Dialog");
    source.name = "RenamedModal";
    const ir = buildComponentIR(source);
    expect(ir.interaction?.focusContainer).toBe(true);
    expect(ir.dom?.children.find(node => node.part === "modal")).toMatchObject({ focusContainer: true, ifProp: "open" });
  });

  it("rejects incompatible disabled props and presence policy", () => {
    const source = contract("ShowMore");
    expect(() => buildComponentIR({ ...source, interaction: { ...source.interaction!, disabledProp: "showMoreLabel" } })).toThrow(/must be boolean/);
    expect(() => buildComponentIR({ ...source, textOverflow: undefined })).toThrow(/clamp presence/);
    const dialog = contract("Dialog");
    if (!dialog.anatomy || Array.isArray(dialog.anatomy)) throw new Error("expected DOM anatomy");
    dialog.anatomy.dom!.children![1].if = "!open";
    expect(() => buildComponentIR(dialog)).toThrow(/content guard/);
  });

  it("rejects a second authority for anchored surface relationships and operations", () => {
    const source = contract("Popover");
    expect(() => buildComponentIR({ ...source, interaction: { ...source.interaction!, triggers: [{ part: "trigger", operation: "close" }] } })).toThrow(/anchored surface/);
    expect(() => buildComponentIR({ ...source, interaction: { ...source.interaction!, content: "trigger" } })).toThrow(/anchored surface/);
  });

  it("rejects competing authored activation authority", () => {
    const source = contract("ShowMore");
    if (!source.anatomy || Array.isArray(source.anatomy)) throw new Error("expected DOM anatomy");
    source.anatomy.dom!.children![1].events = { click: "channel:expanded.onChange" };
    expect(() => buildComponentIR(source)).toThrow(/interaction owns.*click/);
  });
});
