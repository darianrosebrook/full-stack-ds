// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Select, SelectTrigger, SelectContent, SelectOption } from "../Select";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Select — unit", () => {
  it("renders with default props", () => {
    render(<Select data-testid="select" open={true} />);
    expect(screen.getByTestId("select")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Select data-testid="select" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select");
  });

  it("merges custom className", () => {
    render(<Select data-testid="select" className="custom" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select", "custom");
  });

  it("applies size=sm variant class", () => {
    render(<Select data-testid="select" size="sm" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--sm");
  });

  it("applies size=md variant class", () => {
    render(<Select data-testid="select" size="md" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--md");
  });

  it("applies size=lg variant class", () => {
    render(<Select data-testid="select" size="lg" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--lg");
  });

  it("applies position=bottom variant class", () => {
    render(<Select data-testid="select" position="bottom" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--bottom");
  });

  it("applies position=top variant class", () => {
    render(<Select data-testid="select" position="top" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--top");
  });

  it("applies position=auto variant class", () => {
    render(<Select data-testid="select" position="auto" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--auto");
  });

  it("calls onChange when selection changes", async () => {
    const onChangeSpy = vi.fn();
    expect(() => render(<Select data-testid="select" value={""} onChange={onChangeSpy} open={true} />)).not.toThrow();
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Select data-testid="select" open={false} onOpenChange={onOpenChangeSpy} />)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Select data-testid="select" open={true} onOpenChange={onOpenChangeSpy} />);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Select — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Select aria-label="Test Select" open={true} /></>);
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
// FEAT-BINDING-CALL-WITH-ARG-01: the option-click wire
// `channel:selection.onChange(iter:item.value)` must invoke onChange with the
// clicked option's value — proving the call-with-argument setter form lowers
// to a live per-item write (not the pre-fix self-assignment no-op).
import { fireEvent } from "@testing-library/react";

describe("Select — option selection (FEAT-BINDING-CALL-WITH-ARG-01)", () => {
  const OPTIONS = [
    { value: "alpha", label: "Alpha" },
    { value: "beta", label: "Beta" },
    { value: "gamma", label: "Gamma" },
  ];

  it("clicking option N calls onChange with that option's value", () => {
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Fruit"
        open={true}
        value={""}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);

    fireEvent.click(options[2]); // Gamma
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("gamma");

    fireEvent.click(options[0]); // Alpha
    expect(onChange).toHaveBeenLastCalledWith("alpha");
  });

  it("does not fire a self-write: clicking passes the ITEM value, not the current selection", () => {
    // Falsification of the pre-fix no-op: with selection already "beta",
    // clicking "alpha" must report "alpha", never the standing "beta".
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Fruit"
        open={true}
        value={"beta"}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getAllByRole("option")[0]); // Alpha
    expect(onChange).toHaveBeenCalledWith("alpha");
    expect(onChange).not.toHaveBeenCalledWith("beta");
  });
});

// FEAT-CHANNEL-UPDATE-OPERATIONS-01: the option-click wire is now
// `toggleMembership(iter:item.value, prop:multiple)`. Single mode keeps
// replace (proven above); multiple mode toggles array membership. Pins the
// A3 behavioral claim for React.
describe("Select — multiple-mode toggle (channelUpdate toggleMembership)", () => {
  const OPTIONS = [
    { value: "alpha", label: "Alpha" },
    { value: "beta", label: "Beta" },
    { value: "gamma", label: "Gamma" },
  ];

  it("in multiple mode, clicking an ABSENT option ADDS it to the array", () => {
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Fruit"
        multiple
        open={true}
        value={["alpha"]}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getAllByRole("option")[2]); // Gamma
    expect(onChange).toHaveBeenLastCalledWith(["alpha", "gamma"]);
  });

  it("in multiple mode, clicking a PRESENT option REMOVES it from the array", () => {
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Fruit"
        multiple
        open={true}
        value={["alpha", "beta"]}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getAllByRole("option")[0]); // Alpha (present)
    expect(onChange).toHaveBeenLastCalledWith(["beta"]);
  });

  it("in multiple mode, a scalar current value is coerced to an array before toggling", () => {
    // Falsification: if the toggle wrote a raw string it would throw / produce
    // a wrong shape. A standing scalar "beta" + clicking "gamma" must yield the
    // two-element array.
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Fruit"
        multiple
        open={true}
        value={"beta" as unknown as string[]}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getAllByRole("option")[2]); // Gamma
    expect(onChange).toHaveBeenLastCalledWith(["beta", "gamma"]);
  });

  it("single mode is unchanged: clicking replaces with the scalar value", () => {
    // Regression guard on the mode dispatch — without `multiple`, the wire must
    // still take the `!modeGate` replace branch, not toggle.
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Fruit"
        open={true}
        value={"alpha"}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getAllByRole("option")[1]); // Beta
    expect(onChange).toHaveBeenLastCalledWith("beta");
  });
});
// @custom:end
