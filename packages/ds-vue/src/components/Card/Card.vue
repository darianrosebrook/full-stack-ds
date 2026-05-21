<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CardStatus = "completed" | "in-progress" | "planned" | "deprecated" | "category" | "complexity";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  interactive?: boolean;
  status?: CardStatus;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "card",
  props.status ? `card--${props.status}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <Stack role="group" :data-testid="props['data-testid']" :class="classNames">
    <slot />
  </Stack>
</template>
