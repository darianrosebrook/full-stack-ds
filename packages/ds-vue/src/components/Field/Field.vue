<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useField } from "./useField.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type FieldStatus = "idle" | "validating" | "valid" | "invalid";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  name: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
  validate?: ((value: unknown, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  status?: FieldStatus;
  validating?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  validating: undefined,
});
// @generated:end

// @generated:start hook
const behavior = useField({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onChange: props.onChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "field",
  props.status ? `field--${props.status}` : null,
  props.disabled ? "field--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="group" :data-testid="props['data-testid']">
    <div :class="'field__header'">
      <label :class="'field__label'">
        <slot name="label" />
      </label>
    </div>
    <div :class="'field__control'">
      <slot name="control" />
    </div>
    <div :class="'field__meta'">
      <span :class="'field__help'">
        <slot name="help" />
      </span>
      <span :class="'field__error'">
        <slot name="error" />
      </span>
      <span v-if="props.validating" :class="'field__validatingIndicator'">
        <slot name="validatingIndicator" />
      </span>
    </div>
  </div>
</template>
