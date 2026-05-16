// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface ToggleSwitchBehaviorOptions {
  checked?: () => boolean | undefined;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class ToggleSwitchBehavior {
  readonly checkedState: ControllableStateController<boolean>;

  constructor(host: ReactiveControllerHost, private opts: ToggleSwitchBehaviorOptions = {}) {
    this.checkedState = new ControllableStateController<boolean>(host, {
      controlled: opts.checked,
      defaultValue: opts.defaultChecked ?? false,
      onChange: opts.onChange,
    });
  }

  get checked(): boolean { return this.checkedState.value; }
  setChecked(value: boolean) { this.checkedState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
