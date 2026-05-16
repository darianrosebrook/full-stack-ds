<script lang="ts">
// @generated:start imports
import { useTooltip } from "./useTooltip.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
type TooltipTrigger = "hover" | "focus" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  content: unknown;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger;
  delay?: number;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}

let { content, open, defaultOpen, onOpenChange, placement, trigger = "hover", delay, disabled, closeOnEscape = true, closeOnBlur = true, class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useTooltip({
  open: () => open,
  defaultOpen: () => defaultOpen,
  onOpenChange: () => onOpenChange,
  closeOnEscape: () => closeOnEscape,
  closeOnBlur: () => closeOnBlur,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "tooltip",
    placement ? `tooltip--${placement}` : null,
    disabled ? "tooltip--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

{#if behavior.open}
<div class={classes} role="tooltip">
  {@render children?.()}
</div>
{/if}
