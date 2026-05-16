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
  ariaLabel?: string;
  separator?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  ariaLabel: "Breadcrumb",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "breadcrumbs",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <nav :class="classNames" :aria-label="props.ariaLabel" :data-testid="props['data-testid']">
    <ol :class="'breadcrumbs__list'">
      <slot />
    </ol>
  </nav>
</template>
