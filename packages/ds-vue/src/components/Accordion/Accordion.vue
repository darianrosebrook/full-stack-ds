<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useAccordion } from "./useAccordion.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AccordionType = "single" | "multiple";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  disabled?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  type: "single",
  collapsible: false,
});
// @generated:end

// @generated:start hook
const behavior = useAccordion({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onValueChange: props.onValueChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "accordion",
  props.type ? `accordion--${props.type}` : null,
  props.disabled ? "accordion--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props['data-testid']">
    <div :class="'accordion__item'">
      <h3 :class="'accordion__header'">
        <button :class="'accordion__trigger'" type="button" :aria-expanded="behavior.openness.value === undefined ? undefined : Boolean(behavior.openness.value)">
          <slot />
          <span :class="'accordion__chevron'"></span>
        </button>
      </h3>
      <div :class="'accordion__content'">
        <div :class="'accordion__contentInner'">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
