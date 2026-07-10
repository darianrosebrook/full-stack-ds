import { afterEach, describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import {
  _resetKnownIconNamesCacheForTests,
  iconNamePropsOf,
  loadKnownIconNames,
  usageIconRefIssue,
  validateContractIconRefs,
} from "./icon-refs.js";

/** Minimal Icon-shaped contract: an svg node carrying an iconGlyph directive. */
function iconContract(): ComponentContract {
  return {
    name: "Icon",
    anatomy: {
      parts: ["root"],
      dom: {
        tag: "span",
        part: "root",
        children: [
          {
            tag: "svg",
            iconGlyph: {
              nameFrom: "prop:name",
              sizeFrom: "prop:size",
              sizeHints: { sm: 16, md: 20 },
            },
          },
        ],
      },
    },
  } as unknown as ComponentContract;
}

/** A contract that composes fsds.Icon with a literal name. */
function consumerContract(literalName: string): ComponentContract {
  return {
    name: "Alert",
    anatomy: {
      parts: ["root"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          {
            componentRef: "fsds.Icon",
            attrs: { name: literalName },
          },
        ],
      },
    },
  } as unknown as ComponentContract;
}

afterEach(() => {
  _resetKnownIconNamesCacheForTests();
});

describe("iconNamePropsOf", () => {
  it("returns the prop bound by an iconGlyph nameFrom directive", () => {
    expect([...iconNamePropsOf(iconContract())]).toEqual(["name"]);
  });

  it("returns an empty set for a contract without a glyph directive", () => {
    expect(iconNamePropsOf(consumerContract("check")).size).toBe(0);
  });
});

describe("loadKnownIconNames (real corpus)", () => {
  it("loads the committed icon corpus and includes the authored icons", () => {
    const known = loadKnownIconNames();
    expect(known).not.toBe("missing");
    for (const name of ["placeholder", "check", "circle", "triangle-alert"]) {
      expect((known as Set<string>).has(name)).toBe(true);
    }
  });
});

describe("validateContractIconRefs", () => {
  it("flags a componentRef literal icon name absent from the corpus", () => {
    _resetKnownIconNamesCacheForTests(new Set(["check"]));
    const allContracts = new Map([["Icon", iconContract()]]);
    const issues = validateContractIconRefs(consumerContract("does-not-exist"), {
      allContracts,
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/anatomy/dom/children/0/attrs/name");
    expect(issues[0].message).toContain('"does-not-exist"');
    expect(issues[0].message).toContain("Icon.name");
  });

  it("passes a componentRef literal icon name that exists", () => {
    _resetKnownIconNamesCacheForTests(new Set(["check"]));
    const allContracts = new Map([["Icon", iconContract()]]);
    expect(
      validateContractIconRefs(consumerContract("check"), { allContracts }),
    ).toEqual([]);
  });

  it("checks literal: bindings the same as static attrs", () => {
    _resetKnownIconNamesCacheForTests(new Set(["check"]));
    const contract = consumerContract("check");
    const refNode = (contract.anatomy as unknown as { dom: { children: Array<Record<string, unknown>> } })
      .dom.children[0];
    delete refNode.attrs;
    refNode.bindings = { name: "literal:missing-glyph" };
    const allContracts = new Map([["Icon", iconContract()]]);
    const issues = validateContractIconRefs(contract, { allContracts });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('"missing-glyph"');
  });

  it("reports the corpus-missing state loudly instead of passing", () => {
    _resetKnownIconNamesCacheForTests("missing");
    const allContracts = new Map([["Icon", iconContract()]]);
    const issues = validateContractIconRefs(consumerContract("check"), {
      allContracts,
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("icon corpus not found");
  });
});

describe("usageIconRefIssue", () => {
  it("flags an unknown literal icon name on an icon-typed prop", () => {
    _resetKnownIconNamesCacheForTests(new Set(["check"]));
    const msg = usageIconRefIssue(iconContract(), "name", "nope");
    expect(msg).toContain('"nope"');
    expect(msg).toContain("not in the icon corpus");
  });

  it("passes a known name and ignores non-icon props and non-strings", () => {
    _resetKnownIconNamesCacheForTests(new Set(["check"]));
    expect(usageIconRefIssue(iconContract(), "name", "check")).toBeNull();
    expect(usageIconRefIssue(iconContract(), "size", "nope")).toBeNull();
    expect(usageIconRefIssue(iconContract(), "name", 42)).toBeNull();
  });
});
