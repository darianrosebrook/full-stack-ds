// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Progress } from "../Progress";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Progress — unit", () => {
  it("renders with default props", () => {
    render(<Progress data-testid="progress">content</Progress>);
    expect(screen.getByTestId("progress")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Progress data-testid="progress">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress");
  });

  it("merges custom className", () => {
    render(<Progress data-testid="progress" className="custom">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Progress data-testid="progress">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveAttribute("role", "progressbar");
  });

  it("applies variant=linear variant class", () => {
    render(<Progress data-testid="progress" variant="linear">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--linear");
  });

  it("applies variant=circular variant class", () => {
    render(<Progress data-testid="progress" variant="circular">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--circular");
  });

  it("applies size=sm variant class", () => {
    render(<Progress data-testid="progress" size="sm">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--sm");
  });

  it("applies size=md variant class", () => {
    render(<Progress data-testid="progress" size="md">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--md");
  });

  it("applies size=lg variant class", () => {
    render(<Progress data-testid="progress" size="lg">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--lg");
  });

  it("applies intent=info variant class", () => {
    render(<Progress data-testid="progress" intent="info">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--info");
  });

  it("applies intent=success variant class", () => {
    render(<Progress data-testid="progress" intent="success">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--success");
  });

  it("applies intent=warning variant class", () => {
    render(<Progress data-testid="progress" intent="warning">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--warning");
  });

  it("applies intent=danger variant class", () => {
    render(<Progress data-testid="progress" intent="danger">content</Progress>);
    expect(screen.getByTestId("progress")).toHaveClass("progress--danger");
  });
});

describe("Progress — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Progress aria-label="Test Progress">content</Progress></>);
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
