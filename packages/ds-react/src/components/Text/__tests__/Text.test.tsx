// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Text, TextTitle, TextBody } from "../Text";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Text — unit", () => {
  it("renders with default props", () => {
    render(<Text data-testid="text" />);
    expect(screen.getByTestId("text")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Text data-testid="text" />);
    expect(screen.getByTestId("text")).toHaveClass("text");
  });

  it("merges custom className", () => {
    render(<Text data-testid="text" className="custom" />);
    expect(screen.getByTestId("text")).toHaveClass("text", "custom");
  });

  it("applies variant=display variant class", () => {
    render(<Text data-testid="text" variant="display" />);
    expect(screen.getByTestId("text")).toHaveClass("text--display");
  });

  it("applies variant=headline variant class", () => {
    render(<Text data-testid="text" variant="headline" />);
    expect(screen.getByTestId("text")).toHaveClass("text--headline");
  });

  it("applies variant=title variant class", () => {
    render(<Text data-testid="text" variant="title" />);
    expect(screen.getByTestId("text")).toHaveClass("text--title");
  });

  it("applies variant=body variant class", () => {
    render(<Text data-testid="text" variant="body" />);
    expect(screen.getByTestId("text")).toHaveClass("text--body");
  });

  it("applies variant=caption variant class", () => {
    render(<Text data-testid="text" variant="caption" />);
    expect(screen.getByTestId("text")).toHaveClass("text--caption");
  });

  it("applies variant=overline variant class", () => {
    render(<Text data-testid="text" variant="overline" />);
    expect(screen.getByTestId("text")).toHaveClass("text--overline");
  });

  it("applies variant=code variant class", () => {
    render(<Text data-testid="text" variant="code" />);
    expect(screen.getByTestId("text")).toHaveClass("text--code");
  });

  it("applies size=xs variant class", () => {
    render(<Text data-testid="text" size="xs" />);
    expect(screen.getByTestId("text")).toHaveClass("text--xs");
  });

  it("applies size=sm variant class", () => {
    render(<Text data-testid="text" size="sm" />);
    expect(screen.getByTestId("text")).toHaveClass("text--sm");
  });

  it("applies size=md variant class", () => {
    render(<Text data-testid="text" size="md" />);
    expect(screen.getByTestId("text")).toHaveClass("text--md");
  });

  it("applies size=lg variant class", () => {
    render(<Text data-testid="text" size="lg" />);
    expect(screen.getByTestId("text")).toHaveClass("text--lg");
  });

  it("applies size=xl variant class", () => {
    render(<Text data-testid="text" size="xl" />);
    expect(screen.getByTestId("text")).toHaveClass("text--xl");
  });

  it("applies size=2xl variant class", () => {
    render(<Text data-testid="text" size="2xl" />);
    expect(screen.getByTestId("text")).toHaveClass("text--2xl");
  });

  it("applies size=3xl variant class", () => {
    render(<Text data-testid="text" size="3xl" />);
    expect(screen.getByTestId("text")).toHaveClass("text--3xl");
  });

  it("applies weight=light variant class", () => {
    render(<Text data-testid="text" weight="light" />);
    expect(screen.getByTestId("text")).toHaveClass("text--light");
  });

  it("applies weight=normal variant class", () => {
    render(<Text data-testid="text" weight="normal" />);
    expect(screen.getByTestId("text")).toHaveClass("text--normal");
  });

  it("applies weight=medium variant class", () => {
    render(<Text data-testid="text" weight="medium" />);
    expect(screen.getByTestId("text")).toHaveClass("text--medium");
  });

  it("applies weight=semibold variant class", () => {
    render(<Text data-testid="text" weight="semibold" />);
    expect(screen.getByTestId("text")).toHaveClass("text--semibold");
  });

  it("applies weight=bold variant class", () => {
    render(<Text data-testid="text" weight="bold" />);
    expect(screen.getByTestId("text")).toHaveClass("text--bold");
  });

  it("applies align=left variant class", () => {
    render(<Text data-testid="text" align="left" />);
    expect(screen.getByTestId("text")).toHaveClass("text--left");
  });

  it("applies align=center variant class", () => {
    render(<Text data-testid="text" align="center" />);
    expect(screen.getByTestId("text")).toHaveClass("text--center");
  });

  it("applies align=right variant class", () => {
    render(<Text data-testid="text" align="right" />);
    expect(screen.getByTestId("text")).toHaveClass("text--right");
  });

  it("applies align=justify variant class", () => {
    render(<Text data-testid="text" align="justify" />);
    expect(screen.getByTestId("text")).toHaveClass("text--justify");
  });

  it("applies transform=none variant class", () => {
    render(<Text data-testid="text" transform="none" />);
    expect(screen.getByTestId("text")).toHaveClass("text--none");
  });

  it("applies transform=uppercase variant class", () => {
    render(<Text data-testid="text" transform="uppercase" />);
    expect(screen.getByTestId("text")).toHaveClass("text--uppercase");
  });

  it("applies transform=lowercase variant class", () => {
    render(<Text data-testid="text" transform="lowercase" />);
    expect(screen.getByTestId("text")).toHaveClass("text--lowercase");
  });

  it("applies transform=capitalize variant class", () => {
    render(<Text data-testid="text" transform="capitalize" />);
    expect(screen.getByTestId("text")).toHaveClass("text--capitalize");
  });
});

describe("Text — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Text /></>);
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
