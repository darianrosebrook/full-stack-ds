<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatSize = "sm" | "md" | "lg";
export type StatTrend = "up" | "down" | "neutral";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  size?: StatSize;
  trend?: StatTrend;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  size: "md",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "stat",
  props.size ? `stat--${props.size}` : null,
  props.trend ? `stat--${props.trend}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </div>
</template>
