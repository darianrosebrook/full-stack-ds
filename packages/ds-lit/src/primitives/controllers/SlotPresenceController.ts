import type { ReactiveControllerHost } from 'lit';

/**
 * ReactiveController tracking which named slots the host's light DOM fills.
 * Backs `if: "slot:<name>"` render guards.
 *
 * A guarded wrapper holds its own <slot>, so while the wrapper is not
 * rendered there is no slot element to fire `slotchange`. Presence is
 * therefore read from the host's light-DOM children and kept current with a
 * MutationObserver (children added/removed, `slot` attributes changed).
 */
export class SlotPresenceController {
  private host: ReactiveControllerHost & HTMLElement;
  private observer?: MutationObserver;
  private filled: ReadonlySet<string> = new Set();

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  /** True when a direct light-DOM child is assigned to `name`. */
  has(name: string): boolean {
    return this.filled.has(name);
  }

  private update = () => {
    const next = new Set<string>();
    for (const child of Array.from(this.host.children)) {
      const slot = child.getAttribute('slot');
      if (slot) next.add(slot);
    }
    const changed =
      next.size !== this.filled.size || [...next].some((name) => !this.filled.has(name));
    this.filled = next;
    if (changed) this.host.requestUpdate();
  };

  hostConnected() {
    this.update();
    this.observer = new MutationObserver(this.update);
    this.observer.observe(this.host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
  }

  hostDisconnected() {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
