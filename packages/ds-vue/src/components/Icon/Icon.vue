<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type IconDefinition = { iconName: string; prefix?: string; icon?: unknown };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  icon: IconDefinition;
  width?: number;
  height?: number;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  width: 20,
  height: 20,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "icon",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <span :class="classNames" aria-hidden="true" :data-testid="props['data-testid']"></span>
</template>
