// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { ControllableStateController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface TabsBehaviorOptions {
  value?: () => string | undefined;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class TabsBehavior {
  readonly activeTabState: ControllableStateController<string>;

  constructor(host: ReactiveControllerHost, private opts: TabsBehaviorOptions = {}) {
    this.activeTabState = new ControllableStateController<string>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? "",
      onChange: opts.onValueChange,
    });
  }

  get activeTab(): string { return this.activeTabState.value; }
  setActiveTab(value: string) { this.activeTabState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
