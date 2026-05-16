<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ListElement = "ul" | "ol" | "dl";
export type ListVariant = "default" | "unstyled" | "inline" | "divided" | "spaced";
export type ListMarker = "default" | "none" | "disc" | "circle" | "square" | "decimal" | "alpha" | "roman";
export type ListSpacing = "none" | "sm" | "md" | "lg";
export type ListSize = "sm" | "md" | "lg";
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
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "list",
  props.as ? `list--${props.as}` : null,
  props.variant ? `list--${props.variant}` : null,
  props.marker ? `list--${props.marker}` : null,
  props.spacing ? `list--${props.spacing}` : null,
  props.size ? `list--${props.size}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <ul :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </ul>
</template>
