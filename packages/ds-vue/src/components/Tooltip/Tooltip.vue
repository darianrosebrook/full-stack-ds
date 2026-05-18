<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useTooltip, provideTooltipContext } from "./useTooltip.js";
// @generated:end
// @custom:start imports

// @custom:end
// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end
// @custom:start types

// @custom:end
// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
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
  closeOnBlur: undefined,
});
// @generated:end
// @generated:start hook
const surface = useTooltip({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
  disabled: () => props.disabled === true,
  closeOnEscape: () => props.closeOnEscape !== false,
  closeOnBlur: () => props.closeOnBlur !== false,
});
provideTooltipContext({
  open: surface.open,
  contentId: surface.contentId,
  registerAnchor: surface.registerAnchor,
  registerAnchorRefOnly: surface.registerAnchorRefOnly,
  registerContent: surface.registerContent,
  getTriggerHandlers: surface.getTriggerHandlers,
  triggerProps: surface.triggerProps,
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
  <span :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </span>
</template>
<!-- openTriggers: ["hover","focus"] | anchorRelation: describedby -->