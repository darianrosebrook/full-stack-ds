import {
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnchoredSurfaceController,
  type AnchoredSurfaceControllerOptions,
} from "./AnchoredSurfaceController";
import type {
  SurfaceAnchorRelation,
  SurfaceDismissalMode,
  SurfaceOpenTrigger,
} from "./SurfaceController";

export interface UseAnchoredSurfaceOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openTriggers: readonly SurfaceOpenTrigger[];
  dismissal: readonly SurfaceDismissalMode[];
  anchorRelation: SurfaceAnchorRelation;
  disabled?: boolean;
  /** Optional id base for the content element. Default: useId(). */
  idBase?: string;
}

export interface SurfaceTriggerHandlers {
  onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
  onFocus?: (event: ReactFocusEvent<HTMLElement>) => void;
  onBlur?: (event: ReactFocusEvent<HTMLElement>) => void;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
}

export interface UseAnchoredSurfaceResult {
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Stable id for the content element (used for aria-describedby etc.). */
  contentId: string;
  /** How the anchor relates to the content for ARIA wiring. */
  anchorRelation: SurfaceAnchorRelation;
  /** Whether the surface accepts open interactions right now. */
  disabled: boolean;
  /**
   * Default-host path: ref callback that registers the anchor AND
   * causes the controller to install DOM listeners on it. Use when
   * Tooltip owns the trigger element (no asChild).
   */
  registerAnchor: (node: HTMLElement | null) => void;
  /**
   * asChild path: ref callback that registers the anchor for ARIA
   * queries and grace-path checks but does NOT install DOM listeners
   * on it. Pair with `getTriggerHandlers()` for React-handler wiring.
   */
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  /** Ref callback the Content sub-component installs on its host node. */
  registerContent: (node: HTMLElement | null) => void;
  /**
   * Returns React-shaped handlers gated by the surface's openTriggers
   * and dismissal. Use in asChild adoption: compose these onto the
   * adopted child so consumer handlers and surface handlers cooperate
   * via the standard `event.defaultPrevented` rule.
   */
  getTriggerHandlers: () => SurfaceTriggerHandlers;
  /**
   * Current anchor element, exposed as React state so positioning hooks
   * (e.g. useAnchoredPosition) can react to it changing. Updates when
   * registerAnchor / registerAnchorRefOnly is called.
   */
  anchorEl: HTMLElement | null;
  /**
   * Current content element, exposed as React state so positioning hooks
   * can subscribe. Updates when registerContent is called.
   */
  contentEl: HTMLElement | null;
}

/**
 * React adapter around AnchoredSurfaceController. Owns controlled /
 * uncontrolled open state and bridges component lifecycle to the
 * controller's listener wiring.
 *
 * Two adoption modes:
 *   - **Default-host**: caller uses `registerAnchor`. Substrate auto-
 *     wires DOM listeners on the anchor element.
 *   - **asChild**: caller uses `registerAnchorRefOnly` + spreads
 *     `getTriggerHandlers()` onto the cloned child. Substrate skips
 *     anchor-side listener installation; consumer's React handlers and
 *     surface React handlers compose via `composeEventHandlers`.
 *
 * Only one mode should be used per component instance. Mixing them
 * results in duplicate handler invocation.
 */
export function useAnchoredSurface(
  options: UseAnchoredSurfaceOptions,
): UseAnchoredSurfaceResult {
  const {
    open: controlled,
    defaultOpen = false,
    onOpenChange,
    openTriggers,
    dismissal,
    anchorRelation,
    disabled = false,
    idBase,
  } = options;

  const generatedId = useId();
  const contentId = idBase ?? `surface-${generatedId}`;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlled !== undefined;
  const open = isControlled ? controlled : uncontrolledOpen;

  const openRef = useRef(open);
  openRef.current = open;

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Mode latches at first ref installation. Once a component instance
  // chose default-host or asChild we keep using that mode for the
  // remainder of its lifetime — switching mid-flight would require
  // re-mounting the controller with different listener policy.
  const handlerModeRef = useRef<boolean | null>(null);

  const controllerRef = useRef<AnchoredSurfaceController | null>(null);
  if (controllerRef.current === null) {
    const controllerOptions: AnchoredSurfaceControllerOptions = {
      isOpen: () => openRef.current,
      setOpen,
      openTriggers,
      dismissal,
      disabled: () => disabledRef.current,
      handlerMode: false, // assumed; updated on first ref-callback call
    };
    controllerRef.current = new AnchoredSurfaceController(controllerOptions);
  }

  const anchorNodeRef = useRef<HTMLElement | null>(null);
  const contentNodeRef = useRef<HTMLElement | null>(null);

  // Mirrored as state so positioning hooks (useAnchoredPosition) can
  // react to node identity changes. The refs above stay authoritative
  // for the controller's listener wiring; state is purely a subscription
  // surface for downstream React consumers.
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

  const remount = useCallback(() => {
    controllerRef.current?.setAnchor(anchorNodeRef.current);
    controllerRef.current?.setContent(contentNodeRef.current);
    controllerRef.current?.mount();
  }, []);

  const ensureHandlerMode = useCallback(
    (next: boolean) => {
      if (handlerModeRef.current === next) return;
      handlerModeRef.current = next;
      // Rebuild controller with the locked-in mode.
      controllerRef.current?.unmount();
      controllerRef.current = new AnchoredSurfaceController({
        isOpen: () => openRef.current,
        setOpen,
        openTriggers,
        dismissal,
        disabled: () => disabledRef.current,
        handlerMode: next,
      });
    },
    [setOpen, openTriggers, dismissal],
  );

  // Ref-callback identity protection. React invokes ref callbacks on
  // every commit even when the underlying DOM node hasn't changed; if
  // we unmount+reinstall listeners on every call, a click that arrives
  // during a commit (e.g. clicking a child input that toggles state
  // and re-renders) can race with the document-level mousedown
  // listener being torn down and replaced, causing outside-click
  // dismissal to mis-fire. Bail out when the node identity matches.
  const registerAnchor = useCallback(
    (node: HTMLElement | null) => {
      if (anchorNodeRef.current === node) return;
      ensureHandlerMode(false);
      anchorNodeRef.current = node;
      setAnchorEl(node);
      remount();
    },
    [ensureHandlerMode, remount],
  );
  const registerAnchorRefOnly = useCallback(
    (node: HTMLElement | null) => {
      if (anchorNodeRef.current === node) return;
      ensureHandlerMode(true);
      anchorNodeRef.current = node;
      setAnchorEl(node);
      remount();
    },
    [ensureHandlerMode, remount],
  );
  const registerContent = useCallback(
    (node: HTMLElement | null) => {
      if (contentNodeRef.current === node) return;
      contentNodeRef.current = node;
      setContentEl(node);
      remount();
    },
    [remount],
  );

  const openTriggersKey = openTriggers.join(",");
  const dismissalKey = dismissal.join(",");
  useEffect(() => {
    remount();
    return () => controllerRef.current?.unmount();
  }, [openTriggersKey, dismissalKey, remount]);

  const getTriggerHandlers = useCallback((): SurfaceTriggerHandlers => {
    const handlers: SurfaceTriggerHandlers = {};
    const isDisabled = () => disabledRef.current === true;
    const openSurface = () => {
      if (isDisabled()) return;
      setOpen(true);
    };
    const closeSurface = () => setOpen(false);

    if (openTriggers.includes("hover")) {
      handlers.onPointerEnter = () => openSurface();
    }
    if (openTriggers.includes("focus")) {
      handlers.onFocus = () => openSurface();
    }
    if (openTriggers.includes("click")) {
      handlers.onClick = () => {
        if (isDisabled()) return;
        setOpen(!openRef.current);
      };
    }
    if (dismissal.includes("pointer-leave")) {
      handlers.onPointerLeave = (event) => {
        const next = event.relatedTarget as Node | null;
        if (next && contentNodeRef.current && contentNodeRef.current.contains(next)) {
          return;
        }
        closeSurface();
      };
    }
    if (dismissal.includes("blur")) {
      // Boundary semantics: when focus leaves the asChild trigger,
      // only dismiss if relatedTarget is outside the anchor ∪ content
      // surface. Tooltip content is non-focusable, so this collapses
      // to "outside content" in practice — but Popover content has
      // focusable descendants and this check is what keeps the
      // surface open when focus moves trigger → content. See
      // AnchoredSurfaceController.isInsideSurface for the parallel
      // substrate-side implementation.
      handlers.onBlur = (event) => {
        const next = event.relatedTarget as Node | null;
        const anchor = anchorNodeRef.current;
        const content = contentNodeRef.current;
        if (next instanceof Node) {
          if (anchor && anchor.contains(next)) return;
          if (content && content.contains(next)) return;
        }
        closeSurface();
      };
    }
    return handlers;
  }, [openTriggers, dismissal, setOpen]);

  const result = useMemo<UseAnchoredSurfaceResult>(
    () => ({
      open,
      setOpen,
      contentId,
      anchorRelation,
      disabled,
      registerAnchor,
      registerAnchorRefOnly,
      registerContent,
      getTriggerHandlers,
      anchorEl,
      contentEl,
    }),
    [
      open,
      setOpen,
      contentId,
      anchorRelation,
      disabled,
      registerAnchor,
      registerAnchorRefOnly,
      registerContent,
      getTriggerHandlers,
      anchorEl,
      contentEl,
    ],
  );

  return result;
}
