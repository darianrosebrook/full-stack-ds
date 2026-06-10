import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface AutoDismissOptions {
  /** Getter for the open state. The timer only runs while open. */
  open: () => boolean;
  /**
   * Getter for the presence budget in milliseconds (design default flows
   * from the component's `*.timing.auto-dismiss` token). `undefined`,
   * `null`, or `0` disables the timer.
   */
  durationMs: () => number | null | undefined;
  /** Called when the budget elapses. */
  onDismiss: () => void;
  /**
   * Pause while the surface is hovered or contains focus (WCAG 2.2.1
   * Timing Adjustable). Default true.
   */
  pauseOnInteraction?: boolean;
}

/**
 * Lit equivalent of React's useAutoDismiss. Re-evaluates the timer on
 * every host update (hostUpdated reads open/duration), clears on
 * disconnect, and tracks the remaining budget across pause/resume.
 * Bind `pauseListeners` on the surface element to wire interaction
 * pausing.
 */
export class AutoDismissController implements ReactiveController {
  private opts: AutoDismissOptions;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private deadline = 0;
  private remaining = 0;
  private paused = false;
  private lastOpen = false;
  private lastDuration: number | null | undefined = undefined;

  constructor(host: ReactiveControllerHost, opts: AutoDismissOptions) {
    this.opts = opts;
    host.addController(this);
  }

  hostUpdated(): void {
    const open = this.opts.open();
    const duration = this.opts.durationMs();
    if (open === this.lastOpen && duration === this.lastDuration) return;
    this.lastOpen = open;
    this.lastDuration = duration;
    this.sync();
  }

  hostDisconnected(): void {
    this.clear();
  }

  sync(): void {
    const duration = this.opts.durationMs();
    this.paused = false;
    if (!this.opts.open() || typeof duration !== 'number' || duration <= 0) {
      this.clear();
      return;
    }
    this.start(duration);
  }

  pause = (): void => {
    if (this.timer === null) return;
    this.remaining = Math.max(this.deadline - Date.now(), 0);
    this.paused = true;
    this.clear();
  };

  resume = (): void => {
    if (!this.paused) return;
    this.paused = false;
    this.start(this.remaining);
  };

  get pauseListeners(): {
    pointerenter: () => void;
    pointerleave: () => void;
    focusin: () => void;
    focusout: () => void;
  } {
    const pauseOnInteraction = this.opts.pauseOnInteraction ?? true;
    return {
      pointerenter: () => {
        if (pauseOnInteraction) this.pause();
      },
      pointerleave: () => {
        if (pauseOnInteraction) this.resume();
      },
      focusin: () => {
        if (pauseOnInteraction) this.pause();
      },
      focusout: () => {
        if (pauseOnInteraction) this.resume();
      },
    };
  }

  private start(ms: number): void {
    this.clear();
    this.deadline = Date.now() + ms;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.opts.onDismiss();
    }, ms);
  }

  private clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
