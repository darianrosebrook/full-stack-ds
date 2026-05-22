<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useTextField } from "./useTextField.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  label?: unknown;
  description?: unknown;
  error?: unknown;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ariaDescribedby?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start hook
const behavior = useTextField({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onChange: props.onChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "text-field",
  props.invalid ? "text-field--invalid" : null,
  props.disabled ? "text-field--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props['data-testid']">
    <label v-if="props.label" :class="'text-field__label'">
      <slot />
    </label>
    <input :class="'text-field__field'" @change="(e) => behavior.setValue((e.target as HTMLInputElement).value)" :type="props.type" :value="behavior.value.value" :disabled="props.disabled" :name="props.name" :required="props.required" :aria-invalid="props.invalid" :aria-describedby="props.ariaDescribedby" />
    <span v-if="props.description" :class="'text-field__description'">
      <slot />
    </span>
    <span v-if="props.error" :class="'text-field__error'" role="alert">
      <slot />
    </span>
  </div>
</template>
