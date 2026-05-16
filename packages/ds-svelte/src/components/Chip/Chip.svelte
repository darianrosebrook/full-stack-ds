<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type ChipType = "button" | "submit" | "reset";
type ChipVariant = "default" | "selected" | "dismissible";
type ChipSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  type?: ChipType;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  icon?: unknown;
  title?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}

let { type, variant, size, disabled, icon, title, ariaLabel, ariaExpanded, ariaPressed, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "chip",
    variant ? `chip--${variant}` : null,
    size ? `chip--${size}` : null,
    disabled ? "chip--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<button class={classes} type={type} disabled={disabled} aria-label={ariaLabel} aria-expanded={ariaExpanded} aria-pressed={ariaPressed}>
  {#if icon}
  <span class={'chip__icon'} aria-hidden="true"></span>
  {/if}
  <span class={'chip__text'}>
    {@render children?.()}
  </span>
</button>
