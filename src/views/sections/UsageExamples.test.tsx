import { describe, expect, it } from "vitest";
import { applyRootUsagePropOverrides } from "./UsageExamples";
import type { UsageTreeNode } from "../../types/data";

describe("applyRootUsagePropOverrides", () => {
  it("merges live primitive prop overrides into the root component only", () => {
    const tree: UsageTreeNode = {
      "fsds.Button": {
        props: {
          children: "Save",
          size: "medium",
          variant: "secondary",
        },
      },
    };

    expect(
      applyRootUsagePropOverrides(tree, "Button", {
        size: "large",
        variant: "destructive",
        disabled: true,
      }),
    ).toEqual({
      "fsds.Button": {
        props: {
          children: "Save",
          size: "large",
          variant: "destructive",
          disabled: true,
        },
      },
    });
  });

  it("does not leak overrides into nested or unrelated component roots", () => {
    const tree: UsageTreeNode = {
      "fsds.Card": {
        slots: {
          footer: {
            "fsds.Button": {
              props: {
                children: "Apply",
                size: "small",
              },
            },
          },
        },
      },
    };

    expect(
      applyRootUsagePropOverrides(tree, "Button", { size: "large" }),
    ).toBe(tree);
  });

  it("ignores undefined and object-shaped values that cannot be usage props", () => {
    const tree: UsageTreeNode = {
      "fsds.Button": {
        props: {
          children: "Save",
          size: "medium",
        },
      },
    };

    expect(
      applyRootUsagePropOverrides(tree, "Button", {
        size: undefined,
        ariaLabel: { text: "Save" },
      }),
    ).toBe(tree);
  });
});
