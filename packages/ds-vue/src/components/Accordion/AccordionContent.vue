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
  ["accordion__content", props.class].filter(Boolean).join(" "),
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div
    role="region"
    :class="classNames"
    :id="`${ctx.idBase}-content-${props.value}`"
    :aria-labelledby="`${ctx.idBase}-trigger-${props.value}`"
    :hidden="!isOpen ? true : undefined"
    :data-testid="props['data-testid']"
  >
    <div class="accordion__contentInner">
      <slot />
    </div>
  </div>
</template>
