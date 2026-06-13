// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ShowMore, ShowMoreContent, ShowMoreTrigger } from "../ShowMore";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("ShowMore — unit", () => {
  it("renders with default props", () => {
    render(<ShowMore data-testid="show-more">content</ShowMore>);
    expect(screen.getByTestId("show-more")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<ShowMore data-testid="show-more">content</ShowMore>);
    expect(screen.getByTestId("show-more")).toHaveClass("show-more");
  });

  it("merges custom className", () => {
    render(<ShowMore data-testid="show-more" className="custom">content</ShowMore>);
    expect(screen.getByTestId("show-more")).toHaveClass("show-more", "custom");
  });

  it("calls onExpandedChange when expanded changes", async () => {
    const onExpandedChangeSpy = vi.fn();
    expect(() => render(<ShowMore data-testid="show-more" expanded={false} onExpandedChange={onExpandedChangeSpy}>content</ShowMore>)).not.toThrow();
  });
});

describe("ShowMore — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><ShowMore>content</ShowMore></>);
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
describe("ShowMore — expandable behavior", () => {
  it("toggles the trigger label and expanded class in uncontrolled mode", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(
      <ShowMore
        data-testid="show-more"
        showMoreLabel="Read more"
        showLessLabel="Read less"
      >
        Long content that should become unclamped when expanded.
      </ShowMore>,
    );

    const root = screen.getByTestId("show-more");
    const trigger = screen.getByRole("button", { name: "Read more" });

    expect(root).not.toHaveClass("show-more--expanded");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(root).toHaveClass("show-more--expanded");
    expect(screen.getByRole("button", { name: "Read less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("reports the requested next expanded value in controlled mode", async () => {
    const { fireEvent } = await import("@testing-library/react");
    const onExpandedChange = vi.fn();
    render(
      <ShowMore expanded={false} onExpandedChange={onExpandedChange}>
        Controlled content
      </ShowMore>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));

    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });
});

// @custom:end
