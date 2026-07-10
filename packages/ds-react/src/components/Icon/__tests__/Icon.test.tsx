// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Icon } from "../Icon";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Icon — unit", () => {
  it("renders with default props", () => {
    render(<Icon data-testid="icon" name={"placeholder"} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Icon data-testid="icon" name={"placeholder"} />);
    expect(screen.getByTestId("icon")).toHaveClass("icon");
  });

  it("merges custom className", () => {
    render(<Icon data-testid="icon" name={"placeholder"} className="custom" />);
    expect(screen.getByTestId("icon")).toHaveClass("icon", "custom");
  });
});

describe("Icon — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Icon aria-label="Test Icon" name={"placeholder"} /></>);
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
describe("Icon — catalog glyph rendering (ICON-CATALOG-RUNTIME-DELIVERY-01)", () => {
  it("renders the authored 16-grid check glyph at size=sm", () => {
    const { container } = render(<Icon name="check" size="sm" />);
    const svg = container.querySelector('svg[data-fsds-icon="check"]');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg!.getAttribute("width")).toBe("16");
    expect(svg!.getAttribute("height")).toBe("16");
    const paths = svg!.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    // the exact authored path data, not just element presence
    expect(paths[0].getAttribute("d")).toBe("M3.5 8.5L6.5 11.5L12.5 4.5");
    expect(paths[0].getAttribute("stroke")).toBe("currentColor");
    expect(paths[0].getAttribute("stroke-linecap")).toBe("round");
  });

  it("floor-selects the 16-grid variant at size=md but renders at 20px", () => {
    // md=20px has no authored variant; selection must pick the largest
    // authored size <= 20 (the 16 grid), while width/height honor the
    // requested 20px — viewBox scaling, never synthesized geometry.
    const { container } = render(<Icon name="check" size="md" />);
    const svg = container.querySelector('svg[data-fsds-icon="check"]');
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg!.getAttribute("width")).toBe("20");
    expect(svg!.getAttribute("height")).toBe("20");
  });

  it("selects the authored 24-grid variant at size=lg", () => {
    const { container } = render(<Icon name="check" size="lg" />);
    const svg = container.querySelector('svg[data-fsds-icon="check"]');
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg!.getAttribute("width")).toBe("24");
    expect(svg!.querySelector("path")!.getAttribute("d")).toBe("M5 12.5L9.5 17L19 6.5");
  });

  it("renders every authored path of a multi-path glyph in order", () => {
    const { container } = render(<Icon name="triangle-alert" size="sm" />);
    const svg = container.querySelector('svg[data-fsds-icon="triangle-alert"]');
    const ds = [...svg!.querySelectorAll("path")].map((p) => p.getAttribute("d"));
    expect(ds).toEqual([
      "M8 2.25L14.5 13.25H1.5L8 2.25Z",
      "M8 6.5V9",
      "M8 11.25H8.01",
    ]);
  });

  it("renders no svg at all for an unknown icon name", () => {
    const { container } = render(<Icon data-testid="icon" name="does-not-exist" />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });
});
// @custom:end
