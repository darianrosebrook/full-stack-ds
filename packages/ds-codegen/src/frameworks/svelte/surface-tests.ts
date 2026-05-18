/**
 * Svelte behavioral tests for the Anchored Presence Surface family.
 *
 * Parity with React (499ed17) and Vue (38454fe). Same semantic
 * surface: hover/focus open, pointer-leave/blur/escape close,
 * aria-describedby wiring, disabled suppression, controlled/
 * uncontrolled state, host-adoption via snippet, and consumer
 * handler/ref composition.
 *
 * Emits TWO files: the test file (`.test.ts`) and a fixture component
 * file (`.svelte`) consumed by the tests. @testing-library/svelte
 * cannot render an in-test compound tree without a fixture SFC.
 */
import type { ComponentIR } from "../../ir.js";

export interface SvelteSurfaceTestFiles {
  testFile: string;
  fixtureFile: string;
}

export function generateSvelteSurfaceTestFiles(ir: ComponentIR): SvelteSurfaceTestFiles {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateSvelteSurfaceTestFiles called on ${ir.name} without ir.surface`,
    );
  }
  if (surface.kind !== "tooltip") {
    throw new Error(
      `Svelte surface test emitter only supports kind "tooltip" in F-2C-2 (got "${surface.kind}").`,
    );
  }
  return {
    testFile: emitTestFile(ir),
    fixtureFile: emitFixtureFile(ir),
  };
}

function emitFixtureFile(ir: ComponentIR): string {
  const name = ir.name;
  return [
    `<script lang="ts">`,
    `// Test fixture for ${name} presence-surface compound.`,
    `import ${name} from "../${name}.svelte";`,
    `import ${name}Trigger from "../${name}Trigger.svelte";`,
    `import ${name}Content from "../${name}Content.svelte";`,
    ``,
    `interface Props {`,
    `  open?: boolean;`,
    `  defaultOpen?: boolean;`,
    `  onOpenChange?: (open: boolean) => void;`,
    `  disabled?: boolean;`,
    `  closeOnEscape?: boolean;`,
    `  closeOnBlur?: boolean;`,
    `  /** When true, render the asChild snippet adoption path. */`,
    `  asChild?: boolean;`,
    `  /** Spy invoked from the adopted child's onpointerenter handler.`,
    `   *  Used by the host-adoption tests to assert consumer handlers`,
    `   *  still run when composed with the substrate's handler. */`,
    `  consumerOnPointerEnter?: (event: PointerEvent) => void;`,
    `  /** When set, the consumer's handler calls preventDefault to`,
    `   *  exercise the substrate's consumer-opt-out contract. */`,
    `  consumerPreventsDefault?: boolean;`,
    `}`,
    ``,
    `let {`,
    `  open,`,
    `  defaultOpen,`,
    `  onOpenChange,`,
    `  disabled,`,
    `  closeOnEscape,`,
    `  closeOnBlur,`,
    `  asChild,`,
    `  consumerOnPointerEnter,`,
    `  consumerPreventsDefault,`,
    `}: Props = $props();`,
    `</script>`,
    ``,
    `<${name}`,
    `  {open}`,
    `  {defaultOpen}`,
    `  {onOpenChange}`,
    `  {disabled}`,
    `  {closeOnEscape}`,
    `  {closeOnBlur}`,
    `>`,
    `  {#if asChild}`,
    `    <${name}Trigger asChild>`,
    `      {#snippet trigger({ action, attrs })}`,
    `        <!--`,
    `          Split binding: action owns DOM-node registration via`,
    `          use:action; attrs carries ARIA/data/handlers via spread.`,
    `          Both are required — applying only one silently breaks`,
    `          the substrate.`,
    ``,
    `          Consumer-handler composition: we run our own`,
    `          onpointerenter first, optionally call preventDefault,`,
    `          and only invoke the substrate's handler when not`,
    `          prevented. This mirrors the React asChild and Vue`,
    `          slot-props contracts.`,
    `        -->`,
    `        <a`,
    `          href="#help"`,
    `          data-testid="trigger"`,
    `          use:action`,
    `          {...attrs}`,
    `          onpointerenter={(e) => {`,
    `            consumerOnPointerEnter?.(e);`,
    `            if (consumerPreventsDefault) e.preventDefault();`,
    `            if (!e.defaultPrevented) attrs.onpointerenter?.(e);`,
    `          }}`,
    `        >Save</a>`,
    `      {/snippet}`,
    `    </${name}Trigger>`,
    `  {:else}`,
    `    <${name}Trigger data-testid="trigger">Save</${name}Trigger>`,
    `  {/if}`,
    `  <${name}Content data-testid="content">Help text</${name}Content>`,
    `</${name}>`,
    ``,
  ].join("\n");
}

function emitTestFile(ir: ComponentIR): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const importsBody = [
    `import { describe, expect, it, vi } from "vitest";`,
    `import type { Component } from "svelte";`,
    `import { tick } from "svelte";`,
    `import { render, fireEvent } from "@testing-library/svelte";`,
    `import { axe } from "vitest-axe";`,
    `import ${name}Fixture from "./${name}Fixture.svelte";`,
    ``,
    `declare module "vitest" {`,
    `  interface Assertion<T> {`,
    `    toHaveNoViolations(): void;`,
    `  }`,
    `}`,
  ].join("\n");

  const testsBody = `function mountDefault(props: Record<string, unknown> = {}) {
  return render(${name}Fixture as unknown as Component<Record<string, unknown>>, { props });
}

describe("${name} — compound API surface", () => {
  it("renders the trigger but not the content when closed", async () => {
    const { container } = mountDefault();
    await tick();
    expect(container.querySelector("[data-testid='trigger']")).toBeTruthy();
    expect(container.querySelector("[data-testid='content']")).toBeNull();
  });

  it("renders the content when defaultOpen={true}", async () => {
    const { container } = mountDefault({ defaultOpen: true });
    await tick();
    const content = container.querySelector("[data-testid='content']");
    expect(content).toBeTruthy();
    expect(content?.getAttribute("role")).toBe("tooltip");
  });

  it("opens on pointerenter (hover) over the trigger", async () => {
    const { container } = mountDefault();
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.pointerEnter(trigger);
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("opens on focus over the trigger", async () => {
    const { container } = mountDefault();
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.focus(trigger);
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("closes on pointerleave from the trigger (no grace path into content)", async () => {
    const { container } = mountDefault({ defaultOpen: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    trigger.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, relatedTarget: document.body }));
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeNull();
  });

  it("closes on Escape", async () => {
    const { container } = mountDefault({ defaultOpen: true });
    await tick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeNull();
  });

  it("closes on blur from the trigger", async () => {
    const { container } = mountDefault({ defaultOpen: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    trigger.dispatchEvent(new FocusEvent("blur", { bubbles: true, relatedTarget: document.body }));
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeNull();
  });

  it("wires aria-describedby from trigger to content when open", async () => {
    const { container } = mountDefault({ defaultOpen: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    const content = container.querySelector("[data-testid='content']")!;
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(trigger.getAttribute("aria-describedby")).toBe(id);
  });

  it("does NOT set aria-describedby when closed", async () => {
    const { container } = mountDefault();
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    expect(trigger.getAttribute("aria-describedby")).toBeNull();
  });

  it("fires onOpenChange on uncontrolled open", async () => {
    const spy = vi.fn();
    const { container } = mountDefault({ onOpenChange: spy });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.pointerEnter(trigger);
    await tick();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("respects disabled — pointerenter does not open", async () => {
    const { container } = mountDefault({ disabled: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.pointerEnter(trigger);
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeNull();
  });

  it("disabled root does not fire onOpenChange on hover", async () => {
    const spy = vi.fn();
    const { container } = mountDefault({ disabled: true, onOpenChange: spy });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.pointerEnter(trigger);
    await tick();
    expect(spy).not.toHaveBeenCalled();
  });

  it("controlled open prop overrides internal state", async () => {
    const { container, rerender } = mountDefault({ open: false });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.pointerEnter(trigger);
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeNull();
    await rerender({ open: true });
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("pointerleave INTO content does not close (grace path)", async () => {
    const { container } = mountDefault({ defaultOpen: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    const content = container.querySelector("[data-testid='content']")!;
    trigger.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, relatedTarget: content }));
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("closeOnEscape={false} prevents Escape dismissal", async () => {
    const { container } = mountDefault({ defaultOpen: true, closeOnEscape: false });
    await tick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("closeOnBlur={false} prevents blur dismissal", async () => {
    const { container } = mountDefault({ defaultOpen: true, closeOnBlur: false });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    trigger.dispatchEvent(new FocusEvent("blur", { bubbles: true, relatedTarget: document.body }));
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("unmount removes document-level listeners", async () => {
    const spy = vi.fn();
    const { unmount } = mountDefault({ defaultOpen: true, onOpenChange: spy });
    await tick();
    unmount();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("${name} — snippet host adoption", () => {
  it("renders the adopted child as the actual host (no nested button)", async () => {
    const { container } = mountDefault({ asChild: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    expect(trigger.tagName).toBe("A");
    expect(container.querySelector("button")).toBeNull();
  });

  it("asChild opens on pointerenter over the adopted child", async () => {
    const { container } = mountDefault({ asChild: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.pointerEnter(trigger);
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("asChild opens on focus over the adopted child", async () => {
    const { container } = mountDefault({ asChild: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.focus(trigger);
    await tick();
    expect(container.querySelector("[data-testid='content']")).toBeTruthy();
  });

  it("asChild wires aria-describedby onto the adopted child when open", async () => {
    const { container } = mountDefault({ asChild: true, defaultOpen: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    const content = container.querySelector("[data-testid='content']")!;
    expect(trigger.getAttribute("aria-describedby")).toBe(content.getAttribute("id"));
  });

  it("asChild applies data-${cssPrefix}-trigger marker on the adopted host", async () => {
    const { container } = mountDefault({ asChild: true });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    expect(trigger.hasAttribute("data-${cssPrefix}-trigger")).toBe(true);
  });

  it("asChild preserves the consumer's onpointerenter handler when composed manually", async () => {
    const consumerSpy = vi.fn();
    const surfaceSpy = vi.fn();
    const { container } = mountDefault({
      asChild: true,
      onOpenChange: surfaceSpy,
      consumerOnPointerEnter: consumerSpy,
    });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    await fireEvent.pointerEnter(trigger);
    await tick();
    expect(consumerSpy).toHaveBeenCalled();
    expect(surfaceSpy).toHaveBeenCalledWith(true);
  });

  it("asChild — consumer event.preventDefault() suppresses the surface handler", async () => {
    const consumerSpy = vi.fn();
    const surfaceSpy = vi.fn();
    const { container } = mountDefault({
      asChild: true,
      onOpenChange: surfaceSpy,
      consumerOnPointerEnter: consumerSpy,
      consumerPreventsDefault: true,
    });
    await tick();
    const trigger = container.querySelector("[data-testid='trigger']")!;
    // \`pointerenter\` is not cancellable per the DOM spec, so we have
    // to construct a cancellable event manually. Dispatching it on the
    // adopted element exercises the consumer's onpointerenter handler
    // and the substrate's defaultPrevented check.
    trigger.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, cancelable: true }));
    await tick();
    expect(consumerSpy).toHaveBeenCalled();
    expect(surfaceSpy).not.toHaveBeenCalled();
    expect(container.querySelector("[data-testid='content']")).toBeNull();
  });
});

describe("${name} — accessibility", () => {
  it("has no unexpected axe violations when closed", async () => {
    const { container } = mountDefault();
    await tick();
    const results = (await axe(container)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  it("has no unexpected axe violations when open", async () => {
    const { container } = mountDefault({ defaultOpen: true });
    await tick();
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
