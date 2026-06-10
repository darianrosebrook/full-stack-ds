import { useCallback, useEffect, useRef } from "react";

export interface UseAutoDismissOptions {
  /** Whether the surface is open. The timer only runs while open. */
  open: boolean;
  /**
   * Presence budget in milliseconds (design default flows from the
   * component's `*.timing.auto-dismiss` token). `undefined`, `null`, or
   * `0` disables the timer.
   */
  durationMs?: number | null;
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
  /** Spread onto the surface element to wire interaction pausing. */
  getPauseProps: () => {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocusCapture: () => void;
    onBlurCapture: () => void;
  };
}

/**
 * Auto-dismiss timer for ephemeral presence surfaces (Toast). Tracks the
 * remaining budget across pause/resume so a hover near the end of the
 * budget does not grant a fresh full budget on leave.
 */
export function useAutoDismiss(options: UseAutoDismissOptions): UseAutoDismissResult {
  const { open, durationMs, onDismiss, pauseOnInteraction = true } = options;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef(0);
  const remainingRef = useRef(0);
  const pausedRef = useRef(false);
  const enabled = open && typeof durationMs === "number" && durationMs > 0;

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (ms: number) => {
      clear();
      deadlineRef.current = Date.now() + ms;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onDismissRef.current();
      }, ms);
    },
    [clear],
  );

  const pause = useCallback(() => {
    if (timerRef.current === null) return;
    remainingRef.current = Math.max(deadlineRef.current - Date.now(), 0);
    pausedRef.current = true;
    clear();
  }, [clear]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    start(remainingRef.current);
  }, [start]);

  useEffect(() => {
    pausedRef.current = false;
    if (!enabled) {
      clear();
      return;
    }
    start(durationMs as number);
    return clear;
  }, [enabled, durationMs, start, clear]);

  const getPauseProps = useCallback(
    () => ({
      onPointerEnter: () => {
        if (pauseOnInteraction) pause();
      },
      onPointerLeave: () => {
        if (pauseOnInteraction) resume();
      },
      onFocusCapture: () => {
        if (pauseOnInteraction) pause();
      },
      onBlurCapture: () => {
        if (pauseOnInteraction) resume();
      },
    }),
    [pauseOnInteraction, pause, resume],
  );

  return { pause, resume, getPauseProps };
}
