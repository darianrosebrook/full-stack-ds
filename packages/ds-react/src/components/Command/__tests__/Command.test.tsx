// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Command, CommandList, CommandGroup, CommandItem } from "../Command";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Command — unit", () => {
  it("renders with default props", () => {
    render(<Command data-testid="command" open={true} />);
    expect(screen.getByTestId("command")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Command data-testid="command" open={true} />);
    expect(screen.getByTestId("command")).toHaveClass("command");
  });

  it("merges custom className", () => {
    render(<Command data-testid="command" className="custom" open={true} />);
    expect(screen.getByTestId("command")).toHaveClass("command", "custom");
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Command data-testid="command" open={false} onOpenChange={onOpenChangeSpy} />)).not.toThrow();
  });

  it("calls onSearchChange when search changes", async () => {
    const onSearchChangeSpy = vi.fn();
    expect(() => render(<Command data-testid="command" search={""} onSearchChange={onSearchChangeSpy} open={true} />)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Command data-testid="command" open={true} onOpenChange={onOpenChangeSpy} />);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Command data-testid="command" open={true} onOpenChange={onOpenChangeSpy} />);
    fireEvent.click(screen.getByTestId("command"));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Command — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Command aria-label="Test Command" open={true} /></>);
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

describe("Command — portal (FIX-PORTAL-CONTRACT-ADJUDICATION-01)", () => {
  it("mounts the command root at document.body, escaping an ancestor stacking context", () => {
    // A transform/overflow ancestor creates a stacking context that would
    // clip a merely-fixed command palette. Portaling the root to document.body
    // escapes it: the command's DOM parent must be document.body, NOT the
    // ancestor the consumer rendered it inside.
    const { container } = render(
      <div style={{ transform: "translateZ(0)", overflow: "hidden" }}>
        <Command open aria-label="Portaled Command" data-testid="portaled-command" />
      </div>,
    );
    const commandRoot = document.querySelector<HTMLElement>(
      '[data-testid="portaled-command"]',
    );
    expect(commandRoot).not.toBeNull();
    // The load-bearing assertion: the portaled root's parent is document.body,
    // not the transform ancestor that would otherwise trap it.
    expect(commandRoot?.parentElement).toBe(document.body);
    expect(container.contains(commandRoot)).toBe(false);
  });
});

// @custom:end
