// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController, DismissalController, FocusTrapController, PortalController, ScrollLockController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface DialogBehaviorOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  containerEl?: HTMLElement;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class DialogBehavior {
  readonly opennessState: ControllableStateController<boolean>;
  readonly focusTrap: FocusTrapController;
  readonly scrollLock: ScrollLockController;
  readonly portal: PortalController;
  readonly dismissal: DismissalController;

  constructor(host: ReactiveControllerHost, private opts: DialogBehaviorOptions = {}) {
    this.opennessState = new ControllableStateController<boolean>(host, {
      controlled: opts.open,
      defaultValue: opts.defaultOpen ?? false,
      onChange: opts.onOpenChange,
    });
    this.focusTrap = new FocusTrapController(host, {
      getActive: () => this.opennessState.value,
      getContainer: () => opts.containerEl ?? null,
    });
    this.scrollLock = new ScrollLockController(host, {
      getActive: () => this.opennessState.value,
    });
    this.portal = new PortalController(host, {
      enabled: true,
      getTarget: () => undefined,
    });
    this.dismissal = new DismissalController(host, {
      open: () => this.opennessState.value,
      closeOnEscape: () => opts.closeOnEscape,
      onDismiss: () => { this.opennessState.set(false); },
    });
  }

  get openness(): boolean { return this.opennessState.value; }
  setOpenness(value: boolean) { this.opennessState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
