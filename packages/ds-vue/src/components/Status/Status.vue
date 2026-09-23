<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import Icon from "../Icon/Icon.vue";
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
  dataTestid?: string;
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
  <span :class="classNames" :data-testid="props.dataTestid" data-fsds-component="status" data-fsds-box="">
    <Icon :class="'status__icon'" size="sm" :name="(props.status === 'info' ? 'info' : (props.status === 'success' ? 'check' : (props.status === 'warning' ? 'triangle-alert' : (props.status === 'danger' ? 'triangle-alert' : 'triangle-alert'))))" />
    <span :class="'status__label'">
      <slot />
    </span>
  </span>
</template>
