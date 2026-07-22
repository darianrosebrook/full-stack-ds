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
  class?: string;
  children?: import('svelte').Snippet;
  description?: import('svelte').Snippet;
  title?: import('svelte').Snippet;
}

let { open, defaultOpen, onOpenChange, side = "right", modal = true, class: className, children, description, title }: Props = $props();
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

// @custom:start trailing

// @custom:end
</script>

<div class={classes} use:portal={{ enabled: true }} role="dialog" onclick={(e) => { if (e.target === e.currentTarget) { behavior.setOpenness(false); } }}>
  {#if behavior.openness}
  <div class={'sheet__overlay'} aria-hidden="true"></div>
  {/if}
  {#if behavior.openness}
  <div class={'sheet__content'} role="dialog" aria-modal="true" aria-labelledby="sheet-title-id" aria-describedby="sheet-description-id" data-side={side}>
    <div class={'sheet__header'}>
      <h2 class={'sheet__title'}>
        {@render title?.()}
      </h2>
      <p class={'sheet__description'}>
        {@render description?.()}
      </p>
      <button class={'sheet__close'} type="button" aria-label="Close sheet" onclick={() => behavior.setOpenness(!behavior.openness)}></button>
    </div>
    <div class={'sheet__body'}>
      {@render children?.()}
    </div>
    <div class={'sheet__footer'}></div>
  </div>
  {/if}
</div>
