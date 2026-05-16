<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  class?: string;
  "data-testid"?: string;
}

const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() =>
  ["alert-notice__title", props.class].filter(Boolean).join(" "),
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <Stack as="h3" :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </Stack>
</template>
