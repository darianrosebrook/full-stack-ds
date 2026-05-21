<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  ariaLabel?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "shuttle",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @generated:start events
function handleRootChange(event: Event) {
  props.onValueChange?.([]);
}
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <Stack role="listbox" @change="handleRootChange" :data-testid="props['data-testid']" :class="classNames">
    <slot />
  </Stack>
</template>
