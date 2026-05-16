<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ChipType = "button" | "submit" | "reset";
export type ChipVariant = "default" | "selected" | "dismissible";
export type ChipSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  type?: ChipType;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  icon?: unknown;
  title?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "chip",
  props.variant ? `chip--${props.variant}` : null,
  props.size ? `chip--${props.size}` : null,
  props.disabled ? "chip--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <button :class="classNames" :type="props.type" :disabled="props.disabled" :aria-label="props.ariaLabel" :aria-expanded="props.ariaExpanded" :aria-pressed="props.ariaPressed" :data-testid="props['data-testid']">
    <span v-if="props.icon" :class="'chip__icon'" aria-hidden="true"></span>
    <span :class="'chip__text'">
      <slot />
    </span>
  </button>
</template>
