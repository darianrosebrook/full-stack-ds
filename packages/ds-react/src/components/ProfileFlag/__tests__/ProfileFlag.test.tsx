// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ProfileFlag } from "../ProfileFlag";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("ProfileFlag — unit", () => {
  it("renders with default props", () => {
    render(<ProfileFlag data-testid="profile-flag">content</ProfileFlag>);
    expect(screen.getByTestId("profile-flag")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<ProfileFlag data-testid="profile-flag">content</ProfileFlag>);
    expect(screen.getByTestId("profile-flag")).toHaveClass("profile-flag");
  });

  it("merges custom className", () => {
    render(<ProfileFlag data-testid="profile-flag" className="custom">content</ProfileFlag>);
    expect(screen.getByTestId("profile-flag")).toHaveClass("profile-flag", "custom");
  });
});

describe("ProfileFlag — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><ProfileFlag>content</ProfileFlag></>);
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
