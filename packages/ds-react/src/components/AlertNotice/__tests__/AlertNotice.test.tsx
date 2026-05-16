// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AlertNotice, AlertNoticeBody, AlertNoticeTitle } from "../AlertNotice";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("AlertNotice — unit", () => {
  it("renders with default props", () => {
    render(<AlertNotice data-testid="alert-notice">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<AlertNotice data-testid="alert-notice">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice");
  });

  it("merges custom className", () => {
    render(<AlertNotice data-testid="alert-notice" className="custom">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<AlertNotice data-testid="alert-notice">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveAttribute("role", "alert");
  });

  it("applies status=info variant class", () => {
    render(<AlertNotice data-testid="alert-notice" status="info">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--info");
  });

  it("applies status=success variant class", () => {
    render(<AlertNotice data-testid="alert-notice" status="success">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--success");
  });

  it("applies status=warning variant class", () => {
    render(<AlertNotice data-testid="alert-notice" status="warning">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--warning");
  });

  it("applies status=danger variant class", () => {
    render(<AlertNotice data-testid="alert-notice" status="danger">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--danger");
  });

  it("applies status=error variant class", () => {
    render(<AlertNotice data-testid="alert-notice" status="error">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--error");
  });

  it("applies level=page variant class", () => {
    render(<AlertNotice data-testid="alert-notice" level="page">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--page");
  });

  it("applies level=section variant class", () => {
    render(<AlertNotice data-testid="alert-notice" level="section">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--section");
  });

  it("applies level=inline variant class", () => {
    render(<AlertNotice data-testid="alert-notice" level="inline">content</AlertNotice>);
    expect(screen.getByTestId("alert-notice")).toHaveClass("alert-notice--inline");
  });
});

describe("AlertNotice — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><AlertNotice aria-label="Test AlertNotice">content</AlertNotice></>);
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
