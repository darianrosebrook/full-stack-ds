/**
 * React behavioral tests for the Anchored Presence Surface family.
 *
 * Replaces the legacy class-token-only test plan with assertions against
 * actual surface state and ARIA wiring. Tests cover:
 *   - hover on trigger opens content
 *   - focus on trigger opens content
 *   - pointer-leave on trigger closes content
 *   - blur on trigger closes content
 *   - Escape closes content
 *   - aria-describedby on trigger references the content's id when open
 *   - disabled prop suppresses open
 *   - onOpenChange fires on uncontrolled open
 */
import type { ComponentIR } from "../../ir.js";

export function generateReactSurfaceTest(ir: ComponentIR): string {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateReactSurfaceTest called on ${ir.name} without ir.surface`,
    );
  }
  if (surface.kind !== "tooltip") {
    throw new Error(
      `React surface test emitter only supports kind "tooltip" in F-2A (got "${surface.kind}").`,
    );
  }
  return emitTooltipTests(ir);
}

function emitTooltipTests(ir: ComponentIR): string {
  const name = ir.name;
  const importsBody = [
    `import { describe, it, expect, vi } from "vitest";`,
    `import { render, screen, fireEvent, act } from "@testing-library/react";`,
    `import { axe } from "vitest-axe";`,
    `import { ${name} } from "../${name}";`,
    ``,
    `declare module "vitest" {`,
    `  interface Assertion<T> {`,
    `    toHaveNoViolations(): void;`,
    `  }`,
    `}`,
  ].join("\n");

  const testsBody = `function renderTooltip(props: Partial<React.ComponentProps<typeof ${name}>> = {}) {
  return render(
    <${name} {...props}>
      <${name}.Trigger data-testid="trigger">Open</${name}.Trigger>
      <${name}.Content data-testid="content">Help text</${name}.Content>
    </${name}>,
  );
}

describe("${name} — compound API surface", () => {
  it("renders the trigger but not the content when closed", () => {
    renderTooltip();
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("renders the content when defaultOpen={true}", () => {
    renderTooltip({ defaultOpen: true });
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveAttribute("role", "tooltip");
  });

  it("opens on pointerenter (hover) over the trigger", () => {
    renderTooltip();
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("opens on focus over the trigger", () => {
    renderTooltip();
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.focus(trigger);
    });
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("closes on pointerleave from the trigger (no grace path into content)", () => {
    renderTooltip({ defaultOpen: true });
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.pointerLeave(trigger, { relatedTarget: document.body });
    });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("closes on Escape", () => {
    renderTooltip({ defaultOpen: true });
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("closes on blur from the trigger", () => {
    renderTooltip({ defaultOpen: true });
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.blur(trigger, { relatedTarget: document.body });
    });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("wires aria-describedby from trigger to content when open", () => {
    renderTooltip({ defaultOpen: true });
    const trigger = screen.getByTestId("trigger");
    const content = screen.getByTestId("content");
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(trigger).toHaveAttribute("aria-describedby", id);
  });

  it("does NOT set aria-describedby when closed", () => {
    renderTooltip();
    const trigger = screen.getByTestId("trigger");
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  it("fires onOpenChange on uncontrolled open", () => {
    const spy = vi.fn();
    renderTooltip({ onOpenChange: spy });
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("respects disabled — pointerenter does not open", () => {
    renderTooltip({ disabled: true });
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("disabled root still respects onOpenChange not firing on hover", () => {
    const spy = vi.fn();
    renderTooltip({ disabled: true, onOpenChange: spy });
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it("controlled open prop overrides internal state", () => {
    const { rerender } = renderTooltip({ open: false });
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(screen.queryByTestId("content")).toBeNull();
    rerender(
      <${name} open={true}>
        <${name}.Trigger data-testid="trigger">Open</${name}.Trigger>
        <${name}.Content data-testid="content">Help text</${name}.Content>
      </${name}>,
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});

describe("${name} — accessibility", () => {
  it("has no unexpected axe violations when closed", async () => {
    const { container } = renderTooltip();
    const results = (await axe(container)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  it("has no unexpected axe violations when open", async () => {
    const { container } = renderTooltip({ defaultOpen: true });
    const results = (await axe(container)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});`;

  return [
    `// @generated:start imports`,
    importsBody,
    `// @generated:end`,
    ``,
    `// @generated:start tests`,
    testsBody,
    `// @generated:end`,
    ``,
    `// @custom:start tests`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}
