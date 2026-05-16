// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface TruncateBehaviorOptions {
  expanded?: () => boolean | undefined;
  defaultExpanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class TruncateBehavior {
  readonly expandedState: ControllableStateController<boolean>;

  constructor(host: ReactiveControllerHost, private opts: TruncateBehaviorOptions = {}) {
    this.expandedState = new ControllableStateController<boolean>(host, {
      controlled: opts.expanded,
      defaultValue: opts.defaultExpanded ?? false,
      onChange: opts.onExpandedChange,
    });
  }

  get expanded(): boolean { return this.expandedState.value; }
  setExpanded(value: boolean) { this.expandedState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
