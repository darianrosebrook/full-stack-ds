import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from './ControllableStateController.js';

export interface AnchorToggleOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
}

/**
 * ReactiveController that manages anchor-anchored toggle panels
 * (e.g. dropdowns, popovers). Handles Escape-to-close and
 * outside-click-to-close, wiring listeners on connect/disconnect.
 *
 * Set `anchorEl` and `panelEl` after the first render to enable
 * focus-return and outside-click detection.
 */
export class AnchorToggleController {
  private state: ControllableStateController<boolean>;
  anchorEl: HTMLElement | null = null;
  panelEl: HTMLElement | null = null;
  private host: ReactiveControllerHost & EventTarget;

  constructor(host: ReactiveControllerHost & EventTarget, opts: AnchorToggleOptions = {}) {
    this.host = host;
    this.state = new ControllableStateController(host, {
      controlled: opts.open,
      defaultValue: opts.defaultOpen ?? false,
      onChange: opts.onOpenChange,
    });
    host.addController(this);
  }

  get open(): boolean { return this.state.value; }
  setOpen(value: boolean) { this.state.set(value); }

  private _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this.setOpen(false);
      this.anchorEl?.focus();
    }
  };

  private _onPointerDown = (e: PointerEvent) => {
    const target = e.target as Node;
    if (
      this.open &&
      this.panelEl && !this.panelEl.contains(target) &&
      this.anchorEl && !this.anchorEl.contains(target)
    ) {
      this.setOpen(false);
    }
  };

  hostConnected() {
    document.addEventListener('keydown', this._onKeydown);
    document.addEventListener('pointerdown', this._onPointerDown);
  }

  hostDisconnected() {
    document.removeEventListener('keydown', this._onKeydown);
    document.removeEventListener('pointerdown', this._onPointerDown);
  }
}
