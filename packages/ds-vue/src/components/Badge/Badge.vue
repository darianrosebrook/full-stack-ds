<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type BadgeVariant = "default" | "status" | "counter" | "tag";
export type BadgeIntent = "info" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  variant?: BadgeVariant;
  intent?: BadgeIntent;
  size?: BadgeSize;
  icon?: unknown;
  showStatusIcon?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  showStatusIcon: undefined,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "badge",
  props.variant ? `badge--${props.variant}` : null,
  props.intent ? `badge--${props.intent}` : null,
  props.size ? `badge--${props.size}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <span :class="classNames" :data-testid="props['data-testid']">
    <span v-if="props.icon" :class="'badge__icon'" aria-hidden="true"></span>
    <span :class="'badge__content'">
      <slot />
    </span>
  </span>
</template>
