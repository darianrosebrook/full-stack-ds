<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type ListElement = "ul" | "ol" | "dl";
type ListVariant = "default" | "unstyled" | "inline" | "divided" | "spaced";
type ListMarker = "default" | "none" | "disc" | "circle" | "square" | "decimal" | "alpha" | "roman";
type ListSpacing = "none" | "sm" | "md" | "lg";
type ListSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  as?: ListElement;
  variant?: ListVariant;
  marker?: ListMarker;
  spacing?: ListSpacing;
  size?: ListSize;
  class?: string;
  children?: import('svelte').Snippet;
}

let { as, variant, marker, spacing, size, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "list",
    as ? `list--${as}` : null,
    variant ? `list--variant-${variant}` : null,
    marker ? `list--marker-${marker}` : null,
    spacing ? `list--spacing-${spacing}` : null,
    size ? `list--size-${size}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<ul class={classes}>
  {@render children?.()}
</ul>
