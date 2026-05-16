import type { ReactiveControllerHost } from 'lit';

export interface ControllableStateOptions<T> {
  /** Getter for the controlled value (returns undefined → uncontrolled). */
  controlled?: () => T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}

/**
 * ReactiveController that mirrors the controlled/uncontrolled state
 * pattern used by the React and Vue primitives.
 *
 * Attach this controller in the host element's constructor. Read
 * `controller.value` in `render()` and call `controller.set(next)`
 * from event handlers. The controller automatically calls
 * `host.requestUpdate()` when uncontrolled state changes.
 */
export class ControllableStateController<T> {
  private _internal: T;
  private host: ReactiveControllerHost;
  private opts: ControllableStateOptions<T>;

  constructor(host: ReactiveControllerHost, opts: ControllableStateOptions<T>) {
    this._internal = opts.defaultValue;
    this.opts = opts;
    this.host = host;
    host.addController(this);
  }

  get value(): T {
    return this.opts.controlled?.() ?? this._internal;
  }

  set(next: T) {
    this._internal = next;
    this.opts.onChange?.(next);
    this.host.requestUpdate();
  }

  hostConnected() {}
  hostDisconnected() {}
}
