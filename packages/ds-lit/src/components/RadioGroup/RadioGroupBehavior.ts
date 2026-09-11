// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface RadioGroupBehaviorOptions {
  value?: () => string | undefined;
  defaultValue?: string;
  onChange?: (value: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class RadioGroupBehavior {
  readonly selectionState: ControllableStateController<string>;

  constructor(host: ReactiveControllerHost, private opts: RadioGroupBehaviorOptions = {}) {
    this.selectionState = new ControllableStateController<string>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? "",
      onChange: opts.onChange,
    });
  }

  get selection(): string { return this.selectionState.value; }
  setSelection(value: string) { this.selectionState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
