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

  it("does not flatten arbitrary anatomy regions into ordinary children", () => {
    const issues = validate(
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
    );

    expect(issues).toEqual([
      expect.objectContaining({
        pointer: "/tree/slots/label",
        message: expect.stringContaining("no consumer delivery path"),
      }),
    ]);
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

  it("accepts a nested public subcomponent ref and rejects undeclared parts", () => {
    const target = contract("CompoundLabel", {
      parts: ["root", "label", "owned"],
      details: { label: { subcomponent: true } },
    });
    const context = { contracts: new Map([[target.name, target]]) };
    const source = {
      file: "CompoundLabel.usage.jsonl",
      lineNumber: 1,
      exampleName: "default",
    };

    expect(
      validateUsageLine(
        {
          name: "default",
          tree: {
            "fsds.CompoundLabel": {
              props: {
                children: {
                  "fsds.CompoundLabel.label": {
                    props: { children: "Visible label" },
                  },
                },
              },
            },
          },
        },
        source,
        context,
      ),
    ).toEqual([]);

    expect(
      validateUsageLine(
        {
          name: "default",
          tree: {
            "fsds.CompoundLabel.owned": {
              props: { children: "Not public" },
            },
          },
        },
        source,
        context,
      ),
    ).toEqual([
      expect.objectContaining({
        message: expect.stringContaining("not a contract-declared public subcomponent"),
      }),
    ]);
  });

  it("validates structured object props against their contract alias", () => {
    const target: ComponentContract = {
      name: "ProfileCard",
      layer: "primitive",
      anatomy: { parts: ["root"] },
      props: {
        designed: {
          members: [
            {
              name: "profile",
              propType: { kind: "ref", to: "ProfileData" },
            },
          ],
        },
      },
      types: {
        ProfileData: {
          kind: "alias",
          alias: "{ name: string; stats: { likes: number; verified?: boolean } }",
        },
      },
    };
    const source = {
      file: "ProfileCard.usage.jsonl",
      lineNumber: 1,
      exampleName: "default",
    };
    const context = { contracts: new Map([[target.name, target]]) };

    expect(
      validateUsageLine(
        {
          name: "default",
          tree: {
            "fsds.ProfileCard": {
              props: { profile: { name: "Ada", stats: { likes: 3 } } },
            },
          },
        },
        source,
        context,
      ),
    ).toEqual([]);

    expect(
      validateUsageLine(
        {
          name: "default",
          tree: {
            "fsds.ProfileCard": {
              props: { profile: { name: "Ada", stats: { likes: "three" } } },
            },
          },
        },
        source,
        context,
      ),
    ).toEqual([
      expect.objectContaining({
        pointer: "/tree/props/profile",
        message: expect.stringContaining('field "stats" field "likes" must be a number'),
      }),
    ]);
  });
});
