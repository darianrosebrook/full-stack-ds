<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertIntent = "info" | "success" | "warning" | "danger";
export type AlertLevel = "inline" | "section" | "page";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  intent?: AlertIntent;
  level?: AlertLevel;
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
  "alert",
  props.intent ? `alert--${props.intent}` : null,
  props.level ? `alert--${props.level}` : null,
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
