import { describe, expect, it } from "vitest";
import { buildComponentIR } from "./ir.js";
import { REACT_ADMITTED_TYPES } from "./frameworks/react/admitted-types.js";
import type { ComponentContract } from "./contract.js";

// BUILTIN_TYPE_NAMES in ir.ts is framework-neutral by design. These
// tests prove the boundary: React-specific names like ReactNode and
// SyntheticEvent are NOT silently admitted at the IR layer; they only
// pass when an emitter-scoped allowlist is explicitly threaded in.
// This protects the project's central authority claim — contract owns
// semantics, IR is framework-neutral, emitter is realization-only.

function contractWithProp(name: string, type: string): ComponentContract {
  return {
    name: "ProbeComponent",
    layer: "primitive",
    props: {
      styled: { members: [{ name, type }] },
    },
  } as ComponentContract;
}

describe("BUILTIN_TYPE_NAMES boundary", () => {
  it("surfaces ReactNode as unresolved when no React allowlist is passed", () => {
    const contract = contractWithProp("icon", "ReactNode");
    const ir = buildComponentIR(contract);
    const refs = ir.unresolvedTypeRefs.map((r) => r.ref);
    expect(refs).toContain("ReactNode");
  });

  it("surfaces SyntheticEvent and ChangeEventHandler as unresolved by default", () => {
    const contract: ComponentContract = {
      name: "Probe",
      layer: "primitive",
      props: {
        styled: {
          members: [
            { name: "onClick", type: "(e: SyntheticEvent) => void" },
            { name: "onChange", type: "ChangeEventHandler<HTMLInputElement>" },
          ],
        },
      },
    } as ComponentContract;
    const ir = buildComponentIR(contract);
    const refs = ir.unresolvedTypeRefs.map((r) => r.ref).sort();
    expect(refs).toContain("SyntheticEvent");
    expect(refs).toContain("ChangeEventHandler");
    // HTMLInputElement is React-shaped DOM narrowing — also out of the
    // neutral builtin set, also surfaced as unresolved.
    expect(refs).toContain("HTMLInputElement");
  });

  it("surfaces React.* references as unresolved by default", () => {
    const contract = contractWithProp("renderItem", "React.ComponentType");
    const ir = buildComponentIR(contract);
    const refs = ir.unresolvedTypeRefs.map((r) => r.ref);
    // `extractTypeRefs` does not split on `.`, so the full namespaced
    // reference is what surfaces — but it must surface as a leak
    // rather than be silently admitted as a builtin.
    expect(refs).toContain("React.ComponentType");
  });

  it("admits ReactNode when REACT_ADMITTED_TYPES is passed as extraKnownTypes", () => {
    const contract = contractWithProp("icon", "ReactNode");
    const ir = buildComponentIR(contract, {
      extraKnownTypes: REACT_ADMITTED_TYPES,
    });
    const refs = ir.unresolvedTypeRefs.map((r) => r.ref);
    expect(refs).not.toContain("ReactNode");
  });

  it("admits SyntheticEvent + DOM-narrowing types via REACT_ADMITTED_TYPES", () => {
    const contract: ComponentContract = {
      name: "Probe",
      layer: "primitive",
      props: {
        styled: {
          members: [
            { name: "onClick", type: "MouseEventHandler<HTMLButtonElement>" },
            { name: "onChange", type: "ChangeEvent<HTMLInputElement>" },
          ],
        },
      },
    } as ComponentContract;
    const ir = buildComponentIR(contract, {
      extraKnownTypes: REACT_ADMITTED_TYPES,
    });
    expect(ir.unresolvedTypeRefs).toHaveLength(0);
  });

  it("preserves genuinely-unresolved refs even with React allowlist active", () => {
    const contract = contractWithProp("data", "MyCustomShape");
    const ir = buildComponentIR(contract, {
      extraKnownTypes: REACT_ADMITTED_TYPES,
    });
    const refs = ir.unresolvedTypeRefs.map((r) => r.ref);
    expect(refs).toEqual(["MyCustomShape"]);
  });

  it("admits framework-neutral primitives and TS utility types without any allowlist", () => {
    const contract: ComponentContract = {
      name: "Probe",
      layer: "primitive",
      props: {
        styled: {
          members: [
            { name: "label", type: "string" },
            { name: "count", type: "number" },
            { name: "tags", type: "Array<string>" },
            { name: "meta", type: "Record<string, unknown>" },
            { name: "subset", type: "Pick<{ a: number }, 'a'>" },
            { name: "created", type: "Date" },
          ],
        },
      },
    } as ComponentContract;
    const ir = buildComponentIR(contract);
    expect(ir.unresolvedTypeRefs).toHaveLength(0);
  });
});
