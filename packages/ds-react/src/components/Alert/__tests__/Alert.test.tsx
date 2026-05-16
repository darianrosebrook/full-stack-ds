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

// @custom:end
