// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface CalendarBehaviorOptions {
  value?: () => Date | Date[] | null | undefined;
  defaultValue?: Date | Date[] | null;
  onChange?: (value: Date | Date[] | null) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class CalendarBehavior {
  readonly valueState: ControllableStateController<Date | Date[] | null>;

  constructor(host: ReactiveControllerHost, private opts: CalendarBehaviorOptions = {}) {
    this.valueState = new ControllableStateController<Date | Date[] | null>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? undefined as never,
      onChange: opts.onChange,
    });
  }

  get value(): Date | Date[] | null { return this.valueState.value; }
  setValue(value: Date | Date[] | null) { this.valueState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
