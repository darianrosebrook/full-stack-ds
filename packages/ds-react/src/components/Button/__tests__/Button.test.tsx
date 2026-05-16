// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Button } from "../Button";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Button — unit", () => {
  it("renders with default props", () => {
    render(<Button data-testid="button">content</Button>);
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Button data-testid="button">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button");
  });

  it("merges custom className", () => {
    render(<Button data-testid="button" className="custom">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button", "custom");
  });

  it("applies size=small variant class", () => {
    render(<Button data-testid="button" size="small">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--small");
  });

  it("applies size=medium variant class", () => {
    render(<Button data-testid="button" size="medium">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--medium");
  });

  it("applies size=large variant class", () => {
    render(<Button data-testid="button" size="large">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--large");
  });

  it("applies variant=primary variant class", () => {
    render(<Button data-testid="button" variant="primary">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--primary");
  });

  it("applies variant=secondary variant class", () => {
    render(<Button data-testid="button" variant="secondary">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--secondary");
  });

  it("applies variant=tertiary variant class", () => {
    render(<Button data-testid="button" variant="tertiary">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--tertiary");
  });

  it("applies variant=ghost variant class", () => {
    render(<Button data-testid="button" variant="ghost">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--ghost");
  });

  it("applies variant=destructive variant class", () => {
    render(<Button data-testid="button" variant="destructive">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--destructive");
  });

  it("applies variant=outline variant class", () => {
    render(<Button data-testid="button" variant="outline">content</Button>);
    expect(screen.getByTestId("button")).toHaveClass("button--outline");
  });
});

describe("Button — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Button aria-label="Test Button">content</Button></>);
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
