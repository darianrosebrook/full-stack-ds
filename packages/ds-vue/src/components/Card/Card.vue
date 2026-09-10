<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CardDensity = "default" | "inset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  interactive?: boolean;
  density?: CardDensity;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  interactive: undefined,
  density: "default",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "card",
  props.density ? `card--${props.density}` : null,
  props.interactive ? "card--interactive" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <Stack role="group" :data-testid="props['data-testid']" data-fsds-component="card" data-fsds-box="" :class="classNames">
    <slot />
  </Stack>
</template>
