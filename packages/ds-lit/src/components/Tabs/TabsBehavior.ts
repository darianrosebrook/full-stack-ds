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
  private _host: ReactiveControllerHost;
  readonly activeTabState: ControllableStateController<string>;

  constructor(host: ReactiveControllerHost, private opts: TabsBehaviorOptions = {}) {
    this._host = host;
    this.activeTabState = new ControllableStateController<string>(host, {
      controlled: opts.value,
      defaultValue: opts.defaultValue ?? "",
      onChange: opts.onValueChange,
    });
  }

  get activeTab(): string { return this.activeTabState.value; }
  setActiveTab(value: string) { this.activeTabState.set(value); }

  /** DOM-order list of registered tab values. */
  registeredTabs: string[] = [];

  registerTab(value: string): void {
    if (this.registeredTabs.includes(value)) return;
    this.registeredTabs = [...this.registeredTabs, value];
    this._host.requestUpdate();
  }

  unregisterTab(value: string): void {
    const next = this.registeredTabs.filter((v) => v !== value);
    if (next.length === this.registeredTabs.length) return;
    this.registeredTabs = next;
    this._host.requestUpdate();
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
