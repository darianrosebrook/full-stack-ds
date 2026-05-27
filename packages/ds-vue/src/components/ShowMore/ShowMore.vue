<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useShowMore } from "./useShowMore.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  maxLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  expanded: undefined,
  defaultExpanded: undefined,
  maxLines: 3,
  showMoreLabel: "Show more",
  showLessLabel: "Show less",
});
// @generated:end

// @generated:start hook
const behavior = useShowMore({
  expanded: () => props.expanded,
  defaultExpanded: props.defaultExpanded,
  onExpandedChange: props.onExpandedChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "show-more",
  behavior.expanded.value ? "show-more--expanded" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props['data-testid']">
    <div :class="'show-more__content'" :style="{ '--fsds-show-more-content-max-lines': props.maxLines }">
      <slot />
    </div>
    <button :class="'show-more__trigger'" type="button" @click="() => behavior.setExpanded(!behavior.expanded.value)" :aria-expanded="behavior.expanded.value">
      {{ props.showMoreLabel }}
    </button>
  </div>
</template>
