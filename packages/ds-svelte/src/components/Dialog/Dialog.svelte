<script lang="ts">
// @generated:start imports
import { useDialog } from "./useDialog.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  size?: DialogSize;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  initialFocus?: string;
  returnFocus?: string;
  class?: string;
  children?: import('svelte').Snippet;
  title?: import('svelte').Snippet;
}

let { open, defaultOpen, onOpenChange, modal = true, size = "md", dismissible = true, closeOnEscape = true, closeOnBackdropClick = true, initialFocus, returnFocus, class: className, children, title }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useDialog({
  open: () => open,
  defaultOpen: () => defaultOpen,
  onOpenChange: () => onOpenChange,
  closeOnEscape: () => closeOnEscape,
  closeOnBackdropClick: () => closeOnBackdropClick,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "dialog",
    size ? `dialog--${size}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} role="dialog" onclick={(e) => { if (e.target === e.currentTarget) { closeOnBackdropClick !== false && behavior.setOpenness(false); } }}>
  {#if behavior.openness}
  <div class={'dialog__backdrop'} aria-hidden="true"></div>
  {/if}
  {#if behavior.openness}
  <div class={'dialog__modal'} role="dialog" aria-modal="true" aria-labelledby="dialog-title-id" aria-describedby="dialog-body-id">
    <div class={'dialog__header'}>
      <h2 class={'dialog__title'}>
        {@render title?.()}
      </h2>
      <button class={'dialog__closeButton'} type="button" aria-label="Close dialog" onclick={() => behavior.setOpenness(!behavior.openness)}></button>
    </div>
    <div class={'dialog__body'}>
      {@render children?.()}
    </div>
    <div class={'dialog__footer'}></div>
  </div>
  {/if}
</div>
