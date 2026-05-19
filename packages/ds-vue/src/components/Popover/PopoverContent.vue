<script setup lang="ts">
// @generated:start imports
import { usePopoverContext } from "./usePopover.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start defineOptions
// Conditional render via v-if disables Vue's automatic attribute
// fallthrough; we apply $attrs explicitly on the rendered host.
defineOptions({ inheritAttrs: false });
// @generated:end

// @generated:start ctx
const ctx = usePopoverContext();
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div
    v-if="ctx.open.value"
    :ref="ctx.registerContent"
    :id="ctx.contentId"
    data-popover-content
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
