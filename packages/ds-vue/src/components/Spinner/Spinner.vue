<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerVariant = "ring" | "dots" | "bars";
export type SpinnerThickness = "hairline" | "regular" | "bold";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  thickness?: SpinnerThickness;
  ariaHidden?: boolean;
  label?: string;
  inline?: boolean;
  showAfterMs?: number;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "spinner",
  props.size ? `spinner--${props.size}` : null,
  props.variant ? `spinner--${props.variant}` : null,
  props.thickness ? `spinner--${props.thickness}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="status" :data-testid="props['data-testid']">
    <span :class="'spinner__visual'" aria-hidden="true"></span>
  </div>
</template>
