// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Alert, AlertBody, AlertTitle } from "../Alert";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Alert — unit", () => {
  it("renders with default props", () => {
    render(<Alert data-testid="alert">content</Alert>);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Alert data-testid="alert">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert");
  });

  it("merges custom className", () => {
    render(<Alert data-testid="alert" className="custom">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Alert data-testid="alert">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveAttribute("role", "alert");
  });

  it("applies intent=info variant class", () => {
    render(<Alert data-testid="alert" intent="info">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert--info");
  });

  it("applies intent=success variant class", () => {
    render(<Alert data-testid="alert" intent="success">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert--success");
  });

  it("applies intent=warning variant class", () => {
    render(<Alert data-testid="alert" intent="warning">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert--warning");
  });

  it("applies intent=danger variant class", () => {
    render(<Alert data-testid="alert" intent="danger">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert--danger");
  });

  it("applies level=inline variant class", () => {
    render(<Alert data-testid="alert" level="inline">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert--inline");
  });

  it("applies level=section variant class", () => {
    render(<Alert data-testid="alert" level="section">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert--section");
  });

  it("applies level=page variant class", () => {
    render(<Alert data-testid="alert" level="page">content</Alert>);
    expect(screen.getByTestId("alert")).toHaveClass("alert--page");
  });
});

describe("Alert — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Alert aria-label="Test Alert">content</Alert></>);
    const results = await axe(container) as unknown as { violations: Array<{ id: string }> };
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-prohibited-attr",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
      "image-alt",
      "label",
      "link-name",
      "list",
      "region",
      "role-img-alt",
      "summary-name",
    ]);
    const unexpectedViolations = results.violations.filter(
      (violation) => !knownScaffoldViolationIds.has(violation.id),
    );
    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
// CODEGEN-RECURSIVE-COMPOSITION-01: Alert's dismiss control is composed
// by-reference as the Button primitive (componentRef: fsds.Button). These
// tests prove the composition behaves like the former raw <button>: the
// click event reaches `onDismiss` and the `aria-label` binding reaches the
// composed Button's accessible name — i.e. behavior + a11y survive the
// composition boundary.
import { fireEvent } from "@testing-library/react";

describe("Alert — dismiss control composed via Button", () => {
  it("forwards click on the composed Button to onDismiss", () => {
    let dismissed = 0;
    render(
      <Alert
        dismissible
        dismissLabel="Dismiss alert"
        onDismiss={() => {
          dismissed += 1;
        }}
      >
        content
      </Alert>,
    );
    const dismiss = screen.getByRole("button", { name: "Dismiss alert" });
    fireEvent.click(dismiss);
    expect(dismissed).toBe(1);
  });

  it("forwards aria-label to the composed Button's accessible name", () => {
    render(
      <Alert dismissible dismissLabel="Close notice" onDismiss={() => {}}>
        content
      </Alert>,
    );
    // getByRole with an accessible-name filter fails if the label did not
    // reach the composed Button — the cross-boundary a11y proof.
    expect(
      screen.getByRole("button", { name: "Close notice" }),
    ).toBeInTheDocument();
  });
});
// @custom:end
