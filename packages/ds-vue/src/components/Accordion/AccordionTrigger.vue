<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useAccordionContext } from "./useAccordion.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  value: string;
  class?: string;
  "data-testid"?: string;
}

const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const ctx = useAccordionContext();

const isOpen = computed(() => ctx.isItemOpen(props.value));

const classNames = computed(() =>
  [
    "accordion__trigger",
    isOpen.value && "accordion__trigger--open",
    props.class,
  ]
    .filter(Boolean)
    .join(" "),
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <h3 class="accordion__header">
    <button
      type="button"
      :class="classNames"
      data-disclosure-trigger
      :data-value="props.value"
      :id="`${ctx.idBase}-trigger-${props.value}`"
      :aria-controls="`${ctx.idBase}-content-${props.value}`"
      :aria-expanded="isOpen"
      :disabled="ctx.disabled"
      :data-testid="props['data-testid']"
      @click="ctx.toggleItem(props.value)"
    >
      <slot />
      <span class="accordion__chevron"></span>
    </button>
  </h3>
</template>
