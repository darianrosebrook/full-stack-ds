<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedSectionAs = "section" | "div" | "article" | "main" | "aside" | "header" | "footer";
export type AnimatedSectionVariant = "fade-up" | "fade-in" | "slide-in" | "stagger-children";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  as?: AnimatedSectionAs;
  variant?: AnimatedSectionVariant;
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
  "animated-section",
  props.as ? `animated-section--${props.as}` : null,
  props.variant ? `animated-section--${props.variant}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <section :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </section>
</template>
