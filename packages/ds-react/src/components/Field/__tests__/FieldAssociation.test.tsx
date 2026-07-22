import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "../Field";
import { Input } from "../../Input/Input";

/**
 * FEAT-A11Y-LABEL-ID-ASSOCIATION-01 — end-to-end field association.
 *
 * Hand-authored (not generated): pins the cross-component mechanism the
 * per-component generated tests cannot see — Field provides the generated
 * control id + describedby ids through FieldAssociationContext, and a
 * slotted Input binds them on its root element.
 */
describe("Field ↔ Input association", () => {
  it("wires label[for] → slotted input id through the association context", () => {
    const { container } = render(
      <Field
        name="email"
        data-testid="field"
        slots={{
          label: "Email address",
          control: <Input data-testid="control" type="email" />,
          help: "We only email you about your account.",
        }}
      />,
    );
    const label = container.querySelector("label.field__label");
    const input = screen.getByTestId("control");
    expect(label).not.toBeNull();
    const forId = label!.getAttribute("for");
    expect(forId).toBeTruthy();
    // The label's `for` and the slotted control's `id` must be the SAME
    // generated id — the association only exists if they agree.
    expect(input.getAttribute("id")).toBe(forId);
  });

  it("delivers the help id to the control's aria-describedby while not invalid", () => {
    const { container } = render(
      <Field
        name="email"
        slots={{
          label: "Email",
          control: <Input data-testid="control" />,
          help: "Help text.",
        }}
      />,
    );
    const help = container.querySelector(".field__help");
    const input = screen.getByTestId("control");
    expect(help!.getAttribute("id")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(
      help!.getAttribute("id"),
    );
  });

  it("switches aria-describedby to the error id when status=invalid", () => {
    const { container } = render(
      <Field
        name="email"
        status="invalid"
        slots={{
          label: "Email",
          control: <Input data-testid="control" />,
          help: "Help text.",
          error: "That address is not valid.",
        }}
      />,
    );
    const error = container.querySelector(".field__error");
    const input = screen.getByTestId("control");
    expect(error!.getAttribute("id")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(
      error!.getAttribute("id"),
    );
  });

  it("renders a standalone Input without generated ids (no provider)", () => {
    render(<Input data-testid="standalone" />);
    const input = screen.getByTestId("standalone");
    expect(input.getAttribute("id")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("lets an explicit consumer id override the generated one", () => {
    render(
      <Field
        name="email"
        slots={{ control: <Input data-testid="control" id="my-id" /> }}
      />,
    );
    expect(screen.getByTestId("control").getAttribute("id")).toBe("my-id");
  });
});
