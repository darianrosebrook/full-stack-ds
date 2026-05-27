<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useShuttle } from "./useShuttle.js";
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
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  defaultValue: () => (["alpha","beta","gamma"]),
});
// @generated:end

// @generated:start hook
const behavior = useShuttle({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onValueChange: props.onValueChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "shuttle",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <ul :class="classNames" role="listbox" :aria-label="props.ariaLabel" :data-testid="props['data-testid']">
    <li v-for="(item, index) in (behavior.selection.value ?? [])" :key="index" :class="'shuttle__item'" role="option">
      <span>
        {{ item }}
      </span>
    </li>
  </ul>
</template>
