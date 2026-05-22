<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "error";
export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  status?: AlertNoticeStatus;
  level?: AlertNoticeLevel;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  icon?: unknown;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  dismissLabel: "Dismiss",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "alert-notice",
  props.status ? `alert-notice--${props.status}` : null,
  props.level ? `alert-notice--${props.level}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="alert" :data-testid="props['data-testid']">
    <span v-if="props.icon" :class="'alert-notice__icon'" aria-hidden="true">
      {{ props.icon }}
    </span>
    <slot />
    <button v-if="props.dismissible" :class="'alert-notice__dismiss'" type="button" @click="props.onDismiss?.()" :aria-label="props.dismissLabel"></button>
  </div>
</template>
