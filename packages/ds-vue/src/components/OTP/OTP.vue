<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useOTP } from "./useOTP.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type OTPMode = "numeric" | "alphanumeric";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  mode?: OTPMode;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  length: 6,
  mode: "numeric",
  disabled: undefined,
  readOnly: undefined,
  label: "One-time password",
});
// @generated:end

// @generated:start hook
const behavior = useOTP({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onChange: props.onChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "otp",
  props.mode ? `otp--${props.mode}` : null,
  props.disabled ? "otp--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="group" :aria-label="props.label" aria-describedby="otp-error-id" :data-testid="props['data-testid']">
    <div :class="'otp__group'">
      <input v-for="(_, index) in Array(props.length)" :key="index" :class="'otp__field'" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="1" @input="(e) => behavior.setValue(String(behavior.value.value ?? '').padEnd(index, ' ').slice(0, index) + String((e.target as HTMLInputElement).value ?? '').slice(-1) + String(behavior.value.value ?? '').slice(index + 1))" :disabled="props.disabled" :aria-readonly="props.readOnly" :data-otp-index="index" />
    </div>
  </div>
</template>
