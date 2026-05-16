// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface AccordionBehaviorOptions {
  value?: () => string | string[] | undefined;
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class AccordionBehavior {
  readonly opennessState: ControllableStateController<string | string[]>;

  constructor(host: ReactiveControllerHost, private opts: AccordionBehaviorOptions = {}) {
    this.opennessState = new ControllableStateController<string | string[]>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? undefined as never,
      onChange: opts.onValueChange,
    });
  }

  get openness(): string | string[] { return this.opennessState.value; }
  setOpenness(value: string | string[]) { this.opennessState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
