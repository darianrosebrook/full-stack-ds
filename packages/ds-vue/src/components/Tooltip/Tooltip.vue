<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useTooltip } from "./useTooltip.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type TooltipTrigger = "hover" | "focus" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  content: unknown;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger;
  delay?: number;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  trigger: "hover",
  closeOnEscape: true,
  closeOnBlur: true,
});
// @generated:end

// @generated:start hook
const behavior = useTooltip({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
  closeOnEscape: props.closeOnEscape,
  closeOnBlur: props.closeOnBlur,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "tooltip",
  props.placement ? `tooltip--${props.placement}` : null,
  props.disabled ? "tooltip--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div v-if="behavior.open.value" :class="classNames" role="tooltip" :data-testid="props['data-testid']">
    <slot />
  </div>
</template>
