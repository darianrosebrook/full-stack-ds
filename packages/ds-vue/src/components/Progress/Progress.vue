<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ProgressVariant = "linear" | "circular";
export type ProgressSize = "sm" | "md" | "lg";
export type ProgressIntent = "info" | "success" | "warning" | "danger";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  value?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  intent?: ProgressIntent;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  showValue: undefined,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "progress",
  props.variant ? `progress--${props.variant}` : null,
  props.size ? `progress--${props.size}` : null,
  props.intent ? `progress--${props.intent}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="progressbar" :aria-valuenow="props.value" aria-valuemin="0" aria-valuemax="100" :aria-label="props.label" :data-testid="props['data-testid']">
    <span :class="'progress__track'" aria-hidden="true">
      <span :class="'progress__fill'" :style="{ '--fsds-progress-fill-width': props.value }"></span>
    </span>
    <span v-if="props.showValue" :class="'progress__value'">
      <slot />
    </span>
  </div>
</template>
