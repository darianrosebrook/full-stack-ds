<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useFieldAssociation } from "../../primitives/index.js";
import { useInput } from "./useInput.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  disabled: undefined,
  invalid: undefined,
  required: undefined,
});
// @generated:end

// @generated:start hook
const behavior = useInput({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onChange: props.onChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "input",
  props.disabled ? "input--disabled" : null,
  props.invalid ? "input--invalid" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @generated:start fieldAssociation
const fieldAssociation = useFieldAssociation();
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <input :class="classNames" @change="(e) => behavior.setValue((e.target as HTMLInputElement).value)" :value="behavior.value.value" :disabled="props.disabled" :aria-invalid="props.invalid" :type="props.type" :placeholder="props.placeholder" :name="props.name" :required="props.required" role="textbox" :data-testid="props['data-testid']" :id="fieldAssociation?.controlId" :aria-describedby="fieldAssociation?.describedBy" />
</template>
