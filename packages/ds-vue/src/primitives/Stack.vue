<script setup lang="ts">
import { computed } from "vue";

export interface StackProps {
  as?: string;
  variant?: "vertical" | "horizontal";
  className?: string;
}

const props = withDefaults(defineProps<StackProps>(), {
  as: "div",
  variant: "vertical",
});

const classNames = computed(() =>
  ["stack", `stack--${props.variant}`, props.className]
    .filter(Boolean)
    .join(" "),
);
</script>

<template>
  <component :is="props.as" :class="classNames">
    <slot />
  </component>
</template>

<style scoped>
.stack {
  display: flex;
}
.stack--vertical {
  flex-direction: column;
}
.stack--horizontal {
  flex-direction: row;
}
</style>
