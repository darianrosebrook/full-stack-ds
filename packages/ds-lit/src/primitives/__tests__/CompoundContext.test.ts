/**
 * Isolation tests for CompoundContext reactivity.
 *
 * Proves:
 *   1. provideContext() dispatches fsds-context-changed on the provider element.
 *   2. ContextConsumerController calls host.requestUpdate() when the
 *      matching-key event fires.
 *   3. A consumer with a different key is NOT notified.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createCompoundContext,
  provideContext,
  ContextConsumerController,
  FSDS_CONTEXT_CHANGED,
} from "../controllers/CompoundContext.js";
import type { ReactiveController, ReactiveControllerHost } from "lit";

// ---------------------------------------------------------------------------
// Minimal ReactiveControllerHost stub for testing ContextConsumerController
// without a full LitElement environment.
// ---------------------------------------------------------------------------
class FakeHost implements ReactiveControllerHost {
  private controllers: ReactiveController[] = [];
  requestUpdate = vi.fn();
  updateComplete: Promise<boolean> = Promise.resolve(true);

  addController(c: ReactiveController): void {
    this.controllers.push(c);
  }
  removeController(c: ReactiveController): void {
    this.controllers = this.controllers.filter((x) => x !== c);
  }

  /** Call hostConnected() on all registered controllers. */
  connect(): void {
    for (const c of this.controllers) c.hostConnected?.();
  }
  /** Call hostDisconnected() on all registered controllers. */
  disconnect(): void {
    for (const c of this.controllers) c.hostDisconnected?.();
  }
}

// FakeHost must also be an Element (ContextConsumerController needs it for
// the DOM-walk and for addEventListener). We create a real HTMLElement as
// the host but layer the fake reactive methods onto it.
function makeHost(): FakeHost & HTMLElement {
  const el = document.createElement("div") as unknown as FakeHost & HTMLElement;
  const fake = new FakeHost();
  // Copy the reactive methods onto the element.
  el.requestUpdate = fake.requestUpdate;
  el.updateComplete = fake.updateComplete;
  const controllers: ReactiveController[] = [];
  el.addController = (c: ReactiveController) => {
    controllers.push(c);
    // Track controllers on fake too for connect/disconnect.
    fake.addController(c);
  };
  el.removeController = (c: ReactiveController) => {
    fake.removeController(c);
  };
  // Attach connect/disconnect helpers.
  (el as unknown as { _fake: FakeHost })._fake = fake;
  return el;
}

function connectHost(el: HTMLElement): void {
  const fake = (el as unknown as { _fake: FakeHost })._fake;
  fake.connect();
}
function disconnectHost(el: HTMLElement): void {
  const fake = (el as unknown as { _fake: FakeHost })._fake;
  fake.disconnect();
}
function getRequestUpdate(el: HTMLElement): ReturnType<typeof vi.fn> {
  return (el as unknown as { requestUpdate: ReturnType<typeof vi.fn> }).requestUpdate;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("provideContext — event dispatch", () => {
  let provider: HTMLElement;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    provider = document.createElement("div");
    container.append(provider);
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("dispatches fsds-context-changed on the provider element", () => {
    const ctx = createCompoundContext<{ count: number }>("TestCtx");
    const events: CustomEvent[] = [];
    provider.addEventListener(FSDS_CONTEXT_CHANGED, (e) => {
      events.push(e as CustomEvent);
    });

    provideContext(provider, ctx.key, { count: 1 });

    expect(events).toHaveLength(1);
    expect(events[0].detail.key).toBe(ctx.key);
  });

  it("dispatches a new event on each provideContext call", () => {
    const ctx = createCompoundContext<number>("CountCtx");
    let count = 0;
    document.addEventListener(FSDS_CONTEXT_CHANGED, () => count++);

    provideContext(provider, ctx.key, 1);
    provideContext(provider, ctx.key, 2);

    // Clean up the document listener immediately to avoid leaking.
    document.removeEventListener(FSDS_CONTEXT_CHANGED, () => count++);
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("consume() returns the value set by provideContext", () => {
    const ctx = createCompoundContext<string>("StringCtx");
    const consumer = document.createElement("div");
    provider.append(consumer);

    provideContext(provider, ctx.key, "hello");

    expect(ctx.consume(consumer)).toBe("hello");
  });
});

describe("ContextConsumerController — reactivity", () => {
  let container: HTMLElement;
  let provider: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    provider = document.createElement("div");
    container.append(provider);
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("calls host.requestUpdate() when the matching-key event fires", () => {
    const ctx = createCompoundContext<string>("MatchCtx");
    const host = makeHost();
    provider.append(host);

    // Install the controller (subscribes in hostConnected).
    new ContextConsumerController(host, ctx);
    connectHost(host);

    // Provide context — this should trigger the event and cause requestUpdate.
    provideContext(provider, ctx.key, "value1");

    expect(getRequestUpdate(host)).toHaveBeenCalled();
  });

  it("does NOT call requestUpdate() for a different context key", () => {
    const ctxA = createCompoundContext<string>("CtxA");
    const ctxB = createCompoundContext<string>("CtxB");
    const host = makeHost();
    provider.append(host);

    // Consumer is for ctxA only.
    new ContextConsumerController(host, ctxA);
    connectHost(host);

    // Provide ctxB — should NOT notify ctxA consumer.
    provideContext(provider, ctxB.key, "unrelated");

    expect(getRequestUpdate(host)).not.toHaveBeenCalled();
  });

  it("stops calling requestUpdate() after hostDisconnected()", () => {
    const ctx = createCompoundContext<string>("DisconnectCtx");
    const host = makeHost();
    provider.append(host);

    new ContextConsumerController(host, ctx);
    connectHost(host);
    disconnectHost(host);

    provideContext(provider, ctx.key, "after-disconnect");

    expect(getRequestUpdate(host)).not.toHaveBeenCalled();
  });

  it("controller.value returns the current context value from ancestor tree", () => {
    const ctx = createCompoundContext<{ x: number }>("ValueCtx");
    const host = makeHost();
    provider.append(host);
    document.body.append(container);

    const controller = new ContextConsumerController(host, ctx);
    connectHost(host);

    provideContext(provider, ctx.key, { x: 42 });

    expect(controller.value).toEqual({ x: 42 });
  });
});
