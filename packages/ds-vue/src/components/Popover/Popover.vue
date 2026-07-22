<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { usePopover, providePopoverContext } from "./usePopover.js";
// @generated:end
// @custom:start imports

// @custom:end
// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end
// @custom:start types

// @custom:end
// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnBlur?: boolean;
  class?: string;
  "data-testid"?: string;
}
// Vue runtime coerces unpassed Boolean props to `false` by
// default; `withDefaults` with `undefined` keeps the
// "controlled vs uncontrolled" distinction the substrate needs.
const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: undefined,
  disabled: undefined,
  closeOnEscape: undefined,
  closeOnOutsideClick: undefined,
  closeOnBlur: undefined,
});
// @generated:end
// @generated:start hook
const surface = usePopover({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
  disabled: () => props.disabled === true,
  closeOnEscape: () => props.closeOnEscape !== false,
  closeOnOutsideClick: () => props.closeOnOutsideClick !== false,
  closeOnBlur: () => props.closeOnBlur !== false,
});
providePopoverContext({
  open: surface.open,
  contentId: surface.contentId,
  registerAnchor: surface.registerAnchor,
  registerAnchorRefOnly: surface.registerAnchorRefOnly,
  registerContent: surface.registerContent,
  getTriggerHandlers: surface.getTriggerHandlers,
  triggerProps: surface.triggerProps,
  anchorEl: surface.anchorEl,
  contentEl: surface.contentEl,
  placement: computed(() => props.placement),
});
// @generated:end
// @generated:start classes
const classNames = computed(() => [
  "popover",
  props.placement ? `popover--${props.placement}` : null,
  props.disabled ? "popover--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end
// @custom:start trailing

// @custom:end
</script>
<template>
  <span :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </span>
</template>
<!-- openTriggers: ["click"] | anchorRelation: controls-expanded -->