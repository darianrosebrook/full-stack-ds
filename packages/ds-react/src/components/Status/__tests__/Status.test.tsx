// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Status } from "../Status";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Status — unit", () => {
  it("renders with default props", () => {
    render(<Status data-testid="status" status={"info"}>content</Status>);
    expect(screen.getByTestId("status")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Status data-testid="status" status={"info"}>content</Status>);
    expect(screen.getByTestId("status")).toHaveClass("status");
  });

  it("merges custom className", () => {
    render(<Status data-testid="status" status={"info"} className="custom">content</Status>);
    expect(screen.getByTestId("status")).toHaveClass("status", "custom");
  });

  it("applies status=info variant class", () => {
    render(<Status data-testid="status" status="info">content</Status>);
    expect(screen.getByTestId("status")).toHaveClass("status--info");
  });

  it("applies status=success variant class", () => {
    render(<Status data-testid="status" status="success">content</Status>);
    expect(screen.getByTestId("status")).toHaveClass("status--success");
  });

  it("applies status=warning variant class", () => {
    render(<Status data-testid="status" status="warning">content</Status>);
    expect(screen.getByTestId("status")).toHaveClass("status--warning");
  });

  it("applies status=danger variant class", () => {
    render(<Status data-testid="status" status="danger">content</Status>);
    expect(screen.getByTestId("status")).toHaveClass("status--danger");
  });

  it("applies status=error variant class", () => {
    render(<Status data-testid="status" status="error">content</Status>);
    expect(screen.getByTestId("status")).toHaveClass("status--error");
  });
});

describe("Status — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Status aria-label="Test Status" status={"info"}>content</Status></>);
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

// @custom:end
