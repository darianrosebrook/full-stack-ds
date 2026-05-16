<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { usePopover } from "./usePopover.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type PopoverTriggerStrategy = "click" | "hover";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  triggerStrategy?: PopoverTriggerStrategy;
  offset?: number;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  anchor?: HTMLElement | null;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  placement: "auto",
  triggerStrategy: "click",
  offset: 8,
});
// @generated:end

// @generated:start hook
const behavior = usePopover({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
  closeOnEscape: props.closeOnEscape,
  closeOnOutsideClick: props.closeOnOutsideClick,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "popover",
  props.placement ? `popover--${props.placement}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props['data-testid']">
    <button :class="'popover__trigger'" type="button" aria-haspopup="true" :aria-expanded="behavior.open.value" aria-controls="popover-content">
      <slot />
    </button>
    <div v-if="behavior.open.value" :class="'popover__content'" id="popover-content">
      <slot />
    </div>
  </div>
</template>
