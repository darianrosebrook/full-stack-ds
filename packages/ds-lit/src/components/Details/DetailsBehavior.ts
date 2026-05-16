// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface DetailsBehaviorOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class DetailsBehavior {
  readonly openState: ControllableStateController<boolean>;

  constructor(host: ReactiveControllerHost, private opts: DetailsBehaviorOptions = {}) {
    this.openState = new ControllableStateController<boolean>(host, {
      controlled: opts.open,
      defaultValue: opts.defaultOpen ?? false,
      onChange: opts.onOpenChange,
    });
  }

  get open(): boolean { return this.openState.value; }
  setOpen(value: boolean) { this.openState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
