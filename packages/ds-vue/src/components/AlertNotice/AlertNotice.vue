<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "danger" | "error";
export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  status?: AlertNoticeStatus;
  level?: AlertNoticeLevel;
  dismissible?: boolean;
  icon?: unknown;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
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
  <Stack role="alert" :data-testid="props['data-testid']" :class="classNames">
    <slot />
  </Stack>
</template>
