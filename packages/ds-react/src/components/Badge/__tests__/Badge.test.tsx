// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Badge, BadgeContent } from "../Badge";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Badge — unit", () => {
  it("renders with default props", () => {
    render(<Badge data-testid="badge">content</Badge>);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Badge data-testid="badge">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge");
  });

  it("merges custom className", () => {
    render(<Badge data-testid="badge" className="custom">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge", "custom");
  });

  it("applies variant=default variant class", () => {
    render(<Badge data-testid="badge" variant="default">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--default");
  });

  it("applies variant=status variant class", () => {
    render(<Badge data-testid="badge" variant="status">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--status");
  });

  it("applies variant=counter variant class", () => {
    render(<Badge data-testid="badge" variant="counter">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--counter");
  });

  it("applies variant=tag variant class", () => {
    render(<Badge data-testid="badge" variant="tag">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--tag");
  });

  it("applies intent=info variant class", () => {
    render(<Badge data-testid="badge" intent="info">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--info");
  });

  it("applies intent=success variant class", () => {
    render(<Badge data-testid="badge" intent="success">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--success");
  });

  it("applies intent=warning variant class", () => {
    render(<Badge data-testid="badge" intent="warning">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--warning");
  });

  it("applies intent=danger variant class", () => {
    render(<Badge data-testid="badge" intent="danger">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--danger");
  });

  it("applies size=sm variant class", () => {
    render(<Badge data-testid="badge" size="sm">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--sm");
  });

  it("applies size=md variant class", () => {
    render(<Badge data-testid="badge" size="md">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--md");
  });

  it("applies size=lg variant class", () => {
    render(<Badge data-testid="badge" size="lg">content</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge--lg");
  });
});

describe("Badge — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Badge>content</Badge></>);
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
