<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  class?: string;
  "data-testid"?: string;
  id?: string;
  style?: string;
  colSpan?: number;
  rowSpan?: number;
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const classNames = computed(() =>
  ["table__headerCell", props.class].filter(Boolean).join(" "),
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <th :class="classNames" :data-testid="props['data-testid']" :id="props.id" :style="props.style" :colspan="props.colSpan" :rowspan="props.rowSpan" :scope="props.scope">
    <slot />
  </th>
</template>
