import { onBeforeUnmount, watchEffect } from "vue";

export interface UseAutoDismissOptions {
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

export interface UseAutoDismissResult {
  pause: () => void;
  resume: () => void;
  /** Bind to the surface element to wire interaction pausing. */
  pauseListeners: {
    onPointerenter: () => void;
    onPointerleave: () => void;
    onFocusin: () => void;
    onFocusout: () => void;
  };
}

/**
 * Vue equivalent of React's useAutoDismiss. Tracks the remaining budget
 * across pause/resume so a hover near the end of the budget does not
 * grant a fresh full budget on leave.
 */
export function useAutoDismiss(options: UseAutoDismissOptions): UseAutoDismissResult {
  const pauseOnInteraction = options.pauseOnInteraction ?? true;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let deadline = 0;
  let remaining = 0;
  let paused = false;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const start = (ms: number) => {
    clear();
    deadline = Date.now() + ms;
    timer = setTimeout(() => {
      timer = null;
      options.onDismiss();
    }, ms);
  };

  const pause = () => {
    if (timer === null) return;
    remaining = Math.max(deadline - Date.now(), 0);
    paused = true;
    clear();
  };

  const resume = () => {
    if (!paused) return;
    paused = false;
    start(remaining);
  };

  watchEffect(() => {
    const duration = options.durationMs();
    paused = false;
    if (!options.open() || typeof duration !== "number" || duration <= 0) {
      clear();
      return;
    }
    start(duration);
  });

  onBeforeUnmount(clear);

  return {
    pause,
    resume,
    pauseListeners: {
      onPointerenter: () => {
        if (pauseOnInteraction) pause();
      },
      onPointerleave: () => {
        if (pauseOnInteraction) resume();
      },
      onFocusin: () => {
        if (pauseOnInteraction) pause();
      },
      onFocusout: () => {
        if (pauseOnInteraction) resume();
      },
    },
  };
}
