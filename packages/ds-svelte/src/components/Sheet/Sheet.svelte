<script lang="ts">
// @generated:start imports
import { useSheet } from "./useSheet.svelte.js";
import { portal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type SheetSide = "top" | "right" | "bottom" | "left";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
  modal?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  class?: string;
  children?: import('svelte').Snippet;
  description?: import('svelte').Snippet;
  footer?: import('svelte').Snippet;
  title?: import('svelte').Snippet;
}

let { open, defaultOpen, onOpenChange, side = "right", modal = true, ariaLabel, ariaLabelledby, ariaDescribedby, class: className, children, description, footer, title }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useSheet({
  open: () => open,
  defaultOpen: () => defaultOpen,
  onOpenChange: () => onOpenChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "sheet",
    side ? `sheet--${side}` : null,
    behavior.openness ? "sheet--open" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @generated:start fieldAssociation
const instanceId = $props.id();
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} data-fsds-component="sheet" use:portal={{ enabled: true }}>
  {#if behavior.openness}
  <div class={'sheet__overlay'} aria-hidden="true" onclick={(e) => { if (e.target === e.currentTarget) { behavior.setOpenness(false); } }}></div>
  {/if}
  {#if behavior.openness}
  <div class={'sheet__content'} role="dialog" aria-modal="true" aria-label={ariaLabel} data-side={side} aria-labelledby={[title && !ariaLabel ? `${instanceId}-title` : null, ariaLabelledby].filter(Boolean).join(' ') || undefined} aria-describedby={[description ? `${instanceId}-description` : null, ariaDescribedby].filter(Boolean).join(' ') || undefined}>
    <div class={'sheet__header'}>
      <h2 class={'sheet__title'} id={`${instanceId}-title`}>
        {@render title?.()}
      </h2>
      <p class={'sheet__description'} id={`${instanceId}-description`}>
        {@render description?.()}
      </p>
      <button class={'sheet__close'} type="button" aria-label="Close sheet" onclick={() => behavior.setOpenness(!behavior.openness)}></button>
    </div>
    <div class={'sheet__body'}>
      {@render children?.()}
    </div>
    <div class={'sheet__footer'}>
      {@render footer?.()}
    </div>
  </div>
  {/if}
</div>
