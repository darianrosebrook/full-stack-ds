import { type Signal, type DestroyRef } from '@angular/core';
import { createControllableState } from './createControllableState.js';

export interface AnchorToggleOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  destroyRef: DestroyRef;
}

export interface AnchorToggleResult {
  open: Signal<boolean>;
  setOpen(value: boolean): void;
  anchorRef: { nativeElement: HTMLElement | null };
  panelRef: { nativeElement: HTMLElement | null };
  toggle(): void;
  openPanel(): void;
  closePanel(): void;
}

/**
 * Angular equivalent of Vue's useAnchorToggle. Composes createControllableState
 * with document-level Escape and outside-click listeners. Listeners are
 * registered immediately (no reactive scheduler) and removed via DestroyRef.
 */
export function createAnchorToggle(opts: AnchorToggleOptions): AnchorToggleResult {
  const { value: open, set: setOpen } = createControllableState<boolean>({
    controlled: opts.open,
    defaultValue: opts.defaultOpen ?? false,
    onChange: opts.onOpenChange,
  });

  const anchorRef: { nativeElement: HTMLElement | null } = { nativeElement: null };
  const panelRef: { nativeElement: HTMLElement | null } = { nativeElement: null };

  const toggle = () => setOpen(!open());
  const openPanel = () => setOpen(true);
  const closePanel = () => setOpen(false);

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && open()) {
      setOpen(false);
      anchorRef.nativeElement?.focus();
    }
  }

  function onPointerDown(e: PointerEvent): void {
    const target = e.target as Node;
    if (
      open() &&
      panelRef.nativeElement &&
      !panelRef.nativeElement.contains(target) &&
      anchorRef.nativeElement &&
      !anchorRef.nativeElement.contains(target)
    ) {
      setOpen(false);
    }
  }

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onPointerDown);

  opts.destroyRef.onDestroy(() => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('pointerdown', onPointerDown);
  });

  return { open, setOpen, anchorRef, panelRef, toggle, openPanel, closePanel };
}
