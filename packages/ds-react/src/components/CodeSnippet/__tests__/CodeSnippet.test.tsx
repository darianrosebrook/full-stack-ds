// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { CodeSnippet } from "../CodeSnippet";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("CodeSnippet — unit", () => {
  it("renders with default props", () => {
    render(<CodeSnippet data-testid="code-snippet" text={"placeholder"} />);
    expect(screen.getByTestId("code-snippet")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<CodeSnippet data-testid="code-snippet" text={"placeholder"} />);
    expect(screen.getByTestId("code-snippet")).toHaveClass("code-snippet");
  });

  it("merges custom className", () => {
    render(<CodeSnippet data-testid="code-snippet" text={"placeholder"} className="custom" />);
    expect(screen.getByTestId("code-snippet")).toHaveClass("code-snippet", "custom");
  });

  it("applies as=code variant class", () => {
    render(<CodeSnippet data-testid="code-snippet" text={"placeholder"} as="code" />);
    expect(screen.getByTestId("code-snippet")).toHaveClass("code-snippet--code");
  });

  it("applies as=kbd variant class", () => {
    render(<CodeSnippet data-testid="code-snippet" text={"placeholder"} as="kbd" />);
    expect(screen.getByTestId("code-snippet")).toHaveClass("code-snippet--kbd");
  });

  it("applies as=samp variant class", () => {
    render(<CodeSnippet data-testid="code-snippet" text={"placeholder"} as="samp" />);
    expect(screen.getByTestId("code-snippet")).toHaveClass("code-snippet--samp");
  });
});

describe("CodeSnippet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><CodeSnippet text={"placeholder"} /></>);
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
