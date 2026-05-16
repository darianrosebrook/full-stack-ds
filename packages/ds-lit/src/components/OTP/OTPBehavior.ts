// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface OTPBehaviorOptions {
  value?: () => string | undefined;
  defaultValue?: string;
  onChange?: (value: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class OTPBehavior {
  readonly valueState: ControllableStateController<string>;

  constructor(host: ReactiveControllerHost, private opts: OTPBehaviorOptions = {}) {
    this.valueState = new ControllableStateController<string>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? "",
      onChange: opts.onChange,
    });
  }

  get value(): string { return this.valueState.value; }
  setValue(value: string) { this.valueState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
