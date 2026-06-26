<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SkeletonVariant = "block" | "text" | "avatar" | "media" | "dataviz" | "actions";
export type SkeletonAnimate = "shimmer" | "wipe" | "pulse" | "none";
export type SkeletonDensity = "compact" | "regular" | "spacious";
export type SkeletonLines = number | { min: number; max: number };
export type SkeletonRadius = "sm" | "md" | "lg";
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
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  variant: "block",
  animate: "shimmer",
  density: "regular",
  decorative: true,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "skeleton",
  props.variant ? `skeleton--${props.variant}` : null,
  props.animate ? `skeleton--${props.animate}` : null,
  props.density ? `skeleton--${props.density}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :role="(props.decorative ? 'presentation' : 'status')" :aria-busy="(props.decorative ? 'false' : 'true')" :aria-hidden="(props.decorative ? 'true' : 'false')" :aria-label="props.ariaLabel" :data-testid="props['data-testid']"></div>
</template>
