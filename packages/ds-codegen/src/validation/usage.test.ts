import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { validateUsageLine } from "./usage.js";

function contract(
  name: string,
  anatomy: ComponentContract["anatomy"],
): ComponentContract {
  return {
    name,
    layer: "primitive",
    anatomy,
  };
}

function validate(target: ComponentContract) {
  return validateUsageLine(
    {
      name: "default",
      tree: {
        [`fsds.${target.name}`]: {
          slots: { label: "Visible label" },
        },
      },
    },
    { file: `${target.name}.usage.jsonl`, lineNumber: 1, exampleName: "default" },
    { contracts: new Map([[target.name, target]]) },
  );
}

describe("usage region delivery validation", () => {
  it("rejects an anatomy region that has no consumer delivery path", () => {
    const issues = validate(
      contract("StaticLabel", {
        parts: ["root", "label"],
        dom: {
          tag: "span",
          part: "root",
          children: [{ tag: "span", part: "label" }],
        },
      }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        pointer: "/tree/slots/label",
        message: expect.stringContaining("no consumer delivery path"),
      }),
    ]);
  });

  it("accepts a region declared as a named contract DOM slot", () => {
    expect(
      validate(
        contract("NamedLabel", {
          parts: ["root", "label"],
          dom: {
            tag: "span",
            part: "root",
            children: [{ tag: "slot", name: "label" }],
          },
        }),
      ),
    ).toEqual([]);
  });

  it("accepts anatomy content when the contract exposes ordinary children", () => {
    expect(
      validate(
        contract("ChildLabel", {
          parts: ["root", "label"],
          dom: {
            tag: "span",
            part: "root",
            children: [
              {
                tag: "span",
                part: "label",
                children: [{ tag: "children" }],
              },
            ],
          },
        }),
      ),
    ).toEqual([]);
  });

  it("accepts a contract-authored compound subcomponent", () => {
    expect(
      validate(
        contract("CompoundLabel", {
          parts: ["root", "label"],
          details: { label: { subcomponent: true } },
          // A compound part is deliverable only when the root has a child
          // host. DOM-less contracts use the codegen's legacy child host.
        }),
      ),
    ).toEqual([]);
  });
});
