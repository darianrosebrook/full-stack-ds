// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface ShuttleBehaviorOptions {
  value?: () => string[] | undefined;
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class ShuttleBehavior {
  readonly selectionState: ControllableStateController<string[]>;

  constructor(host: ReactiveControllerHost, private opts: ShuttleBehaviorOptions = {}) {
    this.selectionState = new ControllableStateController<string[]>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? undefined as never,
      onChange: opts.onValueChange,
    });
  }

  get selection(): string[] { return this.selectionState.value; }
  setSelection(value: string[]) { this.selectionState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
