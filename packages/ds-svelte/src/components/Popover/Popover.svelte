<script lang="ts">
// @generated:start imports
import { usePopover } from "./usePopover.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
type PopoverTriggerStrategy = "click" | "hover";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  triggerStrategy?: PopoverTriggerStrategy;
  offset?: number;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  anchor?: HTMLElement | null;
  class?: string;
  children?: import('svelte').Snippet;
}

let { open, defaultOpen, onOpenChange, placement = "auto", triggerStrategy = "click", offset = 8, closeOnOutsideClick, closeOnEscape, anchor, class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = usePopover({
  open: () => open,
  defaultOpen: () => defaultOpen,
  onOpenChange: () => onOpenChange,
  closeOnEscape: () => closeOnEscape,
  closeOnOutsideClick: () => closeOnOutsideClick,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "popover",
    placement ? `popover--${placement}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  <button class={'popover__trigger'} type="button" aria-haspopup="true" aria-expanded={behavior.open} aria-controls="popover-content">
    {@render children?.()}
  </button>
  {#if behavior.open}
  <div class={'popover__content'} id="popover-content">
    {@render children?.()}
  </div>
  {/if}
</div>
