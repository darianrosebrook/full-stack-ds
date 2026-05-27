<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  thickness?: string;
  title?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  decorative: undefined,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "divider",
  props.orientation ? `divider--${props.orientation}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <hr :class="classNames" role="separator" :data-testid="props['data-testid']" />
</template>
