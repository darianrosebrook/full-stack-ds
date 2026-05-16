<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type SpinnerSize = "xs" | "sm" | "md" | "lg";
type SpinnerVariant = "ring" | "dots" | "bars";
type SpinnerThickness = "hairline" | "regular" | "bold";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  thickness?: SpinnerThickness;
  ariaHidden?: boolean;
  label?: string;
  inline?: boolean;
  showAfterMs?: number;
  class?: string;
}

let { size, variant, thickness, ariaHidden, label, inline, showAfterMs, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "spinner",
    size ? `spinner--${size}` : null,
    variant ? `spinner--${variant}` : null,
    thickness ? `spinner--${thickness}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} role="status">
  <span class={'spinner__visual'} aria-hidden="true"></span>
</div>
