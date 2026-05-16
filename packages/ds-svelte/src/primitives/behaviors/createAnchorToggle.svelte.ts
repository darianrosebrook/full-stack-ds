import { onMount } from 'svelte';
import { createControllableState } from './createControllableState.svelte.js';

export interface AnchorToggleOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
}

export interface AnchorToggleResult {
  readonly open: boolean;
  setOpen(value: boolean): void;
  anchorRef: { el: HTMLElement | null };
  panelRef: { el: HTMLElement | null };
}

export function createAnchorToggle(opts: AnchorToggleOptions = {}): AnchorToggleResult {
  const state = createControllableState<boolean>({
    controlled: opts.open,
    defaultValue: opts.defaultOpen ?? false,
    onChange: opts.onOpenChange,
  });

  const anchorRef: { el: HTMLElement | null } = { el: null };
  const panelRef: { el: HTMLElement | null } = { el: null };

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && state.value) {
      state.set(false);
      anchorRef.el?.focus();
    }
  }

  function onPointerDown(e: PointerEvent) {
    const target = e.target as Node;
    if (
      state.value &&
      panelRef.el &&
      !panelRef.el.contains(target) &&
      anchorRef.el &&
      !anchorRef.el.contains(target)
    ) {
      state.set(false);
    }
  }

  onMount(() => {
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  });

  return {
    get open() {
      return state.value;
    },
    setOpen(v: boolean) {
      state.set(v);
    },
    anchorRef,
    panelRef,
  };
}
