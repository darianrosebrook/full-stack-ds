// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { AnchorToggleController, ControllableStateController, PortalController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface PopoverBehaviorOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class PopoverBehavior {
  readonly anchorToggle: AnchorToggleController;
  readonly portal: PortalController;

  constructor(host: ReactiveControllerHost, private opts: PopoverBehaviorOptions = {}) {
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
}
// @generated:end

// @custom:start trailing

// @custom:end
