// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface FieldBehaviorOptions {
  value?: () => unknown | undefined;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class FieldBehavior {
  readonly valueState: ControllableStateController<unknown>;

  constructor(host: ReactiveControllerHost, private opts: FieldBehaviorOptions = {}) {
    this.valueState = new ControllableStateController<unknown>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? undefined as never,
      onChange: opts.onChange,
    });
  }

  get value(): unknown { return this.valueState.value; }
  setValue(value: unknown) { this.valueState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
