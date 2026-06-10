<script lang="ts">
// @generated:start imports
import { useToast } from "./useToast.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type ToastVariant = "info" | "success" | "warning" | "error";
type ToastPoliteness = "polite" | "assertive";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  variant?: ToastVariant;
  politeness?: ToastPoliteness;
  action?: unknown;
  class?: string;
  children?: import('svelte').Snippet;
}

let { open, onOpenChange, title, variant = "info", politeness = "polite", action, class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useToast({
  open: () => open,
  onOpenChange: () => onOpenChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "toast",
    variant ? `toast--${variant}` : null,
    politeness ? `toast--${politeness}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} aria-live="polite" aria-label="Notifications" role="alert">
  {#if behavior.open}
  <div class={'toast__item'} role="status">
    <div class={'toast__row'}>
      {#if title}
      <div class={'toast__title'}></div>
      {/if}
      <div class={'toast__description'}>
        {@render children?.()}
      </div>
      {#if action}
      <div class={'toast__action'}></div>
      {/if}
      <button class={'toast__close'} type="button" aria-label="Dismiss" onclick={() => behavior.setOpen(!behavior.open)}></button>
    </div>
  </div>
  {/if}
</div>
