import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { listComponentContracts } from "../../contracts-fs.js";
import { accountComponent, declaredLeaves, inventory } from "./capabilities.js";
const root = path.resolve(__dirname, "../../../../..");
const fixture = (name: string) => JSON.parse(fs.readFileSync(path.join(root, `packages/ds-contracts/components/${name}/${name}.contract.json`), "utf8")) as ComponentContract;
describe("Unity capability accounting", () => {
  it("accounts for the actual corpus and keeps unadmitted shapes distinct", () => {
    const rows = inventory(root);
    expect(rows.map(r => r.component)).toEqual(listComponentContracts(path.join(root, "packages/ds-contracts")).map(e => e.name));
    expect(rows.find(r => r.component === "Text")!.status).toBe("unsupported-shape");
    expect(rows.find(r => r.component === "Switch")!.status).toBe("pilot-partial");
    expect(rows.every(r => r.proof === "source-accounting-only")).toBe(true);
  });
  it("exposes an unknown prop instead of classifying it as supported", () => {
    const contract = fixture("Switch");
    const original = accountComponent(contract, true);
    const modified = structuredClone(contract);
    // Add a valid declared member so the IR must discover this new fact.
    const members = modified.props!.designed!.members!;
    const index = members.length;
    members.push({ name: "futureBehavior", propType: { kind: "boolean" }, default: false });
    const result = accountComponent(modified, true);
    expect(result.props.find(p => p.name === "futureBehavior")?.disposition).toBe("not-emitted");
    expect(result.props.length).toBe(original.props.length + 1);
    expect(result.obligations).toContainEqual({ pointer: `/props/designed/members/${index}/default`, disposition: "unassessed" });
  });
  it("distinguishes exported state API from unassessed semantics", () => {
    const result = accountComponent(fixture("Switch"), true);
    expect(result.props.find(p => p.name === "checked")?.disposition).toBe("emitted-api");
    expect(result.props.find(p => p.name === "name")?.disposition).toBe("not-emitted");
    expect(result.obligations.find(o => o.pointer === "/formControl/commit")?.disposition).toBe("unassessed");
  });
  it("retains empty declarations, arrays and escaped property paths", () => {
    expect(declaredLeaves({ "a/b": { "~": [] }, flags: [true, false], missing: null })).toEqual(["/a~1b/~0", "/flags/0", "/flags/1", "/missing"]);
  });
});
