<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedCardAs = "article" | "div" | "li" | "a";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  as?: AnimatedCardAs;
  duration?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  enableHover?: boolean;
  href?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "animated-card",
  props.as ? `animated-card--${props.as}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-as="props.as" :data-testid="props['data-testid']">
    <slot />
  </div>
</template>
