import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import Fixture from "./FieldAssociationFixture.svelte";
import Input from "../../Input/Input.svelte";

/**
 * FEAT-A11Y-LABEL-ID-ASSOCIATION-01 — end-to-end field association
 * (Svelte). Pins the cross-component mechanism: Field provides the
 * generated control id + describedby ids through setContext (a reactive
 * getter over a $derived), and a slotted Input binds them on its root.
 */
describe("Field ↔ Input association", () => {
  it("wires label[for] → slotted input id through context", () => {
    const { container } = render(
      Fixture as unknown as Component<Record<string, unknown>>,
      { props: {} },
    );
    const label = container.querySelector("label.field__label");
    const input = container.querySelector("input");
    const forId = label?.getAttribute("for");
    expect(forId).toBeTruthy();
    expect(input?.getAttribute("id")).toBe(forId);
  });

  it("delivers the help id to the control's aria-describedby while not invalid", () => {
    const { container } = render(
      Fixture as unknown as Component<Record<string, unknown>>,
      { props: {} },
    );
    const helpId = container
      .querySelector(".field__help")
      ?.getAttribute("id");
    expect(helpId).toBeTruthy();
    expect(
      container.querySelector("input")?.getAttribute("aria-describedby"),
    ).toBe(helpId);
  });

  it("switches aria-describedby to the error id when status=invalid", () => {
    const { container } = render(
      Fixture as unknown as Component<Record<string, unknown>>,
      { props: { status: "invalid" } },
    );
    const errorId = container
      .querySelector(".field__error")
      ?.getAttribute("id");
    expect(errorId).toBeTruthy();
    expect(
      container.querySelector("input")?.getAttribute("aria-describedby"),
    ).toBe(errorId);
  });

  it("renders a standalone Input without generated ids (no provider)", () => {
    const { container } = render(
      Input as unknown as Component<Record<string, unknown>>,
      { props: {} },
    );
    const input = container.querySelector("input");
    expect(input?.getAttribute("id")).toBeNull();
    expect(input?.getAttribute("aria-describedby")).toBeNull();
  });
});
