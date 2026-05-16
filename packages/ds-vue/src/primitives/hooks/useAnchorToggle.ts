import { onBeforeUnmount, ref, watchEffect, type Ref } from "vue";
import { useControllableState } from "./useControllableState";

export interface UseAnchorToggleOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

export interface UseAnchorToggleResult {
  open: Ref<boolean>;
  setOpen: (next: boolean) => void;
  panelRef: Ref<HTMLElement | null>;
  anchorRef: Ref<HTMLElement | null>;
  toggle: () => void;
  openPanel: () => void;
  closePanel: () => void;
}

/**
 * Vue 3 equivalent of React's useAnchorToggle. Composes useControllableState
 * with document-level Escape and outside-click listeners that auto-attach
 * while the panel is open and detach when it closes or unmounts.
 */
export function useAnchorToggle(
  options: UseAnchorToggleOptions = {},
): UseAnchorToggleResult {
  const {
    open: controlled,
    defaultOpen = false,
    onOpenChange,
    closeOnEscape = true,
    closeOnOutsideClick = true,
  } = options;

  const state = useControllableState<boolean>({
    controlled,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const panelRef = ref<HTMLElement | null>(null);
  const anchorRef = ref<HTMLElement | null>(null);

  const setOpen = (next: boolean) => state.set(next);
  const openPanel = () => state.set(true);
  const closePanel = () => state.set(false);
  const toggle = () => state.set((p) => !p);

  function onKey(e: KeyboardEvent): void {
    if (e.key === "Escape" && closeOnEscape) state.set(false);
  }

  function onPointer(e: MouseEvent | PointerEvent): void {
    const target = e.target as Node | null;
    if (!target || !closeOnOutsideClick) return;
    if (panelRef.value && panelRef.value.contains(target)) return;
    if (anchorRef.value && anchorRef.value.contains(target)) return;
    state.set(false);
  }

  watchEffect((onCleanup) => {
    if (!state.value.value) return;
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    onCleanup(() => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    });
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("mousedown", onPointer);
  });

  return {
    open: state.value as unknown as Ref<boolean>,
    setOpen,
    panelRef,
    anchorRef,
    toggle,
    openPanel,
    closePanel,
  };
}
