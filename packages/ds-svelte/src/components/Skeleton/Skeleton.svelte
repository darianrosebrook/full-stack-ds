<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type SkeletonVariant = "block" | "text" | "avatar" | "media" | "dataviz" | "actions";
type SkeletonAnimate = "shimmer" | "wipe" | "pulse" | "none";
type SkeletonDensity = "compact" | "regular" | "spacious";
type SkeletonLines = number | { min: number; max: number };
type SkeletonRadius = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  variant?: SkeletonVariant;
  animate?: SkeletonAnimate;
  density?: SkeletonDensity;
  aspectRatio?: string;
  lines?: SkeletonLines;
  radius?: SkeletonRadius;
  decorative?: boolean;
  ariaLabel?: string;
  class?: string;
}

let { variant = "block", animate = "shimmer", density = "regular", aspectRatio, lines, radius, decorative = true, ariaLabel, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "skeleton",
    variant ? `skeleton--${variant}` : null,
    animate ? `skeleton--${animate}` : null,
    density ? `skeleton--${density}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} aria-busy="true" aria-label={ariaLabel} role="status"></div>
