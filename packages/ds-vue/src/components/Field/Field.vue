<script setup lang="ts">
// @generated:start imports
import { computed, useId, useSlots } from "vue";
import { provideFieldAssociation } from "../../primitives/index.js";
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
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  validate?: ((value: string, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
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

// @generated:start fieldAssociation
const instanceId = useId();
const slots = useSlots();
const fieldAssociationValue = computed(() => ({
  controlId: `${instanceId}-control`,
  describedBy: [slots.help && props.status !== 'invalid' ? `${instanceId}-help` : null, slots.error && props.status === 'invalid' ? `${instanceId}-error` : null].filter(Boolean).join(' ') || undefined,
}));
provideFieldAssociation(fieldAssociationValue);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="group" :data-testid="props['data-testid']">
    <div :class="'field__header'">
      <label :class="'field__label'" :for="`${instanceId}-control`">
        <slot name="label" />
      </label>
    </div>
    <div :class="'field__control'">
      <slot name="control" />
    </div>
    <div :class="'field__meta'">
      <span :class="'field__help'" :id="`${instanceId}-help`">
        <slot name="help" />
      </span>
      <span :class="'field__error'" :id="`${instanceId}-error`">
        <slot name="error" />
      </span>
      <span v-if="props.validating" :class="'field__validatingIndicator'">
        <slot name="validatingIndicator" />
      </span>
    </div>
  </div>
</template>
