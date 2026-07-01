<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useCheckbox } from "./useCheckbox.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CheckboxSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  size?: CheckboxSize;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  size: "md",
  checked: undefined,
  defaultChecked: undefined,
  indeterminate: undefined,
  disabled: undefined,
});
// @generated:end

// @generated:start hook
const behavior = useCheckbox({
  checked: () => props.checked,
  defaultChecked: props.defaultChecked,
  onChange: props.onChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "checkbox",
  props.size ? `checkbox--${props.size}` : null,
  behavior.checked.value ? "checkbox--checked" : null,
  props.disabled ? "checkbox--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <input :class="classNames" type="checkbox" @change="(e) => behavior.setChecked((e.target as HTMLInputElement).checked)" :checked="behavior.checked.value" :disabled="props.disabled" :name="props.name" :value="props.value" :aria-checked="(props.indeterminate ? 'mixed' : behavior.checked.value)" :indeterminate="props.indeterminate" role="checkbox" :data-testid="props['data-testid']" />
</template>
