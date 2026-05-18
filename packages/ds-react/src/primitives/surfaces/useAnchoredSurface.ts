import { useCallback, useEffect, useId, useRef, useState } from "react";
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

export interface UseAnchoredSurfaceResult {
  open: boolean;
  setOpen: (next: boolean) => void;
  /** Stable id for the content element (used for aria-describedby etc.). */
  contentId: string;
  /** How the anchor relates to the content for ARIA wiring. */
  anchorRelation: SurfaceAnchorRelation;
  /** Whether the surface accepts open interactions right now. */
  disabled: boolean;
  /** Ref callback the Trigger sub-component installs on its host node. */
  registerAnchor: (node: HTMLElement | null) => void;
  /** Ref callback the Content sub-component installs on its host node. */
  registerContent: (node: HTMLElement | null) => void;
}

/**
 * React adapter around AnchoredSurfaceController. Owns controlled /
 * uncontrolled open state and bridges component lifecycle to the
 * controller's listener wiring.
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

  // Ref into the latest open value so the controller's getter sees
  // current state on every event without re-installing listeners.
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

  // Stable controller instance for the lifetime of the component.
  const controllerRef = useRef<AnchoredSurfaceController | null>(null);
  if (controllerRef.current === null) {
    const controllerOptions: AnchoredSurfaceControllerOptions = {
      isOpen: () => openRef.current,
      setOpen,
      openTriggers,
      dismissal,
      disabled: () => disabledRef.current,
    };
    controllerRef.current = new AnchoredSurfaceController(controllerOptions);
  }

  const anchorNodeRef = useRef<HTMLElement | null>(null);
  const contentNodeRef = useRef<HTMLElement | null>(null);

  const remount = useCallback(() => {
    controllerRef.current?.setAnchor(anchorNodeRef.current);
    controllerRef.current?.setContent(contentNodeRef.current);
    controllerRef.current?.mount();
  }, []);

  const registerAnchor = useCallback(
    (node: HTMLElement | null) => {
      anchorNodeRef.current = node;
      remount();
    },
    [remount],
  );
  const registerContent = useCallback(
    (node: HTMLElement | null) => {
      contentNodeRef.current = node;
      remount();
    },
    [remount],
  );

  // Re-install listeners when trigger / dismissal configuration changes.
  // We compare by string-join so an array literal in props doesn't cause
  // a remount every render — only an actual change in declared modes.
  const openTriggersKey = openTriggers.join(",");
  const dismissalKey = dismissal.join(",");
  useEffect(() => {
    remount();
    return () => controllerRef.current?.unmount();
  }, [openTriggersKey, dismissalKey, remount]);

  return {
    open,
    setOpen,
    contentId,
    anchorRelation,
    disabled,
    registerAnchor,
    registerContent,
  };
}
