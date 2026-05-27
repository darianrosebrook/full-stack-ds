<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";
export type LinkSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  href?: string;
  target?: LinkTarget;
  rel?: string;
  size?: LinkSize;
  disabled?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  disabled: undefined,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "links",
  props.size ? `links--${props.size}` : null,
  props.disabled ? "links--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <a :class="classNames" :href="props.href" :target="props.target" :rel="props.rel" :data-testid="props['data-testid']">
    <slot />
  </a>
</template>
