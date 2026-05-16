<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useToggleSwitch } from "./useToggleSwitch.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToggleSwitchSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ToggleSwitchSize;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedby?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  size: "medium",
});
// @generated:end

// @generated:start hook
const behavior = useToggleSwitch({
  checked: () => props.checked,
  defaultChecked: props.defaultChecked,
  onChange: props.onChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "toggle-switch",
  props.size ? `toggle-switch--${props.size}` : null,
  behavior.checked.value ? "toggle-switch--checked" : null,
  props.disabled ? "toggle-switch--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <button :class="classNames" type="button" :aria-checked="behavior.checked.value" :aria-label="props.ariaLabel" :aria-describedby="props.ariaDescribedby" :disabled="props.disabled" @click="() => behavior.setChecked(!behavior.checked.value)" role="switch" :data-testid="props['data-testid']"></button>
</template>
