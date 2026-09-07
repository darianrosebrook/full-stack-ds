// @generated:start imports
import { createAnchorToggle, createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSelectOptions {
  value?: () => string | string[] | undefined;
  defaultValue?: () => string | string[] | undefined;
  onChange?: () => ((value: string | string[]) => void) | undefined;
  open?: () => boolean | undefined;
  defaultOpen?: () => boolean | undefined;
  onOpenChange?: () => ((value: boolean) => void) | undefined;
  /** Mode gate the keyboard select behavior reads. */
  multiple?: () => boolean | undefined;
}

export interface UseSelectResult {
  readonly selection: string | string[];
  setSelection(next: string | string[]): void;
  readonly open: boolean;
  setOpen(next: boolean): void;
  panelRef: { el: HTMLElement | null };
  anchorRef: { el: HTMLElement | null };
  handleTriggerKeydown: (event: KeyboardEvent) => void;
  handleContentKeydown: (event: KeyboardEvent) => void;
  handleOptionKeydown: (event: KeyboardEvent, value: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useSelect(opts: UseSelectOptions = {}): UseSelectResult {
  const selectionState = createControllableState<string | string[]>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? undefined as never,
    onChange: (v) => opts.onChange?.()?.(v),
  });

  const anchorToggle = createAnchorToggle({
    open: opts.open,
    defaultOpen: opts.defaultOpen?.() ?? false,
    onOpenChange: (v) => opts.onOpenChange?.()?.(v),
  });

  function handleTriggerKeydown(event: KeyboardEvent): void {
    if (!(event.key === "ArrowDown")) return;
    event.preventDefault();
    anchorToggle.setOpen(true);
    requestAnimationFrame(() => {
      if (!anchorToggle.panelRef.el) return;
      (anchorToggle.panelRef.el.querySelector<HTMLElement>("input") ?? anchorToggle.panelRef.el.querySelector<HTMLElement>("[role=\"option\"]"))?.focus();
    });
  }

  function handleContentKeydown(event: KeyboardEvent): void {
    const items = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>("[role=\"option\"]"),
    );
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    if (event.key === "ArrowUp") {
      event.preventDefault();
      items[currentIndex <= 0 ? items.length - 1 : currentIndex - 1]?.focus();
    }
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      items[currentIndex === -1 || currentIndex >= items.length - 1 ? 0 : currentIndex + 1]?.focus();
    }
    else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    }
    else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  function handleOptionKeydown(event: KeyboardEvent, value: string): void {
    if (!(event.key === "Enter")) return;
    event.preventDefault();
    const current = Array.isArray(selectionState.value) ? selectionState.value : selectionState.value == null ? [] : [selectionState.value];
    selectionState.set(opts.multiple?.() ? (current.includes(value) ? current.filter((member) => member !== value) : [...current, value]) : value);
  }

  return {
    get selection() { return selectionState.value; },
    setSelection(v) { selectionState.set(v); },
    get open() { return anchorToggle.open; },
    setOpen(v) { anchorToggle.setOpen(v); },
    anchorRef: anchorToggle.anchorRef,
    panelRef: anchorToggle.panelRef,
    handleTriggerKeydown,
    handleContentKeydown,
    handleOptionKeydown,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
