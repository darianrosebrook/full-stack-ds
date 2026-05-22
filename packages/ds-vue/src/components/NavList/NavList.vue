<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type NavListOrientation = "vertical" | "horizontal";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  orientation?: NavListOrientation;
  ariaLabel?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  orientation: "vertical",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "nav-list",
  props.orientation ? `nav-list--${props.orientation}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <nav :class="classNames" :aria-label="props.ariaLabel" :data-testid="props['data-testid']">
    <ul :class="'nav-list__list'">
      <slot />
    </ul>
  </nav>
</template>
