// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { AnchorToggleController, ControllableStateController, PortalController } from '../../primitives/index.js';
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
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class SelectBehavior {
  readonly selectionState: ControllableStateController<string | string[]>;
  readonly anchorToggle: AnchorToggleController;
  readonly portal: PortalController;

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
    this.portal = new PortalController(host, {
      enabled: true,
      getTarget: () => undefined,
    });
  }

  get open(): boolean { return this.anchorToggle.open; }
  setOpen(value: boolean) { this.anchorToggle.setOpen(value); }

  get selection(): string | string[] { return this.selectionState.value; }
  setSelection(value: string | string[]) { this.selectionState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
