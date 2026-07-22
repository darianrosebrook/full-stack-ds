<script setup lang="ts">
// @generated:start imports
import { useTooltipContext } from "./useTooltip.js";
import { useAnchoredPosition, type AnchoredPlacement } from "../../primitives/surfaces/useAnchoredPosition.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start defineOptions
// Conditional render via v-if disables Vue's automatic attribute
// fallthrough; we apply $attrs explicitly on the rendered host.
defineOptions({ inheritAttrs: false });
// @generated:end

// @generated:start ctx
const ctx = useTooltipContext();
const position = useAnchoredPosition({
  anchor: () => ctx.anchorEl.value,
  content: () => ctx.contentEl.value,
  open: () => ctx.open.value,
  placement: () => (ctx.placement.value ?? "auto") as AnchoredPlacement | "auto",
  collision: () => "flip-shift",
});
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <Teleport to="body">
    <div
      v-if="ctx.open.value"
      :ref="ctx.registerContent"
      :id="ctx.contentId"
      role="tooltip"
      :style="{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        visibility: position.ready ? 'visible' : 'hidden',
      }"
      :data-placement="position.placement"
      data-tooltip-content
      v-bind="$attrs"
    >
      <slot />
    </div>
  </Teleport>
</template>
