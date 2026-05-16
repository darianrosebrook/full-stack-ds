<script lang="ts">
// @generated:start imports
import { useDetails } from "./useDetails.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type DetailsVariant = "default" | "inline" | "compact";
type DetailsIcon = "left" | "right" | "none";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  summary: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  variant?: DetailsVariant;
  icon?: DetailsIcon;
  class?: string;
  children?: import('svelte').Snippet;
}

let { summary, open, defaultOpen, onOpenChange, disabled, variant, icon, class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useDetails({
  open: () => open,
  defaultOpen: () => defaultOpen,
  onOpenChange: () => onOpenChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "details",
    variant ? `details--${variant}` : null,
    icon ? `details--${icon}` : null,
    behavior.open ? "details--open" : null,
    disabled ? "details--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<details class={classes} open={behavior.open} role="group">
  <summary class={'details__summary'}>
    <span class={'details__summaryContent'}>
      <span class={'details__icon'}></span>
      <span class={'details__summaryText'} textContent={summary}></span>
    </span>
  </summary>
  {#if behavior.open}
  <div class={'details__content'}>
    {@render children?.()}
  </div>
  {/if}
</details>
