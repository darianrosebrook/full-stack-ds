<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedTextAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
export type AnimatedTextVariant = "blur-in" | "fade-up" | "slide-in";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  text: string;
  as?: AnimatedTextAs;
  variant?: AnimatedTextVariant;
  duration?: number;
  stagger?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "animated-text",
  props.as ? `animated-text--${props.as}` : null,
  props.variant ? `animated-text--${props.variant}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-text="props.text" :data-testid="props['data-testid']"></div>
</template>
