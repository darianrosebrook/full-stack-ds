// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { CodeBlock } from "../CodeBlock";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("CodeBlock — unit", () => {
  it("renders with default props", () => {
    render(<CodeBlock data-testid="code-block" code={"placeholder"} language={"bash"} />);
    expect(screen.getByTestId("code-block")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<CodeBlock data-testid="code-block" code={"placeholder"} language={"bash"} />);
    expect(screen.getByTestId("code-block")).toHaveClass("code-block");
  });

  it("merges custom className", () => {
    render(<CodeBlock data-testid="code-block" code={"placeholder"} language={"bash"} className="custom" />);
    expect(screen.getByTestId("code-block")).toHaveClass("code-block", "custom");
  });
});

describe("CodeBlock — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><CodeBlock code={"placeholder"} language={"bash"} /></>);
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
