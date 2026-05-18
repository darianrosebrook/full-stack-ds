<script setup lang="ts">
// @generated:start imports
import { useTooltipContext } from "./useTooltip.js";
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
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div
    v-if="ctx.open.value"
    :ref="ctx.registerContent"
    :id="ctx.contentId"
    role="tooltip"
    data-tooltip-content
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
