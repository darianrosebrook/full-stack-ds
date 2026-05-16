<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  showAutoCycle?: boolean;
  showDensity?: boolean;
  showFonts?: boolean;
  compact?: boolean;
  sticky?: boolean;
  enableKeyboard?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  showAutoCycle: false,
  showDensity: false,
  showFonts: false,
  compact: false,
  sticky: false,
  enableKeyboard: true,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "brand-switcher",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </div>
</template>
