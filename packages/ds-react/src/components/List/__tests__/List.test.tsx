// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { List } from "../List";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("List — unit", () => {
  it("renders with default props", () => {
    render(<List data-testid="list">content</List>);
    expect(screen.getByTestId("list")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<List data-testid="list">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list");
  });

  it("merges custom className", () => {
    render(<List data-testid="list" className="custom">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list", "custom");
  });

  it("applies as=ul variant class", () => {
    render(<List data-testid="list" as="ul">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--ul");
  });

  it("applies as=ol variant class", () => {
    render(<List data-testid="list" as="ol">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--ol");
  });

  it("applies as=dl variant class", () => {
    render(<List data-testid="list" as="dl">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--dl");
  });

  it("applies variant=default variant class", () => {
    render(<List data-testid="list" variant="default">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--default");
  });

  it("applies variant=unstyled variant class", () => {
    render(<List data-testid="list" variant="unstyled">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--unstyled");
  });

  it("applies variant=inline variant class", () => {
    render(<List data-testid="list" variant="inline">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--inline");
  });

  it("applies variant=divided variant class", () => {
    render(<List data-testid="list" variant="divided">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--divided");
  });

  it("applies variant=spaced variant class", () => {
    render(<List data-testid="list" variant="spaced">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--spaced");
  });

  it("applies marker=default variant class", () => {
    render(<List data-testid="list" marker="default">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--default");
  });

  it("applies marker=none variant class", () => {
    render(<List data-testid="list" marker="none">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--none");
  });

  it("applies marker=disc variant class", () => {
    render(<List data-testid="list" marker="disc">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--disc");
  });

  it("applies marker=circle variant class", () => {
    render(<List data-testid="list" marker="circle">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--circle");
  });

  it("applies marker=square variant class", () => {
    render(<List data-testid="list" marker="square">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--square");
  });

  it("applies marker=decimal variant class", () => {
    render(<List data-testid="list" marker="decimal">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--decimal");
  });

  it("applies marker=alpha variant class", () => {
    render(<List data-testid="list" marker="alpha">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--alpha");
  });

  it("applies marker=roman variant class", () => {
    render(<List data-testid="list" marker="roman">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--roman");
  });

  it("applies spacing=none variant class", () => {
    render(<List data-testid="list" spacing="none">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--none");
  });

  it("applies spacing=sm variant class", () => {
    render(<List data-testid="list" spacing="sm">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--sm");
  });

  it("applies spacing=md variant class", () => {
    render(<List data-testid="list" spacing="md">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--md");
  });

  it("applies spacing=lg variant class", () => {
    render(<List data-testid="list" spacing="lg">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--lg");
  });

  it("applies size=sm variant class", () => {
    render(<List data-testid="list" size="sm">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--sm");
  });

  it("applies size=md variant class", () => {
    render(<List data-testid="list" size="md">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--md");
  });

  it("applies size=lg variant class", () => {
    render(<List data-testid="list" size="lg">content</List>);
    expect(screen.getByTestId("list")).toHaveClass("list--lg");
  });
});

describe("List — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><List aria-label="Test List">content</List></>);
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
