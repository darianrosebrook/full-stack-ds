// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { AnchorToggleController, ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface SelectBehaviorOptions {
  value?: () => string | string[] | undefined;
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  containerEl?: HTMLElement;
  /** Mode gate the keyboard select behavior reads. */
  multiple?: () => boolean | undefined;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class SelectBehavior {
  readonly selectionState: ControllableStateController<string | string[]>;
  readonly anchorToggle: AnchorToggleController;

  constructor(host: ReactiveControllerHost, private opts: SelectBehaviorOptions = {}) {
    this.selectionState = new ControllableStateController<string | string[]>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? undefined as never,
      onChange: opts.onChange,
    });
    this.anchorToggle = new AnchorToggleController(
      host as ReactiveControllerHost & EventTarget,
      {
        open: opts.open,
        defaultOpen: opts.defaultOpen ?? false,
        onOpenChange: opts.onOpenChange,
      },
    );
  }

  get open(): boolean { return this.anchorToggle.open; }
  setOpen(value: boolean) { this.anchorToggle.setOpen(value); }

  get selection(): string | string[] { return this.selectionState.value; }
  setSelection(value: string | string[]) { this.selectionState.set(value); }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (!(event.key === "ArrowDown")) return;
    event.preventDefault();
    this.setOpen(true);
    requestAnimationFrame(() => {
      const panel = this.opts.containerEl;
      if (!panel) return;
      (panel.querySelector<HTMLElement>("input") ?? panel.querySelector<HTMLElement>("[role=\"option\"]"))?.focus();
    });
  }

  handleContentKeydown(event: KeyboardEvent): void {
    const items = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>("[role=\"option\"]"),
    );
    const root = (event.currentTarget as HTMLElement).getRootNode();
    const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
    const currentIndex = items.findIndex((item) => item === active);
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

  handleOptionKeydown(event: KeyboardEvent, value: string): void {
    if (!(event.key === "Enter")) return;
    event.preventDefault();
    const currentValue = this.selection;
    const current: string[] = Array.isArray(currentValue) ? [...currentValue] : currentValue == null ? [] : [currentValue];
    this.setSelection(this.opts.multiple?.() ? (current.includes(value) ? current.filter((member) => member !== value) : [...current, value]) : value);
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
