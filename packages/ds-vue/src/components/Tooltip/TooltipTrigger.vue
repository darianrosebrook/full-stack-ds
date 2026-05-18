<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useTooltipContext } from "./useTooltip.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start defineOptions
// Multi-root template (v-if asChild / v-else button) disables Vue's
// automatic attribute fallthrough; we apply $attrs explicitly to the
// rendered host below.
defineOptions({ inheritAttrs: false });
// @generated:end

// @generated:start props
interface Props {
  /** When true, the consumer takes over the host element via
   *  the default slot's `triggerProps` bindings. When false
   *  (the default), a `<button>` is rendered. */
  asChild?: boolean;
}

const props = defineProps<Props>();
// @generated:end

// @generated:start ctx
const ctx = useTooltipContext();

/** Default-host path needs the listener-installing ref. The
 *  triggerProps bag carries the listener-skipping ref (for the
 *  slot-props host-adoption path), so we omit it here and pass
 *  registerAnchor via :ref. The rest of the bag (aria, data,
 *  handlers — none of which the default-host needs since the
 *  controller wires them as DOM listeners) is also omitted to
 *  avoid double-firing. */
const defaultHostAriaAndData = computed(() => {
  const { ref: _ref, ...rest } = ctx.triggerProps.value;
  return {
    "aria-describedby": rest["aria-describedby"],
    "aria-controls": rest["aria-controls"],
    "aria-expanded": rest["aria-expanded"],
    "aria-labelledby": rest["aria-labelledby"],
    "data-tooltip-trigger": rest["data-tooltip-trigger"],
  };
});
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <template v-if="props.asChild">
    <slot :triggerProps="ctx.triggerProps.value" />
  </template>
  <button
    v-else
    type="button"
    :ref="ctx.registerAnchor"
    v-bind="{ ...$attrs, ...defaultHostAriaAndData }"
  >
    <slot />
  </button>
</template>
