<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ButtonSize = "small" | "medium" | "large";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "outline";
export type ButtonType = "button" | "submit" | "reset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  size?: ButtonSize;
  variant?: ButtonVariant;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  title?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  size: "medium",
  variant: "primary",
  type: "button",
  loading: undefined,
  disabled: undefined,
  ariaExpanded: undefined,
  ariaPressed: undefined,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "button",
  props.size ? `button--${props.size}` : null,
  props.variant ? `button--${props.variant}` : null,
  props.disabled ? "button--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <button :class="classNames" :type="props.type" :disabled="props.disabled" :aria-label="props.ariaLabel" :aria-expanded="props.ariaExpanded" :aria-pressed="props.ariaPressed" :aria-busy="props.loading" :data-testid="props['data-testid']">
    <slot />
  </button>
</template>
