// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from "../Card";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Card — unit", () => {
  it("renders with default props", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card");
  });

  it("merges custom className", () => {
    render(<Card data-testid="card" className="custom">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("role", "group");
  });

  it("applies status=completed variant class", () => {
    render(<Card data-testid="card" status="completed">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--completed");
  });

  it("applies status=in-progress variant class", () => {
    render(<Card data-testid="card" status="in-progress">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--in-progress");
  });

  it("applies status=planned variant class", () => {
    render(<Card data-testid="card" status="planned">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--planned");
  });

  it("applies status=deprecated variant class", () => {
    render(<Card data-testid="card" status="deprecated">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--deprecated");
  });

  it("applies status=category variant class", () => {
    render(<Card data-testid="card" status="category">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--category");
  });

  it("applies status=complexity variant class", () => {
    render(<Card data-testid="card" status="complexity">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--complexity");
  });

  it("applies density=default variant class", () => {
    render(<Card data-testid="card" density="default">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--default");
  });

  it("applies density=inset variant class", () => {
    render(<Card data-testid="card" density="inset">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--inset");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { baseElement } = render(<><Card aria-label="Test Card">content</Card></>);
    const component = baseElement.querySelector('[data-fsds-component="card"]');
    expect(component).not.toBeNull();
    const results = await axe(component!, componentAxeOptions) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
describe("Card — interactive affordance", () => {
  it("applies the interactive modifier only when requested", () => {
    render(
      <>
        <Card data-testid="static-card">Static</Card>
        <Card data-testid="interactive-card" interactive>
          Interactive
        </Card>
      </>,
    );

    expect(screen.getByTestId("static-card")).not.toHaveClass("card--interactive");
    expect(screen.getByTestId("interactive-card")).toHaveClass("card--interactive");
  });
});

// @custom:end
