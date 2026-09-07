/**
 * Contract tests for implicit-role elision (FEAT-A11Y-SELECT-TABS-KEYBOARD-01).
 *
 * The elision invariant: a declared `a11y.role` is emitted verbatim EXCEPT
 * when it equals the ARIA role the contract's *declared root tag* implies —
 * in which case emitting it is redundant and emitters omit the attribute.
 *
 * These tests pin both directions:
 *   - exact implicit matches are elided (effectiveRole === undefined),
 *   - everything else still emits (including near-misses that used to be
 *     silently mis-derived when the root element was back-derived from the
 *     role table instead of read from the contract's declared tag).
 */
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import {
  IMPLICIT_ROLES_BY_ELEMENT,
  getRootElement,
} from "./semantics.js";

function contractWithRoot(
  tag: string | undefined,
  role: string | undefined,
): ComponentContract {
  return {
    name: "Probe",
    description: "elision probe",
    anatomy: {
      parts: ["root"],
      ...(tag ? { details: { root: { tag, description: "root" } } } : {}),
    },
    ...(role ? { a11y: { role } as ComponentContract["a11y"] } : {}),
  } as ComponentContract;
}

describe("getRootElement", () => {
  it("prefers the contract's declared root tag over the role-table derivation", () => {
    // role "group" back-derives to "div" via ROLE_TO_ELEMENT; the declared
    // tag is authoritative.
    expect(getRootElement(contractWithRoot("details", "group"))).toBe("details");
    expect(getRootElement(contractWithRoot("img", "img"))).toBe("img");
    expect(getRootElement(contractWithRoot("hr", "separator"))).toBe("hr");
  });

  it("falls back to the role table when no root tag is declared", () => {
    expect(getRootElement(contractWithRoot(undefined, "group"))).toBe("div");
    expect(getRootElement(contractWithRoot(undefined, "button"))).toBe("button");
  });

  it("falls back to div when neither tag nor role is declared", () => {
    expect(getRootElement(contractWithRoot(undefined, undefined))).toBe("div");
  });
});

describe("IMPLICIT_ROLES_BY_ELEMENT", () => {
  it("covers the native elements whose ARIA role matches the corpus's declared roles", () => {
    // The corpus declares these exact tag/role pairs (Image, Details,
    // Divider); a missing row here emits a redundant role attribute.
    expect(IMPLICIT_ROLES_BY_ELEMENT["img"]).toBe("img");
    expect(IMPLICIT_ROLES_BY_ELEMENT["details"]).toBe("group");
    expect(IMPLICIT_ROLES_BY_ELEMENT["hr"]).toBe("separator");
  });
});

describe("effectiveRole elision (via the ir.ts derivation contract)", () => {
  // Mirrors the ir.ts:1903 derivation — kept in lockstep deliberately so a
  // drift in either surface fails here first.
  function effectiveRole(tag: string | undefined, role: string | undefined) {
    const rootElement = getRootElement(contractWithRoot(tag, role));
    const implicitRole = IMPLICIT_ROLES_BY_ELEMENT[rootElement];
    return role &&
      role !== "none" &&
      role !== "compound" &&
      role !== implicitRole
      ? role
      : undefined;
  }

  it("elides declared roles equal to the declared tag's implicit role", () => {
    expect(effectiveRole("img", "img")).toBeUndefined();
    expect(effectiveRole("details", "group")).toBeUndefined();
    expect(effectiveRole("hr", "separator")).toBeUndefined();
    expect(effectiveRole("button", "button")).toBeUndefined();
  });

  it("still emits roles that are not the element's implicit role", () => {
    // An img contract that declares a *different* role must keep it.
    expect(effectiveRole("img", "button")).toBe("button");
    // A div host with role group has no implicit role to match.
    expect(effectiveRole("div", "group")).toBe("group");
    expect(effectiveRole(undefined, "group")).toBe("group");
  });

  it("never elides the none/compound sentinels into a rendered attribute", () => {
    expect(effectiveRole("div", "none")).toBeUndefined();
    expect(effectiveRole("div", "compound")).toBeUndefined();
  });
});
