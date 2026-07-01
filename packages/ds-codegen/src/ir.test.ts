import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { buildComponentIR, buildTextOverflowIR } from "./ir.js";

/**
 * CODEGEN-RN-EMITTER-IR-AUTHORITY-01 A3: textOverflow must be a real IR fact,
 * not just schema-valid contract JSON. generate:check and governed:rail can
 * both stay green on byte-identical generated output even if textOverflow is
 * never read into the IR (the existing anatomy.dom cssVariableBindings
 * mechanism produces the visible behavior independently) — so this test
 * loads the REAL ShowMore/Truncate contracts off disk and asserts
 * ComponentIR.textOverflow is actually constructed from them, with the line
 * source tied to the same prop the existing css-var binding already reads.
 */

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts");

function loadContract(name: string): ComponentContract {
  const raw = readFileSync(
    resolve(CONTRACTS_ROOT, "components", name, `${name}.contract.json`),
    "utf8",
  );
  return JSON.parse(raw) as ComponentContract;
}

describe("TextOverflowIR — real ShowMore/Truncate contracts", () => {
  it("builds textOverflow for ShowMore with kind line-clamp and line sourced from prop:maxLines", () => {
    const contract = loadContract("ShowMore");
    const ir = buildComponentIR(contract);

    expect(ir.textOverflow).toBeDefined();
    expect(ir.textOverflow?.kind).toBe("line-clamp");
    expect(ir.textOverflow?.line).toEqual({ kind: "prop", prop: "maxLines" });

    // The IR fact must point at the SAME prop the existing DOM css-var
    // realization reads, not a duplicate/divergent source.
    const contentNode = (
      contract.anatomy as { dom?: { children?: Array<{ part?: string; cssVariableBindings?: Record<string, string> }> } }
    ).dom?.children?.find((c) => c.part === "content");
    expect(contentNode?.cssVariableBindings?.["--fsds-show-more-content-max-lines"]).toBe(
      "prop:maxLines",
    );
  });

  it("builds textOverflow for Truncate with kind line-clamp and line sourced from prop:lines", () => {
    const contract = loadContract("Truncate");
    const ir = buildComponentIR(contract);

    expect(ir.textOverflow).toBeDefined();
    expect(ir.textOverflow?.kind).toBe("line-clamp");
    expect(ir.textOverflow?.line).toEqual({ kind: "prop", prop: "lines" });
  });

  it("leaves ir.textOverflow undefined for a contract with no textOverflow block (falsifiability: removing the read breaks these assertions, proving they are not vacuous)", () => {
    const ir = buildComponentIR({
      name: "NoTextOverflow",
      layer: "primitive",
    } as ComponentContract);

    expect(ir.textOverflow).toBeUndefined();
  });

  it("buildTextOverflowIR throws when textOverflow.line is not a prop: binding", () => {
    expect(() =>
      buildTextOverflowIR({
        name: "Malformed",
        layer: "primitive",
        textOverflow: { kind: "line-clamp", line: "not-a-prop-binding" },
      } as ComponentContract),
    ).toThrow(/must be a "prop:<name>" binding/);
  });
});
