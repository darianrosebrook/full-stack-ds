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
  responsive?: boolean;
  ariaLabel?: string;
  class?: string;
  dataTestid?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  responsive: undefined,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "table",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props.dataTestid" data-fsds-component="table" data-fsds-box="">
    <table :class="'table__container'" :aria-label="props.ariaLabel">
      <slot />
    </table>
  </div>
</template>
