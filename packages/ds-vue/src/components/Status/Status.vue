<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatusIntent = "info" | "success" | "warning" | "danger" | "error";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  status: StatusIntent;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "status",
  props.status ? `status--${props.status}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <span :class="classNames" :data-testid="props['data-testid']">
    <span :class="'status__icon'" aria-hidden="true"></span>
    <span :class="'status__label'">
      <slot />
    </span>
  </span>
</template>
