// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController, DismissalController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface WalkthroughBehaviorOptions {
  index?: () => number | undefined;
  defaultIndex?: number;
  onStepChange?: (value: number) => void;
  closeOnOutsideClick?: boolean;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class WalkthroughBehavior {
  readonly stepState: ControllableStateController<number>;
  readonly dismissal: DismissalController;

  constructor(host: ReactiveControllerHost, private opts: WalkthroughBehaviorOptions = {}) {
    this.stepState = new ControllableStateController<number>(host, {
      controlled: opts.index,
      defaultValue: opts.defaultIndex ?? 0,
      onChange: opts.onStepChange,
    });
    this.dismissal = new DismissalController(host, {
      open: () => true,
      closeOnEscape: () => true,
      onDismiss: () => { void 0; },
    });
  }

  get step(): number { return this.stepState.value; }
  setStep(value: number) { this.stepState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
