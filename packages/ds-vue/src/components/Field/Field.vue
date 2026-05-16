<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
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
  onChange?: (value: unknown) => void;
  validate?: ((value: unknown, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  label?: unknown;
  helpText?: unknown;
  error?: string;
  status?: FieldStatus;
  validating?: boolean;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
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
      <label v-if="props.label" :class="'field__label'">
        <slot />
      </label>
    </div>
    <div :class="'field__control'">
      <slot />
    </div>
    <div :class="'field__meta'">
      <span v-if="props.helpText" :class="'field__help'"></span>
      <span v-if="props.error" :class="'field__error'"></span>
      <span v-if="props.validating" :class="'field__validatingIndicator'"></span>
    </div>
  </div>
</template>
