// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Postcard, PostcardHeader, PostcardContent, PostcardFooter, type PostcardAuthor, type PostcardStats } from "../Postcard";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Postcard — unit", () => {
  it("renders with default props", () => {
    render(<Postcard data-testid="postcard" postId={"placeholder"} author={{} as PostcardAuthor} timestamp={"placeholder"} stats={{} as PostcardStats}>content</Postcard>);
    expect(screen.getByTestId("postcard")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Postcard data-testid="postcard" postId={"placeholder"} author={{} as PostcardAuthor} timestamp={"placeholder"} stats={{} as PostcardStats}>content</Postcard>);
    expect(screen.getByTestId("postcard")).toHaveClass("postcard");
  });

  it("merges custom className", () => {
    render(<Postcard data-testid="postcard" postId={"placeholder"} author={{} as PostcardAuthor} timestamp={"placeholder"} stats={{} as PostcardStats} className="custom">content</Postcard>);
    expect(screen.getByTestId("postcard")).toHaveClass("postcard", "custom");
  });

  it("applies type=image variant class", () => {
    render(<Postcard data-testid="postcard" postId={"placeholder"} author={{} as PostcardAuthor} timestamp={"placeholder"} stats={{} as PostcardStats} type="image">content</Postcard>);
    expect(screen.getByTestId("postcard")).toHaveClass("postcard--image");
  });

  it("applies type=video variant class", () => {
    render(<Postcard data-testid="postcard" postId={"placeholder"} author={{} as PostcardAuthor} timestamp={"placeholder"} stats={{} as PostcardStats} type="video">content</Postcard>);
    expect(screen.getByTestId("postcard")).toHaveClass("postcard--video");
  });

  it("applies type=audio variant class", () => {
    render(<Postcard data-testid="postcard" postId={"placeholder"} author={{} as PostcardAuthor} timestamp={"placeholder"} stats={{} as PostcardStats} type="audio">content</Postcard>);
    expect(screen.getByTestId("postcard")).toHaveClass("postcard--audio");
  });
});

describe("Postcard — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Postcard aria-label="Test Postcard" postId={"placeholder"} author={{} as PostcardAuthor} timestamp={"placeholder"} stats={{} as PostcardStats}>content</Postcard></>);
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
